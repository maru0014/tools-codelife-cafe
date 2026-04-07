import { caesarCipher } from './caesar';
import type { CipherResult } from './types';

export function rot13(input: string): CipherResult {
	const result = caesarCipher(input, { shift: 13, direction: 'encode' });

	return {
		output: result.output,
		algorithm: 'rot13',
		inputLength: input.length,
		outputLength: result.outputLength,
	};
}
