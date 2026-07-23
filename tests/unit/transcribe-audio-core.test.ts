// 実行方法: npm run test:unit（Node 22 の型ストリッピングで .ts を直接実行）
// 単体実行: node --test tests/unit/transcribe-audio-core.test.ts
//
// 音声前処理の純粋ロジック（ダウンミックス・16kHzリサンプル・長さ/メモリ判定）。
// AudioContext・decodeAudioData・loadedmetadata に依存する部分は audio-browser.ts 側で
// Playwright のブラウザテストとして検証する。

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	assessDuration,
	assessMemory,
	downmixToMono,
	estimateDecodedBytes,
	estimatePeakMemoryBytes,
	MAX_DURATION_SEC,
	resampleLinear,
	TARGET_SAMPLE_RATE,
	toMono16k,
} from '../../src/lib/transcribe/audio-core.ts';

const f32 = (...values: number[]) => Float32Array.from(values);

// ---------------------------------------------------------------------------
// downmixToMono
// ---------------------------------------------------------------------------

test('downmixToMono: モノラルはそのままの値を返す', () => {
	const out = downmixToMono([f32(0.5, -0.5, 0)]);
	assert.deepEqual(Array.from(out), [0.5, -0.5, 0]);
});

test('downmixToMono: ステレオは左右の平均になる', () => {
	const out = downmixToMono([f32(1, 1, 0.5), f32(-1, -1, -0.5)]);
	assert.deepEqual(Array.from(out), [0, 0, 0]);
});

test('downmixToMono: 3ch以上も全チャンネルの平均になる', () => {
	const out = downmixToMono([f32(3), f32(0), f32(0)]);
	assert.ok(Math.abs(out[0] - 1) < 1e-6);
});

test('downmixToMono: チャンネル長が異なる場合は最長に合わせ不足分を0として扱う', () => {
	const out = downmixToMono([f32(1, 1), f32(1)]);
	assert.equal(out.length, 2);
	assert.ok(Math.abs(out[0] - 1) < 1e-6);
	assert.ok(Math.abs(out[1] - 0.5) < 1e-6);
});

test('downmixToMono: チャンネルが無い場合は空配列', () => {
	assert.equal(downmixToMono([]).length, 0);
});

// ---------------------------------------------------------------------------
// resampleLinear
// ---------------------------------------------------------------------------

test('resampleLinear: 44.1kHz→16kHz で1秒ぶんが16000サンプルになる', () => {
	const out = resampleLinear(new Float32Array(44100), 44100, 16000);
	assert.equal(out.length, 16000);
});

test('resampleLinear: 48kHz→16kHz で1秒ぶんが16000サンプルになる', () => {
	const out = resampleLinear(new Float32Array(48000), 48000, 16000);
	assert.equal(out.length, 16000);
});

test('resampleLinear: 同一レートなら値がそのまま保たれる', () => {
	const input = f32(0.1, 0.2, 0.3);
	const out = resampleLinear(input, 16000, 16000);
	assert.deepEqual(Array.from(out), [0.1, 0.2, 0.3].map(Math.fround));
});

test('resampleLinear: 定数信号は振幅が保たれる（線形補間の健全性）', () => {
	const input = new Float32Array(48000).fill(0.25);
	const out = resampleLinear(input, 48000, 16000);
	for (const v of out) assert.ok(Math.abs(v - 0.25) < 1e-6);
});

test('resampleLinear: アップサンプルも中間値が補間される', () => {
	const out = resampleLinear(f32(0, 1), 1, 2);
	assert.equal(out.length, 4);
	assert.ok(out[1] > 0 && out[1] < 1);
});

test('resampleLinear: 空入力は空出力', () => {
	assert.equal(resampleLinear(new Float32Array(0), 48000, 16000).length, 0);
});

// ---------------------------------------------------------------------------
// toMono16k
// ---------------------------------------------------------------------------

test('toMono16k: ステレオ48kHz→モノラル16kHzへ一括変換する', () => {
	const left = new Float32Array(48000).fill(1);
	const right = new Float32Array(48000).fill(-1);
	const out = toMono16k([left, right], 48000);
	assert.equal(out.length, TARGET_SAMPLE_RATE);
	for (const v of out) assert.ok(Math.abs(v) < 1e-6);
});

test('toMono16k: 極端に短い音声でも 0 サンプルにならず落ちない', () => {
	const out = toMono16k([f32(0.5)], 48000);
	assert.ok(out.length >= 0);
	assert.ok(out instanceof Float32Array);
});

test('toMono16k: 無音は無音のまま', () => {
	const out = toMono16k([new Float32Array(44100)], 44100);
	assert.equal(out.length, TARGET_SAMPLE_RATE);
	assert.ok(out.every((v) => v === 0));
});

// ---------------------------------------------------------------------------
// assessDuration
// ---------------------------------------------------------------------------

test('assessDuration: 15分ちょうどは許可する', () => {
	assert.deepEqual(assessDuration(MAX_DURATION_SEC), { ok: true });
});

test('assessDuration: 15分を超えると file-too-long で停止する', () => {
	const r = assessDuration(MAX_DURATION_SEC + 0.5);
	assert.equal(r.ok, false);
	if (!r.ok) {
		assert.equal(r.code, 'file-too-long');
		assert.match(r.message, /15分/);
	}
});

test('assessDuration: 0秒・非有限は decode-failed 扱いにする', () => {
	const zero = assessDuration(0);
	assert.equal(zero.ok, false);
	if (!zero.ok) assert.equal(zero.code, 'decode-failed');

	const nan = assessDuration(Number.NaN);
	assert.equal(nan.ok, false);
	if (!nan.ok) assert.equal(nan.code, 'decode-failed');
});

// ---------------------------------------------------------------------------
// メモリ見積もり
// ---------------------------------------------------------------------------

test('estimateDecodedBytes: 秒 × サンプルレート × チャンネル × 4 バイト', () => {
	assert.equal(estimateDecodedBytes(10, 48000, 2), 10 * 48000 * 2 * 4);
});

test('estimatePeakMemoryBytes: デコード済み + 16kHz PCM + モデルピーク + 安全マージン', () => {
	const bytes = estimatePeakMemoryBytes({
		durationSec: 60,
		sampleRate: 48000,
		channels: 2,
		modelPeakBytes: 100_000_000,
	});
	const decoded = 60 * 48000 * 2 * 4;
	const pcm16k = 60 * TARGET_SAMPLE_RATE * 4;
	assert.ok(bytes > decoded + pcm16k + 100_000_000);
});

test('assessMemory: 余裕がある端末では ok', () => {
	const r = assessMemory({
		estimatedBytes: 200_000_000,
		deviceMemoryGb: 16,
		modelId: 'base',
		device: 'webgpu',
	});
	assert.equal(r.level, 'ok');
});

test('assessMemory: 4GB以下の端末で small を選ぶと memory-risk で停止する', () => {
	const r = assessMemory({
		estimatedBytes: 100_000_000,
		deviceMemoryGb: 4,
		modelId: 'small',
		device: 'wasm',
	});
	assert.equal(r.level, 'stop');
	if (r.level === 'stop') assert.equal(r.code, 'memory-risk');
});

test('assessMemory: 見積もりが端末メモリの予算を超えると停止する', () => {
	const r = assessMemory({
		estimatedBytes: 8 * 1024 ** 3,
		deviceMemoryGb: 8,
		modelId: 'base',
		device: 'wasm',
	});
	assert.equal(r.level, 'stop');
});

test('assessMemory: deviceMemory 取得不能 × small × wasm は強い警告', () => {
	const r = assessMemory({
		estimatedBytes: 100_000_000,
		deviceMemoryGb: null,
		modelId: 'small',
		device: 'wasm',
	});
	assert.equal(r.level, 'warn');
});

test('assessMemory: deviceMemory 取得不能でも tiny なら ok', () => {
	const r = assessMemory({
		estimatedBytes: 50_000_000,
		deviceMemoryGb: null,
		modelId: 'tiny',
		device: 'wasm',
	});
	assert.equal(r.level, 'ok');
});
