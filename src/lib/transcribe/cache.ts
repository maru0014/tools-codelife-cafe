// cache.ts — モデルのブラウザキャッシュ（Cache Storage）の確認と、対象限定の削除
//
// キャッシュの正は transformers.js 標準の Cache Storage（env.useBrowserCache）。
// R2 の Cache-Control は補助的な位置づけ（正本 FR-7 / R-5）。
//
// 「transcribe 用キャッシュ全体を消す」ではなく、マニフェストに列挙された URL だけを
// 削除することで、他ツール（/bg-remove 等）のキャッシュに影響を与えない。

import {
	getModelArtifact,
	MODEL_BASE_PATH,
	type ModelId,
} from './model-manifest.ts';
import { requiredFiles } from './models.ts';
import type { TranscribeDevice } from './protocol.ts';

function modelFileUrls(id: ModelId, device: TranscribeDevice): string[] {
	const artifact = getModelArtifact(id);
	const origin = typeof location !== 'undefined' ? location.origin : '';
	return requiredFiles(artifact, device).map(
		(file) =>
			`${origin}${MODEL_BASE_PATH}${artifact.repositoryPath}${file.path}`,
	);
}

/** 最も大きい ONNX がキャッシュされていれば「キャッシュ済み」とみなす */
export async function isModelCached(
	id: ModelId,
	device: TranscribeDevice,
): Promise<boolean> {
	if (typeof caches === 'undefined') return false;
	const artifact = getModelArtifact(id);
	const largest = requiredFiles(artifact, device)
		.filter((f) => f.path.endsWith('.onnx'))
		.sort((a, b) => b.bytes - a.bytes)[0];
	if (!largest) return false;
	const origin = typeof location !== 'undefined' ? location.origin : '';
	const url = `${origin}${MODEL_BASE_PATH}${artifact.repositoryPath}${largest.path}`;
	try {
		return (await caches.match(url)) !== undefined;
	} catch {
		return false;
	}
}

/**
 * 対象モデルのキャッシュエントリだけを削除する。削除できた件数を返す。
 * 破損キャッシュからの復旧に使う（再取得は1回限り。無限再試行は禁止）。
 */
export async function evictModelCache(
	id: ModelId,
	device: TranscribeDevice,
): Promise<number> {
	if (typeof caches === 'undefined') return 0;
	const urls = modelFileUrls(id, device);
	let deleted = 0;
	try {
		for (const name of await caches.keys()) {
			const cache = await caches.open(name);
			for (const url of urls) {
				if (await cache.delete(url)) deleted++;
			}
		}
	} catch {
		return deleted;
	}
	return deleted;
}
