// detect.ts — 実行環境の判定（WebGPU / メモリ / ブラウザ対応）
//
// ブラウザ API に触るためユニットテスト対象外。Playwright のブラウザテストで検証する。

import type { TranscribeDevice } from './protocol.ts';

type NavigatorWithGpu = Navigator & {
	gpu?: { requestAdapter: () => Promise<unknown> };
	deviceMemory?: number;
};

/** 文字起こしに最低限必要な API が揃っているか */
export function isBrowserSupported(): boolean {
	if (typeof window === 'undefined') return false;
	const hasAudio =
		typeof window.AudioContext !== 'undefined' ||
		typeof (window as unknown as { webkitAudioContext?: unknown })
			.webkitAudioContext !== 'undefined';
	return (
		typeof WebAssembly !== 'undefined' &&
		typeof Worker !== 'undefined' &&
		typeof Blob !== 'undefined' &&
		hasAudio
	);
}

/**
 * WebGPU が実際に使えるかを判定する。
 * `navigator.gpu` の有無だけでは足りず、アダプタ取得まで確認する
 * （フラグ有効でもアダプタが取れない環境がある）。
 */
export async function detectWebGpu(): Promise<boolean> {
	if (typeof navigator === 'undefined') return false;
	const gpu = (navigator as NavigatorWithGpu).gpu;
	if (!gpu) return false;
	try {
		const adapter = await gpu.requestAdapter();
		return adapter != null;
	} catch {
		return false;
	}
}

/**
 * `navigator.deviceMemory`（GB）。取得できない環境では null。
 * 仕様上これは**補助情報**であり、単独で可否を決めない。
 */
export function getDeviceMemoryGb(): number | null {
	if (typeof navigator === 'undefined') return null;
	const value = (navigator as NavigatorWithGpu).deviceMemory;
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** WebGPU が使えれば webgpu、使えなければ wasm へ自動フォールバックする。 */
export async function resolveDevice(): Promise<TranscribeDevice> {
	return (await detectWebGpu()) ? 'webgpu' : 'wasm';
}
