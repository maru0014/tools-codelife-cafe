// 実行方法: npm run test:unit（Node 22 の型ストリッピングで .ts を直接実行）
// 単体実行: node --test tests/unit/transcribe-srt.test.ts
//
// SRT 字幕シリアライズ（純粋ロジック）。タイムコード書式と境界値を重点的に検証する。

import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { TranscriptSegment } from '../../src/lib/transcribe/segments.ts';
import { formatSrtTimestamp, toSrt } from '../../src/lib/transcribe/srt.ts';

const seg = (
	id: number,
	start: number,
	end: number,
	text: string,
): TranscriptSegment => ({ id, start, end, text });

// ---------------------------------------------------------------------------
// formatSrtTimestamp
// ---------------------------------------------------------------------------

test('formatSrtTimestamp: 0秒は 00:00:00,000', () => {
	assert.equal(formatSrtTimestamp(0), '00:00:00,000');
});

test('formatSrtTimestamp: ミリ秒はゼロ埋め3桁', () => {
	assert.equal(formatSrtTimestamp(1.5), '00:00:01,500');
	assert.equal(formatSrtTimestamp(0.007), '00:00:00,007');
});

test('formatSrtTimestamp: 59.999秒は繰り上がらない', () => {
	assert.equal(formatSrtTimestamp(59.999), '00:00:59,999');
});

test('formatSrtTimestamp: 59.9995秒は 60秒へ丸められ 00:01:00,000 になる', () => {
	assert.equal(formatSrtTimestamp(59.9995), '00:01:00,000');
});

test('formatSrtTimestamp: 60秒ちょうどは 00:01:00,000', () => {
	assert.equal(formatSrtTimestamp(60), '00:01:00,000');
});

test('formatSrtTimestamp: 1時間ちょうどは 01:00:00,000', () => {
	assert.equal(formatSrtTimestamp(3600), '01:00:00,000');
});

test('formatSrtTimestamp: 1時間を超えても時が繰り上がる', () => {
	assert.equal(formatSrtTimestamp(3661.123), '01:01:01,123');
});

test('formatSrtTimestamp: 負値・非有限値は 00:00:00,000 に丸める', () => {
	assert.equal(formatSrtTimestamp(-1), '00:00:00,000');
	assert.equal(formatSrtTimestamp(Number.NaN), '00:00:00,000');
	assert.equal(formatSrtTimestamp(Number.POSITIVE_INFINITY), '00:00:00,000');
});

// ---------------------------------------------------------------------------
// toSrt
// ---------------------------------------------------------------------------

test('toSrt: 連番・タイムコード・本文のブロックを生成する', () => {
	const out = toSrt([seg(1, 0, 1.25, 'こんにちは'), seg(2, 1.25, 2.5, '世界')]);
	assert.equal(
		out,
		'1\n00:00:00,000 --> 00:00:01,250\nこんにちは\n\n2\n00:00:01,250 --> 00:00:02,500\n世界\n',
	);
});

test('toSrt: 空セグメントを除いた上で連番を振り直す', () => {
	const out = toSrt([
		seg(1, 0, 1, 'あり'),
		seg(2, 1, 2, '  '),
		seg(3, 2, 3, 'あと'),
	]);
	assert.match(out, /^1\n/);
	assert.match(out, /\n2\n00:00:02,000 --> 00:00:03,000\nあと\n$/);
	assert.equal(out.includes('3\n'), false);
});

test('toSrt: 開始時刻順に並べ替えてから出力する', () => {
	const out = toSrt([seg(1, 5, 6, 'あと'), seg(2, 0, 1, 'さき')]);
	assert.match(out, /^1\n00:00:00,000 --> 00:00:01,000\nさき\n/);
});

test('toSrt: 本文の改行は保持し、CRLF は LF に正規化する', () => {
	const out = toSrt([seg(1, 0, 1, '一行目\r\n二行目')]);
	assert.match(out, /一行目\n二行目\n$/);
	assert.equal(out.includes('\r'), false);
});

test('toSrt: 重複セグメントは1つにまとめる', () => {
	const out = toSrt([seg(1, 0, 1, 'おなじ'), seg(2, 0, 1, 'おなじ')]);
	assert.equal(out, '1\n00:00:00,000 --> 00:00:01,000\nおなじ\n');
});

test('toSrt: 有効なセグメントが無ければ空文字を返す', () => {
	assert.equal(toSrt([]), '');
	assert.equal(toSrt([seg(1, 0, 1, '   ')]), '');
});
