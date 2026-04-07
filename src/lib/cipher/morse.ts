import type { CipherResult } from './types'

const CHAR_TO_MORSE: Record<string, string> = {
	A: '.-',
	B: '-...',
	C: '-.-.',
	D: '-..',
	E: '.',
	F: '..-.',
	G: '--.',
	H: '....',
	I: '..',
	J: '.---',
	K: '-.-',
	L: '.-..',
	M: '--',
	N: '-.',
	O: '---',
	P: '.--.',
	Q: '--.-',
	R: '.-.',
	S: '...',
	T: '-',
	U: '..-',
	V: '...-',
	W: '.--',
	X: '-..-',
	Y: '-.--',
	Z: '--..',
	'0': '-----',
	'1': '.----',
	'2': '..---',
	'3': '...--',
	'4': '....-',
	'5': '.....',
	'6': '-....',
	'7': '--...',
	'8': '---..',
	'9': '----.',
	'.': '.-.-.-',
	',': '--..--',
	'?': '..--..',
	"'": '.----.',
	'!': '-.-.--',
	'/': '-..-.',
	'(': '-.--.',
	')': '-.--.-',
	'&': '.-...',
	':': '---...',
	';': '-.-.-.',
	'=': '-...-',
	'+': '.-.-.',
	'-': '-....-',
	_: '..--.-',
	'"': '.-..-.',
	$: '...-..-',
	'@': '.--.-.',
}

const MORSE_TO_CHAR: Record<string, string> = Object.fromEntries(
	Object.entries(CHAR_TO_MORSE).map(([char, morse]) => [morse, char]),
)

export function morseEncode(input: string): CipherResult {
	const words = input.split(' ')
	const encoded = words
		.map((word) => {
			return Array.from(word)
				.map((char) => CHAR_TO_MORSE[char.toUpperCase()] ?? null)
				.filter((m) => m !== null)
				.join(' ')
		})
		.filter((w) => w.length > 0)
		.join(' / ')

	return {
		output: encoded,
		algorithm: 'morse',
		inputLength: input.length,
		outputLength: encoded.length,
	}
}

export function morseDecode(input: string): CipherResult {
	const words = input.split(' / ')
	const decoded = words
		.map((word) => {
			return word
				.split(' ')
				.filter((code) => code.length > 0)
				.map((code) => MORSE_TO_CHAR[code] ?? '?')
				.join('')
		})
		.join(' ')

	return {
		output: decoded,
		algorithm: 'morse',
		inputLength: input.length,
		outputLength: decoded.length,
	}
}
