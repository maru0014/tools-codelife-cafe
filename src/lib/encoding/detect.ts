import Encoding from 'encoding-japanese';
import type { DetectionResult, EncodingType } from './types';

export function detectEncoding(buffer: ArrayBuffer): DetectionResult {
	const bytes = new Uint8Array(buffer);

	// File < 100 bytes or empty might lead to inaccurate detection
	const isSmallFile = bytes.length < 100;

	let detected = Encoding.detect(bytes);
	let confidence: 'high' | 'medium' | 'low' = 'high';

	if (!detected || typeof detected !== 'string') {
		// Fallback if detection fails
		detected = 'UTF8';
		confidence = 'low';
	} else if (isSmallFile) {
		confidence = 'low';
	} else if (detected === 'ASCII' || detected === 'BINARY') {
		confidence = 'low';
	}

	// Validate that detected is one of EncodingType
	const validEncodings: EncodingType[] = [
		'UTF8',
		'SJIS',
		'EUCJP',
		'JIS',
		'UTF16',
		'UTF16BE',
		'UTF16LE',
		'ASCII',
		'BINARY',
		'UNICODE',
	];
	let encoding: EncodingType;

	if (validEncodings.includes(detected as EncodingType)) {
		encoding = detected as EncodingType;
	} else {
		encoding = 'UTF8';
		confidence = 'low';
	}

	// Specific check for ASCII-only (often misjudged as ASCII but could be UTF-8/SJIS with only English chars initially)
	if (encoding === 'ASCII') {
		confidence = 'low';
	}

	return { encoding, confidence };
}
