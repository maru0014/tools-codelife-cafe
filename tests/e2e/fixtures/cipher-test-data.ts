export const caesarTestCases = [
	{ input: 'abc', shift: 3, direction: 'encode' as const, expected: 'def' },
	{ input: 'ABC', shift: 3, direction: 'encode' as const, expected: 'DEF' },
	{ input: 'xyz', shift: 3, direction: 'encode' as const, expected: 'abc' },
	{ input: 'def', shift: 3, direction: 'decode' as const, expected: 'abc' },
	{ input: 'Hello! 123', shift: 1, direction: 'encode' as const, expected: 'Ifmmp! 123' },
] as const;

export const morseTestCases = [
	{ input: 'SOS', expected: '... --- ...' },
	{ input: 'A', expected: '.-' },
	{ input: 'Hello World', expectedContains: '/' },
] as const;
