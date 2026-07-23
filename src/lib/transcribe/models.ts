// models.ts — モデル選択UI・進捗集計が参照するモデル定義（純粋ロジック・DOM 非依存）
//
// 取得先・ファイル・サイズ・SHA-256 の正本は model-manifest.ts（自動生成）。
// ここでは「どのファイルがどのデバイスで実際に読まれるか」と表示用メタデータだけを扱う。

import {
	ASSUMED_CHANNELS,
	ASSUMED_SAMPLE_RATE,
	assessMemory,
	estimatePeakMemoryBytes,
	MODEL_PEAK_MEMORY_BYTES,
} from './audio-core.ts';
import {
	type ArtifactFile,
	type DtypeName,
	getModelArtifact,
	MODEL_ARTIFACTS,
	type ModelArtifact,
	type ModelId,
} from './model-manifest.ts';
import type { TranscribeDevice } from './protocol.ts';

/** transformers.js の DEFAULT_DTYPE_SUFFIX_MAPPING と一致させること */
export const DTYPE_SUFFIX: Record<DtypeName, string> = {
	fp32: '',
	fp16: '_fp16',
	int8: '_int8',
	uint8: '_uint8',
	q8: '_quantized',
	q4: '_q4',
	bnb4: '_bnb4',
};

/** 指定デバイスで実際にロードされる ONNX ファイル名（repositoryPath からの相対） */
export function onnxFilePaths(
	artifact: ModelArtifact,
	device: TranscribeDevice,
): string[] {
	const suffix = DTYPE_SUFFIX[artifact.dtype[device]];
	if (suffix === undefined) {
		throw new Error(`未知の dtype です: ${artifact.dtype[device]}`);
	}
	return [
		`onnx/encoder_model${suffix}.onnx`,
		`onnx/decoder_model_merged${suffix}.onnx`,
	];
}

/**
 * 指定デバイスで取得されるファイル一覧。
 * 進捗の加重集計（Content-Length 不明時の分母）とテストの許可リストに使う。
 */
export function requiredFiles(
	artifact: ModelArtifact,
	device: TranscribeDevice,
): ArtifactFile[] {
	const onnx = new Set(onnxFilePaths(artifact, device));
	return artifact.files.filter(
		(f) => !f.path.endsWith('.onnx') || onnx.has(f.path),
	);
}

/** 指定デバイスでの初回ダウンロード量（キャッシュ済みなら発生しない） */
export function downloadBytes(id: ModelId, device: TranscribeDevice): number {
	const artifact = getModelArtifact(id);
	return requiredFiles(artifact, device).reduce((sum, f) => sum + f.bytes, 0);
}

/** モデル・デバイス別のピークメモリ概算 */
export function modelPeakBytes(id: ModelId, device: TranscribeDevice): number {
	return MODEL_PEAK_MEMORY_BYTES[id][device];
}

export function formatBytes(bytes: number): string {
	if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)}GB`;
	return `${Math.round(bytes / 1024 ** 2)}MB`;
}

export type ModelOption = {
	id: ModelId;
	/** カード見出しの短いラベル */
	badge: string;
	name: string;
	description: string;
	/** WebGPU かつメモリ安全判定を通過したときだけ「推奨」表示にする */
	recommendOnlyWithWebGpu: boolean;
};

export const MODEL_OPTIONS: readonly ModelOption[] = [
	{
		id: 'tiny',
		badge: 'まず試す',
		name: 'tiny',
		description:
			'ダウンロードが最も軽く、低スペック端末や短い音声メモ向けです。',
		recommendOnlyWithWebGpu: false,
	},
	{
		id: 'base',
		badge: '標準',
		name: 'base',
		description:
			'精度と速度のバランスが良く、通常利用ではこちらをおすすめします。',
		recommendOnlyWithWebGpu: false,
	},
	{
		id: 'small',
		badge: '高精度',
		name: 'small',
		description:
			'最も精度が高い一方、ダウンロードとメモリの要求が大きいモデルです。',
		recommendOnlyWithWebGpu: true,
	},
];

export type SmallRecommendationInput = {
	device: TranscribeDevice | null;
	/** navigator.deviceMemory（GB）。取得不能なら null */
	deviceMemoryGb: number | null;
	/** 選択中ファイルの長さ（秒）。未選択・取得不能なら null */
	durationSec: number | null;
	/** デコード後に判明した実測値。未デコードなら最悪ケースを使う */
	sampleRate?: number;
	channels?: number;
};

/**
 * small（高精度）を「推奨」表示してよいかを判定する。
 *
 * 正本の条件は「WebGPU対応**かつ**メモリ安全判定通過時のみ推奨」。
 * WebGPU が使えるだけでは推奨しない。安全判定ができない場合
 * （ファイル未選択・長さ不明・deviceMemory 取得不能）は推奨しない＝安全側に倒す。
 *
 * 実行時の memory-risk による停止判定はこれとは別に維持される。
 */
export function isSmallRecommended(input: SmallRecommendationInput): boolean {
	const { device, deviceMemoryGb, durationSec } = input;
	if (device !== 'webgpu') return false;
	// deviceMemory を取得できない環境は「安全と判定できない」ため推奨しない
	if (deviceMemoryGb === null || !Number.isFinite(deviceMemoryGb)) return false;
	if (
		durationSec === null ||
		!Number.isFinite(durationSec) ||
		durationSec <= 0
	) {
		return false;
	}

	const estimatedBytes = estimatePeakMemoryBytes({
		durationSec,
		sampleRate: input.sampleRate ?? ASSUMED_SAMPLE_RATE,
		channels: input.channels ?? ASSUMED_CHANNELS,
		modelPeakBytes: modelPeakBytes('small', device),
	});
	return (
		assessMemory({
			estimatedBytes,
			deviceMemoryGb,
			modelId: 'small',
			device,
		}).level === 'ok'
	);
}

export function getModelOption(id: ModelId): ModelOption {
	const option = MODEL_OPTIONS.find((m) => m.id === id);
	if (!option) throw new Error(`未知のモデルIDです: ${id}`);
	return option;
}

/** モデル選択 UI が表示する一覧（マニフェスト由来のサイズ付き） */
export function listModelChoices(device: TranscribeDevice) {
	return MODEL_ARTIFACTS.map((artifact) => {
		const option = getModelOption(artifact.id);
		return {
			...option,
			bytes: downloadBytes(artifact.id, device),
			sizeLabel: formatBytes(downloadBytes(artifact.id, device)),
		};
	});
}
