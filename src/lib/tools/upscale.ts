// upscale.ts — 画像アップスケール / ノイズ除去の Worker ラッパ API
// 純粋ロジックは upscale-core.ts に分離（UI・Worker・テストで共有）。
// ONNX 推論ランタイム（onnxruntime-web）とモデルは Worker 内で遅延ロードされ、
// 初期バンドルには含まれない（/upscale ページでのみ実行時に読み込まれる）。

import type {
	UpscaleWorkerRequest,
	UpscaleWorkerResponse,
} from '@/workers/upscale.worker';
import type { ProgressInfo, UpscaleOptions } from './upscale-core';

// 純粋ロジック・型を再エクスポート（UI / テストはここから import 可能）
export * from './upscale-core';

// --- Worker ラッパ ---
let worker: Worker | null = null;

function getWorker(): Worker {
	if (!worker) {
		worker = new Worker(
			new URL('../../workers/upscale.worker.ts', import.meta.url),
			{ type: 'module' },
		);
	}
	return worker;
}

/** Worker を終了してリソースを解放する。 */
export function terminateWorker(): void {
	if (worker) {
		worker.terminate();
		worker = null;
	}
}

/**
 * 画像ファイルをアップスケール / ノイズ除去し、指定形式の Blob を返す。
 * 推論は Web Worker（OffscreenCanvas + onnxruntime-web）で行われ、メインスレッドを固めない。
 */
export function upscaleImage(
	file: Blob,
	options: UpscaleOptions,
	onProgress?: (info: ProgressInfo) => void,
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const w = getWorker();
		const id = crypto.randomUUID();

		const handler = (e: MessageEvent<UpscaleWorkerResponse>) => {
			const msg = e.data;

			if (msg.type === 'progress') {
				onProgress?.(msg.payload);
				return;
			}
			if (!('id' in msg) || msg.id !== id) return;

			if (msg.type === 'result') {
				w.removeEventListener('message', handler);
				const rgba = new Uint8ClampedArray(msg.data);
				const imageData = new ImageData(rgba, msg.width, msg.height);
				const canvas = document.createElement('canvas');
				canvas.width = msg.width;
				canvas.height = msg.height;
				const ctx = canvas.getContext('2d');
				if (!ctx) {
					reject(new Error('Canvas 2D コンテキストの取得に失敗しました'));
					return;
				}
				ctx.putImageData(imageData, 0, 0);
				const mime = options.output === 'webp' ? 'image/webp' : 'image/png';
				canvas.toBlob((blob) => {
					if (blob) resolve(blob);
					else reject(new Error('画像の書き出しに失敗しました'));
				}, mime);
			}

			if (msg.type === 'error') {
				w.removeEventListener('message', handler);
				reject(new Error(msg.message));
			}
		};

		w.addEventListener('message', handler);

		file
			.arrayBuffer()
			.then((buffer) => {
				w.postMessage(
					{
						id,
						imageData: buffer,
						mimeType: file.type || 'application/octet-stream',
						options,
					} satisfies UpscaleWorkerRequest,
					[buffer],
				);
			})
			.catch(reject);
	});
}
