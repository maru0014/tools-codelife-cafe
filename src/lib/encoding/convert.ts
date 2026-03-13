import Encoding from 'encoding-japanese';
import type {
	ConversionOptions,
	ConversionResult,
	EncodingType,
} from './types';

export function convertEncoding(
	buffer: ArrayBuffer,
	sourceEncoding: EncodingType,
	options: ConversionOptions,
	originalFilename: string,
): ConversionResult {
	let sourceBytes = new Uint8Array(buffer);

	// 1. Strip BOM if present
	if (
		sourceBytes.length >= 3 &&
		sourceBytes[0] === 0xef &&
		sourceBytes[1] === 0xbb &&
		sourceBytes[2] === 0xbf
	) {
		sourceBytes = sourceBytes.slice(3);
	} else if (
		sourceBytes.length >= 2 &&
		((sourceBytes[0] === 0xff && sourceBytes[1] === 0xfe) ||
			(sourceBytes[0] === 0xfe && sourceBytes[1] === 0xff))
	) {
		sourceBytes = sourceBytes.slice(2);
	}

	// 1.5 Decode source buffer -> UNICODE (JS string)
	const decodedStringArray = Encoding.convert(sourceBytes, {
		to: 'UNICODE',
		from: sourceEncoding,
		type: 'array',
	});

	// encoding-japanese convert to UNICODE returns array of code points. Convert to string.
	const decodedString = Encoding.codeToString(decodedStringArray);

	// 2. Normalize line endings
	let normalizedString = decodedString;
	if (options.lineEnding === 'CRLF') {
		normalizedString = decodedString.replace(/\r\n|\r|\n/g, '\r\n');
	} else if (options.lineEnding === 'LF') {
		normalizedString = decodedString.replace(/\r\n|\r|\n/g, '\n');
	} else if (options.lineEnding === 'CR') {
		normalizedString = decodedString.replace(/\r\n|\r|\n/g, '\r');
	}

	// Count lines
	const lineCount = (normalizedString.match(/\r\n|\r|\n/g) || []).length + 1;

	// 3. Convert string -> output encoding byte array
	const outputBytesArray = Encoding.convert(
		Encoding.stringToCode(normalizedString),
		{
			to: options.outputEncoding,
			from: 'UNICODE',
			type: 'array',
		},
	);

	// 4. Add BOM if necessary and create final Uint8Array
	let finalBytes: Uint8Array;

	if (options.addBom) {
		let bom: Uint8Array;
		if (options.outputEncoding === 'UTF8') {
			bom = new Uint8Array([0xef, 0xbb, 0xbf]);
		} else if (options.outputEncoding === 'UTF16LE') {
			bom = new Uint8Array([0xff, 0xfe]);
		} else if (options.outputEncoding === 'UTF16BE') {
			bom = new Uint8Array([0xfe, 0xff]);
		} else {
			bom = new Uint8Array(0);
		}

		if (bom.length > 0) {
			finalBytes = new Uint8Array(bom.length + outputBytesArray.length);
			finalBytes.set(bom);
			finalBytes.set(outputBytesArray, bom.length);
		} else {
			finalBytes = new Uint8Array(outputBytesArray);
		}
	} else {
		finalBytes = new Uint8Array(outputBytesArray);
	}

	// 5. Create Blob
	// biome-ignore lint/suspicious/noExplicitAny: ok
	const blob = new Blob([finalBytes as any], {
		type:
			options.outputEncoding === 'UTF8'
				? 'text/csv; charset=utf-8'
				: 'text/csv',
	});

	// Generate output filename
	const extIndex = originalFilename.lastIndexOf('.');
	const baseName =
		extIndex !== -1
			? originalFilename.substring(0, extIndex)
			: originalFilename;
	const fileName = `${baseName}_converted.csv`;

	return {
		blob,
		fileName,
		originalEncoding: sourceEncoding,
		outputEncoding: options.outputEncoding,
		lineCount,
		fileSize: blob.size,
	};
}
