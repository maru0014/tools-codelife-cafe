// audio-core.ts — 音声前処理の純粋ロジック（DOM 非依存）
//
// Whisper は 16kHz モノラルの Float32 PCM を入力に取る。ここではデコード済みの
// チャンネルデータからそれを作る処理と、v1 の安全弁（長さ・メモリの事前判定）を担う。
// AudioContext / decodeAudioData / loadedmetadata に依存する処理は audio-browser.ts。

import type { ModelId } from './model-manifest.ts';
import type { ErrorCode, TranscribeDevice } from './protocol.ts';

/** Whisper が要求するサンプルレート */
export const TARGET_SAMPLE_RATE = 16000;

/** v1 の安定対象。全量デコード方式のため 15 分を上限とする（60分級は v1.1） */
export const MAX_DURATION_SEC = 15 * 60;

/** 端末メモリのうち、この割合までしか使わない前提で見積もる */
const MEMORY_BUDGET_RATIO = 0.6;

/** 見積もりに上乗せする安全マージン（ランタイム・中間テンソル・GC の余裕） */
const DEFAULT_SAFETY_MARGIN_BYTES = 256 * 1024 * 1024;

/** モデル・デバイス別のピークメモリ概算（バイト）。マニフェストの実サイズ + 実行時オーバーヘッド */
export const MODEL_PEAK_MEMORY_BYTES: Record<
	ModelId,
	Record<TranscribeDevice, number>
> = {
	tiny: { wasm: 220 * 1024 * 1024, webgpu: 300 * 1024 * 1024 },
	base: { wasm: 400 * 1024 * 1024, webgpu: 560 * 1024 * 1024 },
	small: { wasm: 1100 * 1024 * 1024, webgpu: 1500 * 1024 * 1024 },
};

/**
 * 複数チャンネルをモノラルへダウンミックスする（全チャンネルの単純平均）。
 * チャンネル長が異なる場合は最長に合わせ、不足分は 0 として扱う。
 */
export function downmixToMono(channels: readonly Float32Array[]): Float32Array {
	if (channels.length === 0) return new Float32Array(0);
	if (channels.length === 1) return Float32Array.from(channels[0]);

	let length = 0;
	for (const channel of channels) length = Math.max(length, channel.length);

	const out = new Float32Array(length);
	for (let i = 0; i < length; i++) {
		let sum = 0;
		for (const channel of channels) sum += i < channel.length ? channel[i] : 0;
		out[i] = sum / channels.length;
	}
	return out;
}

/**
 * 線形補間でリサンプルする。
 * Whisper の入力（16kHz）へ落とす用途では、帯域制限フィルタ無しの線形補間で実用上十分。
 */
export function resampleLinear(
	input: Float32Array,
	inputRate: number,
	outputRate: number,
): Float32Array {
	if (input.length === 0) return new Float32Array(0);
	if (inputRate === outputRate) return input;

	const ratio = outputRate / inputRate;
	const outLength = Math.max(0, Math.round(input.length * ratio));
	const out = new Float32Array(outLength);
	const last = input.length - 1;
	for (let i = 0; i < outLength; i++) {
		const pos = i / ratio;
		const index = Math.floor(pos);
		const frac = pos - index;
		const a = input[Math.min(index, last)];
		const b = input[Math.min(index + 1, last)];
		out[i] = a + (b - a) * frac;
	}
	return out;
}

/** デコード済みチャンネル群を Whisper 入力（16kHz モノラル）へ変換する。 */
export function toMono16k(
	channels: readonly Float32Array[],
	sampleRate: number,
): Float32Array {
	return resampleLinear(
		downmixToMono(channels),
		sampleRate,
		TARGET_SAMPLE_RATE,
	);
}

// ---------------------------------------------------------------------------
// 事前判定（処理を始める前に安全に止める）
// ---------------------------------------------------------------------------

export type DurationAssessment =
	| { ok: true }
	| {
			ok: false;
			code: Extract<ErrorCode, 'file-too-long' | 'decode-failed'>;
			message: string;
	  };

/** 音声の長さが v1 の対象範囲かを判定する。デコード前後の両方で呼ぶ。 */
export function assessDuration(durationSec: number): DurationAssessment {
	if (!Number.isFinite(durationSec) || durationSec <= 0) {
		return {
			ok: false,
			code: 'decode-failed',
			message:
				'音声の長さを取得できませんでした。ファイルが破損している可能性があります。',
		};
	}
	if (durationSec > MAX_DURATION_SEC) {
		const minutes = Math.floor(durationSec / 60);
		const seconds = Math.round(durationSec % 60);
		return {
			ok: false,
			code: 'file-too-long',
			message: `音声が ${minutes}分${seconds}秒 あります。現在のバージョンは 15分以内 の音声を対象としています。`,
		};
	}
	return { ok: true };
}

/** デコード済み PCM が占めるバイト数（秒 × サンプルレート × チャンネル × 4） */
export function estimateDecodedBytes(
	durationSec: number,
	sampleRate: number,
	channels: number,
): number {
	return Math.max(0, durationSec * sampleRate * channels * 4);
}

export type PeakMemoryInput = {
	durationSec: number;
	sampleRate: number;
	channels: number;
	/** モデル・デバイス別のピークメモリ概算 */
	modelPeakBytes: number;
	safetyMarginBytes?: number;
};

/** 処理中のピークメモリを見積もる（デコード済み + 16kHz PCM + モデル + 安全マージン）。 */
export function estimatePeakMemoryBytes(input: PeakMemoryInput): number {
	const decoded = estimateDecodedBytes(
		input.durationSec,
		input.sampleRate,
		input.channels,
	);
	const pcm16k = Math.max(0, input.durationSec * TARGET_SAMPLE_RATE * 4);
	const margin = input.safetyMarginBytes ?? DEFAULT_SAFETY_MARGIN_BYTES;
	return decoded + pcm16k + input.modelPeakBytes + margin;
}

export type MemoryAssessment =
	| { level: 'ok' }
	| { level: 'warn'; message: string }
	| { level: 'stop'; code: Extract<ErrorCode, 'memory-risk'>; message: string };

export type MemoryAssessmentInput = {
	estimatedBytes: number;
	/** navigator.deviceMemory（GB）。取得不能なら null。補助情報としてのみ使う */
	deviceMemoryGb: number | null;
	modelId: ModelId;
	device: TranscribeDevice;
};

/**
 * メモリ安全性を判定する。
 * `navigator.deviceMemory` は補助情報に限定し、取得不能な場合でも
 * small × WASM のような明確に危険な組み合わせには強い警告を出す。
 */
export function assessMemory(input: MemoryAssessmentInput): MemoryAssessment {
	const { estimatedBytes, deviceMemoryGb, modelId, device } = input;

	if (deviceMemoryGb !== null && deviceMemoryGb <= 4 && modelId === 'small') {
		return {
			level: 'stop',
			code: 'memory-risk',
			message:
				'この端末（メモリ 4GB 以下）で「高精度（small）」を実行すると、途中で強制終了する可能性が高いです。tiny または base を選んでください。',
		};
	}

	const budgetBytes =
		deviceMemoryGb !== null
			? deviceMemoryGb * 1024 ** 3 * MEMORY_BUDGET_RATIO
			: null;

	if (budgetBytes !== null && estimatedBytes > budgetBytes) {
		return {
			level: 'stop',
			code: 'memory-risk',
			message: `必要メモリの見積もり（約 ${formatGb(estimatedBytes)}）が、この端末で安全に使える量を超えています。より小さいモデルを選ぶか、音声を分割してください。`,
		};
	}

	if (deviceMemoryGb === null && modelId === 'small' && device === 'wasm') {
		return {
			level: 'warn',
			message:
				'端末のメモリ量を取得できませんでした。WebGPU が使えない環境で「高精度（small）」を実行すると、途中で強制終了する場合があります。',
		};
	}

	if (budgetBytes !== null && estimatedBytes > budgetBytes * 0.75) {
		return {
			level: 'warn',
			message: `必要メモリの見積もりは約 ${formatGb(estimatedBytes)} です。他のタブを閉じてから実行することをおすすめします。`,
		};
	}

	return { level: 'ok' };
}

function formatGb(bytes: number): string {
	return `${(bytes / 1024 ** 3).toFixed(1)}GB`;
}
