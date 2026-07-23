// vtt.ts — WebVTT（.vtt）字幕シリアライズ（純粋ロジック・DOM 非依存）

import {
	formatTimestamp,
	normalizeSegments,
	type TranscriptSegment,
} from './segments.ts';

/** 秒を WebVTT のタイムコード `HH:MM:SS.mmm` に整形する。 */
export function formatVttTimestamp(seconds: number): string {
	return formatTimestamp(seconds, '.');
}

/**
 * セグメント列を WebVTT 文字列へ変換する。
 * 有効なセグメントが無くても `WEBVTT` ヘッダだけは返す（空ファイルは不正なため）。
 */
export function toVtt(segments: readonly TranscriptSegment[]): string {
	const normalized = normalizeSegments(segments);
	if (normalized.length === 0) return 'WEBVTT\n';
	const cues = normalized.map((segment, index) => {
		const start = formatVttTimestamp(segment.start);
		const end = formatVttTimestamp(segment.end);
		return `${index + 1}\n${start} --> ${end}\n${segment.text}`;
	});
	return `WEBVTT\n\n${cues.join('\n\n')}\n`;
}
