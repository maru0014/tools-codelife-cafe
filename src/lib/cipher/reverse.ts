import type { CipherResult } from './types'

export function reverseString(input: string): CipherResult {
	let output: string

	if (typeof Intl !== 'undefined' && typeof Intl.Segmenter !== 'undefined') {
		const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
		const segments = Array.from(segmenter.segment(input), (s) => s.segment)
		output = segments.reverse().join('')
	} else {
		// Fallback: handles surrogate pairs but not all grapheme clusters
		output = Array.from(input).reverse().join('')
	}

	return {
		output,
		algorithm: 'reverse',
		inputLength: input.length,
		outputLength: output.length,
	}
}
