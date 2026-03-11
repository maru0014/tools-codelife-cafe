import type { EncodingType } from '../encoding/types';

export interface UserSettings {
  outputEncoding: EncodingType;
  addBom: boolean;
  lineEnding: 'CRLF' | 'LF' | 'CR';
  instantMode: boolean;
}
