// 実行方法: npm run test:unit（Node 22 の型ストリッピングで .ts を直接実行）
// 単体実行: node --test tests/unit/transcribe-models.test.ts
//
// モデル定義まわりの純粋ロジックと、配信パス規約（revision 付き）の不変条件。

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MAX_DURATION_SEC } from '../../src/lib/transcribe/audio-core.ts';
import {
	listAllowedModelPaths,
	listAllowedRuntimePaths,
	MODEL_ARTIFACTS,
	MODEL_BASE_PATH,
	ONNX_WASM_BASE_PATH,
	RUNTIME_ARTIFACT,
} from '../../src/lib/transcribe/model-manifest.ts';
import {
	downloadBytes,
	isSmallRecommended,
	onnxFilePaths,
	requiredFiles,
} from '../../src/lib/transcribe/models.ts';

// ---------------------------------------------------------------------------
// 配信パス規約: URL に revision が含まれること
//
// `Cache-Control: immutable`（1年）で配るため、同じ URL の内容が差し替わってはいけない。
// revision を含めない構造へ戻ると、旧成果物がブラウザ・CDN・SW に残り続ける。
// ---------------------------------------------------------------------------

test('全モデルの repositoryPath が <name>/<revision>/ 形式である', () => {
	for (const model of MODEL_ARTIFACTS) {
		assert.equal(
			model.repositoryPath,
			`${model.name}/${model.revision}/`,
			`${model.id} の repositoryPath に revision が含まれていません`,
		);
	}
});

test('pipeline へ渡す modelId が配信ディレクトリと一致する', () => {
	for (const model of MODEL_ARTIFACTS) {
		assert.equal(`${model.modelId}/`, model.repositoryPath);
	}
});

test('modelId が transformers.js のローカルパス解決を通る形式である', () => {
	// isValidHfModelId 相当（REPO_ID_REGEX はスラッシュ1個まで）
	const REPO_ID_REGEX = /^(\b[\w\-.]+\b\/)?\b[\w\-.]{1,96}\b$/;
	for (const model of MODEL_ARTIFACTS) {
		assert.ok(REPO_ID_REGEX.test(model.modelId), model.modelId);
		assert.equal(model.modelId.includes('..'), false);
		assert.equal(model.modelId.includes('--'), false);
	}
});

test('revision は 40 桁のコミットハッシュである（タグ・ブランチ名を許さない）', () => {
	for (const model of MODEL_ARTIFACTS) {
		assert.match(model.revision, /^[0-9a-f]{40}$/, model.id);
	}
});

test('配信許可パスがすべて revision を含む同一オリジンの絶対パスである', () => {
	const paths = listAllowedModelPaths();
	assert.ok(paths.length > 0);
	for (const path of paths) {
		assert.ok(path.startsWith(MODEL_BASE_PATH), path);
		const rest = path.slice(MODEL_BASE_PATH.length);
		assert.match(rest, /^whisper-(tiny|base|small)\/[0-9a-f]{40}\//, path);
	}
});

test('ONNX Runtime WASM の配信パスにバージョンが含まれる', () => {
	assert.equal(
		ONNX_WASM_BASE_PATH,
		`/vendor/onnx-wasm/${RUNTIME_ARTIFACT.onnxRuntimeVersion}/`,
	);
	for (const path of listAllowedRuntimePaths()) {
		assert.ok(path.startsWith(ONNX_WASM_BASE_PATH), path);
	}
});

// ---------------------------------------------------------------------------
// requiredFiles / downloadBytes
// ---------------------------------------------------------------------------

test('requiredFiles: デバイスごとに対応する dtype の ONNX だけを含む', () => {
	const artifact = MODEL_ARTIFACTS[0];
	const wasm = requiredFiles(artifact, 'wasm').map((f) => f.path);
	const webgpu = requiredFiles(artifact, 'webgpu').map((f) => f.path);

	assert.deepEqual(
		wasm.filter((p) => p.endsWith('.onnx')).sort(),
		onnxFilePaths(artifact, 'wasm').sort(),
	);
	assert.deepEqual(
		webgpu.filter((p) => p.endsWith('.onnx')).sort(),
		onnxFilePaths(artifact, 'webgpu').sort(),
	);
	assert.notDeepEqual(wasm, webgpu);
});

test('requiredFiles: config / tokenizer 系は常に含まれる', () => {
	const artifact = MODEL_ARTIFACTS[0];
	for (const device of ['wasm', 'webgpu'] as const) {
		const paths = requiredFiles(artifact, device).map((f) => f.path);
		for (const required of [
			'config.json',
			'generation_config.json',
			'preprocessor_config.json',
			'tokenizer.json',
			'tokenizer_config.json',
		]) {
			assert.ok(paths.includes(required), `${device}: ${required}`);
		}
	}
});

test('downloadBytes: デバイス別の合計サイズが必須ファイルの合計と一致する', () => {
	const artifact = MODEL_ARTIFACTS[0];
	const expected = requiredFiles(artifact, 'wasm').reduce(
		(sum, f) => sum + f.bytes,
		0,
	);
	assert.equal(downloadBytes(artifact.id, 'wasm'), expected);
});

// ---------------------------------------------------------------------------
// isSmallRecommended
//
// 正本の条件は「WebGPU対応**かつ**メモリ安全判定通過時のみ推奨」。
// ---------------------------------------------------------------------------

const shortAudio = 60;

test('isSmallRecommended: WebGPUあり × メモリ安全 → 推奨する', () => {
	assert.equal(
		isSmallRecommended({
			device: 'webgpu',
			deviceMemoryGb: 16,
			durationSec: shortAudio,
		}),
		true,
	);
});

test('isSmallRecommended: WebGPUあり × メモリ危険 → 推奨しない', () => {
	assert.equal(
		isSmallRecommended({
			device: 'webgpu',
			deviceMemoryGb: 4,
			durationSec: MAX_DURATION_SEC,
		}),
		false,
	);
});

test('isSmallRecommended: WebGPUあり × 安全判定不能（ファイル未選択） → 推奨しない', () => {
	assert.equal(
		isSmallRecommended({
			device: 'webgpu',
			deviceMemoryGb: 16,
			durationSec: null,
		}),
		false,
	);
});

test('isSmallRecommended: WebGPUあり × deviceMemory 取得不能 → 推奨しない', () => {
	assert.equal(
		isSmallRecommended({
			device: 'webgpu',
			deviceMemoryGb: null,
			durationSec: shortAudio,
		}),
		false,
	);
});

test('isSmallRecommended: WASM は常に推奨しない', () => {
	assert.equal(
		isSmallRecommended({
			device: 'wasm',
			deviceMemoryGb: 32,
			durationSec: shortAudio,
		}),
		false,
	);
});

test('isSmallRecommended: デバイス判定前（null）は推奨しない', () => {
	assert.equal(
		isSmallRecommended({
			device: null,
			deviceMemoryGb: 32,
			durationSec: shortAudio,
		}),
		false,
	);
});

test('isSmallRecommended: 非有限な duration は推奨しない', () => {
	for (const durationSec of [Number.NaN, Number.POSITIVE_INFINITY, 0, -1]) {
		assert.equal(
			isSmallRecommended({
				device: 'webgpu',
				deviceMemoryGb: 16,
				durationSec,
			}),
			false,
			String(durationSec),
		);
	}
});

test('isSmallRecommended: 余裕のある端末では 15 分でも推奨が維持される', () => {
	// 見積もりはモデルのピークメモリが支配的で、音声長の寄与は相対的に小さい。
	// 8GB 端末なら 15 分でも予算内に収まる。
	const base = { device: 'webgpu', deviceMemoryGb: 8 } as const;
	assert.equal(isSmallRecommended({ ...base, durationSec: 30 }), true);
	assert.equal(
		isSmallRecommended({ ...base, durationSec: MAX_DURATION_SEC }),
		true,
	);
});

test('isSmallRecommended: 予算ぎりぎりの端末では音声長で推奨が外れる', () => {
	const base = { device: 'webgpu', deviceMemoryGb: 4.5 } as const;
	assert.equal(isSmallRecommended({ ...base, durationSec: 30 }), true);
	assert.equal(
		isSmallRecommended({ ...base, durationSec: MAX_DURATION_SEC }),
		false,
	);
});
