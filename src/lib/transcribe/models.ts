// models.ts — モデル選択UI・進捗集計が参照するモデル定義（純粋ロジック・DOM 非依存）
//
// 取得先・ファイル・サイズ・SHA-256 の正本は model-manifest.ts（自動生成）。
// ここでは「どのファイルがどのデバイスで実際に読まれるか」と表示用メタデータだけを扱う。

import { MODEL_PEAK_MEMORY_BYTES } from './audio-core.ts';
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
