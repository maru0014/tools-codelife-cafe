import type { CipherDirection } from '@/lib/cipher'

export const caesarTestCases: { input: string; shift: number; direction: CipherDirection; expected: string }[] = [
  { input: 'abc', shift: 3, direction: 'encode', expected: 'def' },
  { input: 'ABC', shift: 3, direction: 'encode', expected: 'DEF' },
  { input: 'あいう', shift: 1, direction: 'encode', expected: 'いうえ' },
  { input: 'がぎぐ', shift: 1, direction: 'encode', expected: 'ぎぐげ' }, // Base NFD behavior check inside E2E might be tricky visually, but output should be clean
  { input: 'ぁぃぅ', shift: 1, direction: 'encode', expected: 'ぁぃぅ' }, // Small kana unaffected
]

export const morseTestCases: { input: string; expected: string }[] = [
  { input: 'SOS', expected: '... --- ...' },
  { input: 'Hello World', expected: '.... . .-.. .-.. --- / .-- --- .-. .-.. -..' },
]
