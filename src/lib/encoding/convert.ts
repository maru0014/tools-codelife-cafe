import Encoding from 'encoding-japanese';
import type { ConversionOptions, ConversionResult, EncodingType } from './types';

export function convertEncoding(
  buffer: ArrayBuffer,
  sourceEncoding: EncodingType,
  options: ConversionOptions,
  originalFilename: string
): ConversionResult {
  const sourceBytes = new Uint8Array(buffer);

  // 1. Decode source buffer -> UNICODE (JS string)
  const decodedStringArray = Encoding.convert(sourceBytes, {
    to: 'UNICODE',
    from: sourceEncoding,
    type: 'array'
  });
  
  // encoding-japanese convert to UNICODE returns array of code points. Convert to string.
  let decodedString = Encoding.codeToString(decodedStringArray);

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
  let outputBytesArray = Encoding.convert(Encoding.stringToCode(normalizedString), {
    to: options.outputEncoding,
    from: 'UNICODE',
    type: 'array'
  });

  // 4. Add BOM if necessary
  if (options.addBom) {
    if (options.outputEncoding === 'UTF8') {
      outputBytesArray = [0xEF, 0xBB, 0xBF, ...outputBytesArray];
    } else if (options.outputEncoding === 'UTF16LE') {
      outputBytesArray = [0xFF, 0xFE, ...outputBytesArray];
    } else if (options.outputEncoding === 'UTF16BE') {
      outputBytesArray = [0xFE, 0xFF, ...outputBytesArray];
    }
  }

  // 5. Create Blob
  const byteUint8Array = new Uint8Array(outputBytesArray);
  const blob = new Blob([byteUint8Array], {
    type: options.outputEncoding === 'UTF8' ? 'text/csv; charset=utf-8' : 'text/csv'
  });

  // Generate output filename
  const extIndex = originalFilename.lastIndexOf('.');
  const baseName = extIndex !== -1 ? originalFilename.substring(0, extIndex) : originalFilename;
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
