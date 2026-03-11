export type EncodingType = 'UTF8' | 'SJIS' | 'EUCJP' | 'JIS' | 'UTF16' | 'UTF16BE' | 'UTF16LE' | 'ASCII' | 'BINARY' | 'UNICODE';

export interface DetectionResult {
  encoding: EncodingType;
  confidence: 'high' | 'medium' | 'low';
}

export interface ConversionOptions {
  outputEncoding: EncodingType;
  addBom: boolean;
  lineEnding: 'CRLF' | 'LF' | 'CR';
}

export interface ConversionResult {
  blob: Blob;
  fileName: string;
  originalEncoding: EncodingType;
  outputEncoding: EncodingType;
  lineCount: number;
  fileSize: number;
}
