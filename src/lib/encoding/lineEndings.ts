export function detectLineEnding(str: string): 'CRLF' | 'LF' | 'CR' | 'MIXED' | 'NONE' {
  const crlfCount = (str.match(/\r\n/g) || []).length;
  // \r or \n that is not part of \r\n
  const lfCount = (str.match(/(?<!\r)\n/g) || []).length;
  const crCount = (str.match(/\r(?!\n)/g) || []).length;

  const counts = [
    { type: 'CRLF' as const, count: crlfCount },
    { type: 'LF' as const, count: lfCount },
    { type: 'CR' as const, count: crCount },
  ].filter(c => c.count > 0);

  if (counts.length === 0) {
    return 'NONE';
  }

  if (counts.length > 1) {
    return 'MIXED';
  }

  return counts[0].type;
}
