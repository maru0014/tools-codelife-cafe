export interface RegexMatch {
  value: string;
  index: number;
  groups: string[];
}

export interface RegexResult {
  matches: RegexMatch[];
  error?: string;
  replacedText?: string;
}

export const COMMON_PATTERNS = [
  { label: 'メールアドレス', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
  { label: '電話番号', pattern: '0\\d{1,3}-\\d{2,4}-\\d{4}', flags: 'g' },
  { label: '郵便番号', pattern: '\\d{3}-\\d{4}', flags: 'g' },
  { label: 'URL', pattern: 'https?:\\/\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=]+', flags: 'g' },
  { label: '日本語のみ', pattern: '[\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FFF]+', flags: 'g' },
];

export function testRegex(
  pattern: string,
  flags: string,
  text: string,
  replacement?: string
): RegexResult {
  if (!pattern) return { matches: [] };

  try {
    const regex = new RegExp(pattern, flags);
    const matches: RegexMatch[] = [];

    if (regex.global) {
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          value: match[0],
          index: match.index,
          groups: match.slice(1)
        });
        // Avoid infinite loops with zero-length matches
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
    } else {
      const match = regex.exec(text);
      if (match) {
        matches.push({
          value: match[0],
          index: match.index,
          groups: match.slice(1)
        });
      }
    }

    let replacedText;
    if (replacement !== undefined) {
      replacedText = text.replace(regex, replacement);
    }

    return { matches, replacedText };
  } catch (err: any) {
    return { matches: [], error: err.message };
  }
}
