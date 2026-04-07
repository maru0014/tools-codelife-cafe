import { caesarCipher } from './caesar';
import type { CipherResult } from './types';

export function rot13(input: string): CipherResult {
	const result = caesarCipher(input, { shift: 13, direction: 'encode' });
	return {
		...result,
		algorithm: 'rot13',
	};
}
