// 実行方法: npm run test:unit（Node 22 の型ストリッピングで .ts を直接実行）
// 単体実行: node --test tests/unit/upscale.test.ts
//
// 推論・Canvas・onnxruntime-web 依存（upscaleImage / Worker）はブラウザ専用のため E2E で検証する。
// ここでは純粋ロジック（検証・寸法・タイル分割・ファイル名）を対象とする。

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	buildUpscaledFilename,
	computeOutputDimensions,
	MAX_FILE_SIZE,
	MAX_INPUT_EDGE,
	MODELS,
	planTiles,
	validateImageFile,
	validateResolution,
} from '../../src/lib/tools/upscale-core.ts';

// ---------------------------------------------------------------------------
// validateImageFile
// ---------------------------------------------------------------------------

test('validateImageFile: PNG / JPEG / WebP は OK で format を返す', () => {
	assert.deepEqual(validateImageFile({ type: 'image/png', size: 1000 }), {
		ok: true,
		format: 'png',
	});
	assert.deepEqual(validateImageFile({ type: 'image/jpeg', size: 1000 }), {
		ok: true,
		format: 'jpeg',
	});
	assert.deepEqual(validateImageFile({ type: 'image/webp', size: 1000 }), {
		ok: true,
		format: 'webp',
	});
});

test('validateImageFile: 非対応形式は unsupported-type', () => {
	const r = validateImageFile({ type: 'image/gif', size: 1000 });
	assert.equal(r.ok, false);
	if (!r.ok) assert.equal(r.reason, 'unsupported-type');
});

test('validateImageFile: 20MB 超は too-large', () => {
	const r = validateImageFile({ type: 'image/png', size: MAX_FILE_SIZE + 1 });
	assert.equal(r.ok, false);
	if (!r.ok) assert.equal(r.reason, 'too-large');
});

// ---------------------------------------------------------------------------
// validateResolution
// ---------------------------------------------------------------------------

test('validateResolution: 上限内は OK', () => {
	assert.equal(validateResolution(1024, 768).ok, true);
	assert.equal(validateResolution(MAX_INPUT_EDGE, MAX_INPUT_EDGE).ok, true);
});

test('validateResolution: 長辺が上限超過は resolution-too-high', () => {
	const r = validateResolution(MAX_INPUT_EDGE + 1, 100);
	assert.equal(r.ok, false);
	if (!r.ok) assert.equal(r.reason, 'resolution-too-high');
});

// ---------------------------------------------------------------------------
// computeOutputDimensions
// ---------------------------------------------------------------------------

test('computeOutputDimensions: 倍率を適用', () => {
	assert.deepEqual(computeOutputDimensions(100, 75, 2), {
		width: 200,
		height: 150,
	});
	assert.deepEqual(computeOutputDimensions(100, 75, 4), {
		width: 400,
		height: 300,
	});
});

// ---------------------------------------------------------------------------
// buildUpscaledFilename
// ---------------------------------------------------------------------------

test('buildUpscaledFilename: _upscaled_{scale}x と拡張子を付与', () => {
	assert.equal(
		buildUpscaledFilename('photo.jpg', 4, 'png'),
		'photo_upscaled_4x.png',
	);
	assert.equal(buildUpscaledFilename('a.PNG', 2, 'webp'), 'a_upscaled_2x.webp');
	assert.equal(
		buildUpscaledFilename('noext', 4, 'png'),
		'noext_upscaled_4x.png',
	);
});

// ---------------------------------------------------------------------------
// planTiles
// ---------------------------------------------------------------------------

test('planTiles: 画像に収まる場合は単一タイル', () => {
	const tiles = planTiles(200, 150, 224, 16);
	assert.equal(tiles.length, 1);
	assert.deepEqual(tiles[0], {
		sx: 0,
		sy: 0,
		sw: 200,
		sh: 150,
		kx: 0,
		ky: 0,
		kw: 200,
		kh: 150,
	});
});

test('planTiles: core で格子分割され、中核領域が隙間なく全面を覆う', () => {
	const W = 256;
	const H = 256;
	const core = 128;
	const tiles = planTiles(W, H, core, 0);
	assert.equal(tiles.length, 4);

	// 中核領域(kx,ky,kw,kh)の総面積 = 画像全面
	const area = tiles.reduce((s, t) => s + t.kw * t.kh, 0);
	assert.equal(area, W * H);

	// 中核領域が重複なく全画素を1回ずつ覆う
	const cover = new Uint8Array(W * H);
	for (const t of tiles) {
		for (let y = t.ky; y < t.ky + t.kh; y++) {
			for (let x = t.kx; x < t.kx + t.kw; x++) {
				cover[y * W + x]++;
			}
		}
	}
	assert.ok(
		cover.every((c) => c === 1),
		'全画素が中核領域でちょうど1回覆われる',
	);
});

test('planTiles: overlap は読み取り領域のみ拡張し画像端でクランプ', () => {
	const tiles = planTiles(256, 256, 128, 16);
	// 左上タイル: 中核(0,0,128,128)、読み取りは右下に overlap 拡張のみ（左上は端でクランプ）
	const tl = tiles[0];
	assert.deepEqual(
		{ sx: tl.sx, sy: tl.sy, sw: tl.sw, sh: tl.sh },
		{ sx: 0, sy: 0, sw: 144, sh: 144 },
	);
	assert.deepEqual(
		{ kx: tl.kx, ky: tl.ky, kw: tl.kw, kh: tl.kh },
		{ kx: 0, ky: 0, kw: 128, kh: 128 },
	);
	// 右下タイル: 中核(128,128,128,128)、読み取りは左上に overlap 拡張
	const br = tiles[3];
	assert.deepEqual(
		{ sx: br.sx, sy: br.sy, sw: br.sw, sh: br.sh },
		{ sx: 112, sy: 112, sw: 144, sh: 144 },
	);
});

test('planTiles: 端数サイズでも中核領域が全面を覆う', () => {
	const W = 300;
	const H = 200;
	const tiles = planTiles(W, H, 128, 16);
	const area = tiles.reduce((s, t) => s + t.kw * t.kh, 0);
	assert.equal(area, W * H);
});

// ---------------------------------------------------------------------------
// MODELS レジストリ
// ---------------------------------------------------------------------------

test('MODELS: fast/max とも x4 ネイティブ', () => {
	assert.equal(MODELS.fast.nativeScale, 4);
	assert.equal(MODELS.max.nativeScale, 4);
	assert.equal(MODELS.fast.fixed, false);
	assert.equal(MODELS.max.fixed, true);
});
