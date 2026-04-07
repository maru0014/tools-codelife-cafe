import type { BruteForceResult, CaesarOptions, CipherResult } from './types';

// Clean 46-char sets (no small kana, no voiced/semi-voiced)
const HIRAGANA =
	'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
const KATAKANA =
	'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

export function isCleanHiragana(char: string): boolean {
	return HIRAGANA.includes(char);
}

export function isCleanKatakana(char: string): boolean {
	return KATAKANA.includes(char);
}

export function hasJapaneseKana(input: string): boolean {
	return Array.from(input).some((char) => {
		const base = char.normalize('NFD')[0];
		return HIRAGANA.includes(base) || KATAKANA.includes(base);
	});
}

export function getMaxShift(input: string): number {
	return hasJapaneseKana(input) ? 45 : 25;
}

function shiftChar(char: string, shift: number): string {
	const code = char.charCodeAt(0);

	// ASCII uppercase A-Z
	if (code >= 65 && code <= 90) {
		return String.fromCharCode(((((code - 65 + shift) % 26) + 26) % 26) + 65);
	}

	// ASCII lowercase a-z
	if (code >= 97 && code <= 122) {
		return String.fromCharCode(((((code - 97 + shift) % 26) + 26) % 26) + 97);
	}

	// NFD decompose to handle voiced/semi-voiced kana (e.g., が → か + ゙)
	const nfd = char.normalize('NFD');
	const base = nfd[0];
	const combining = nfd.slice(1);

	const hirIdx = HIRAGANA.indexOf(base);
	if (hirIdx !== -1) {
		const newIdx = (((hirIdx + shift) % 46) + 46) % 46;
		return (HIRAGANA[newIdx] + combining).normalize('NFC');
	}

	const katIdx = KATAKANA.indexOf(base);
	if (katIdx !== -1) {
		const newIdx = (((katIdx + shift) % 46) + 46) % 46;
		return (KATAKANA[newIdx] + combining).normalize('NFC');
	}

	// Pass through: digits, kanji, small kana, symbols, spaces, etc.
	return char;
}

export function caesarCipher(
	input: string,
	options: CaesarOptions,
): CipherResult {
	const { shift, direction } = options;
	const effectiveShift = direction === 'decode' ? -shift : shift;

	const output = Array.from(input)
		.map((char) => shiftChar(char, effectiveShift))
		.join('');

	return {
		output,
		algorithm: 'caesar',
		inputLength: input.length,
		outputLength: output.length,
	};
}

export function caesarBruteForce(input: string): BruteForceResult[] {
	if (!input) return [];
	const maxShift = getMaxShift(input);
	const results: BruteForceResult[] = [];
	for (let shift = 1; shift <= maxShift; shift++) {
		results.push({
			shift,
			output: caesarCipher(input, { shift, direction: 'decode' }).output,
		});
	}
	return results;
}
