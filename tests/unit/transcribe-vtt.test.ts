// 実行方法: npm run test:unit（Node 22 の型ストリッピングで .ts を直接実行）
// 単体実行: node --test tests/unit/transcribe-vtt.test.ts
//
// WebVTT 字幕シリアライズ（純粋ロジック）。SRT との差分（ヘッダ・小数点区切り）を重点的に検証する。

import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { TranscriptSegment } from '../../src/lib/transcribe/segments.ts';
import { formatVttTimestamp, toVtt } from '../../src/lib/transcribe/vtt.ts';

const seg = (
	id: number,
	start: number,
	end: number,
	text: string,
): TranscriptSegment => ({ id, start, end, text });

// ---------------------------------------------------------------------------
// formatVttTimestamp
// ---------------------------------------------------------------------------

test('formatVttTimestamp: ミリ秒はカンマではなくピリオド区切り', () => {
	assert.equal(formatVttTimestamp(1.5), '00:00:01.500');
});

test('formatVttTimestamp: 59.999秒は繰り上がらない', () => {
	assert.equal(formatVttTimestamp(59.999), '00:00:59.999');
});

test('formatVttTimestamp: 59.9995秒は 00:01:00.000 へ丸められる', () => {
	assert.equal(formatVttTimestamp(59.9995), '00:01:00.000');
});

test('formatVttTimestamp: 60秒ちょうど / 1時間ちょうど', () => {
	assert.equal(formatVttTimestamp(60), '00:01:00.000');
	assert.equal(formatVttTimestamp(3600), '01:00:00.000');
});

test('formatVttTimestamp: 負値・非有限値は 00:00:00.000', () => {
	assert.equal(formatVttTimestamp(-5), '00:00:00.000');
	assert.equal(formatVttTimestamp(Number.NaN), '00:00:00.000');
});

// ---------------------------------------------------------------------------
// toVtt
// ---------------------------------------------------------------------------

test('toVtt: WEBVTT ヘッダから始まる', () => {
	const out = toVtt([seg(1, 0, 1, 'やあ')]);
	assert.match(out, /^WEBVTT\n\n/);
});

test('toVtt: 連番・タイムコード・本文のキューを生成する', () => {
	const out = toVtt([seg(1, 0, 1.25, 'こんにちは'), seg(2, 1.25, 2.5, '世界')]);
	assert.equal(
		out,
		'WEBVTT\n\n1\n00:00:00.000 --> 00:00:01.250\nこんにちは\n\n2\n00:00:01.250 --> 00:00:02.500\n世界\n',
	);
});

test('toVtt: セグメントが無くてもヘッダだけは返す', () => {
	assert.equal(toVtt([]), 'WEBVTT\n');
	assert.equal(toVtt([seg(1, 0, 1, '  ')]), 'WEBVTT\n');
});

test('toVtt: 本文の改行を保持し CRLF を正規化する', () => {
	const out = toVtt([seg(1, 0, 1, '一行目\r\n二行目')]);
	assert.match(out, /一行目\n二行目\n$/);
	assert.equal(out.includes('\r'), false);
});

test('toVtt: 開始時刻順に並べ替えて重複を除く', () => {
	const out = toVtt([
		seg(1, 5, 6, 'あと'),
		seg(2, 0, 1, 'さき'),
		seg(3, 0, 1, 'さき'),
	]);
	assert.equal(
		out,
		'WEBVTT\n\n1\n00:00:00.000 --> 00:00:01.000\nさき\n\n2\n00:00:05.000 --> 00:00:06.000\nあと\n',
	);
});
