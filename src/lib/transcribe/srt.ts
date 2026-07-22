// srt.ts — SubRip（.srt）字幕シリアライズ（純粋ロジック・DOM 非依存）

import {
	formatTimestamp,
	normalizeSegments,
	type TranscriptSegment,
} from './segments.ts';

/** 秒を SRT のタイムコード `HH:MM:SS,mmm` に整形する。 */
export function formatSrtTimestamp(seconds: number): string {
	return formatTimestamp(seconds, ',');
}

/**
 * セグメント列を SRT 文字列へ変換する。
 * 空セグメント除去・並べ替え・重複除去を行った上で連番を振り直す。
 * 有効なセグメントが無い場合は空文字を返す。
 */
export function toSrt(segments: readonly TranscriptSegment[]): string {
	const normalized = normalizeSegments(segments);
	if (normalized.length === 0) return '';
	const blocks = normalized.map((segment, index) => {
		const start = formatSrtTimestamp(segment.start);
		const end = formatSrtTimestamp(segment.end);
		return `${index + 1}\n${start} --> ${end}\n${segment.text}`;
	});
	return `${blocks.join('\n\n')}\n`;
}
