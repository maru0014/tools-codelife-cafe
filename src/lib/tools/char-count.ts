// 文字数カウントロジック（純粋関数）

export interface CharCountResult {
  charsWithSpaces: number;
  charsWithoutSpaces: number;
  bytesUtf8: number;
  bytesShiftJis: number;
  lines: number;
  manuscriptPages: number; // 原稿用紙 400字詰め
}

// Shift-JISバイト数計算（簡易版）
function getShiftJisBytes(text: string): number {
  let bytes = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code <= 0x7F) {
      // ASCII
      bytes += 1;
    } else if (code >= 0xFF61 && code <= 0xFF9F) {
      // 半角カタカナ
      bytes += 1;
    } else {
      // その他（日本語含む全角文字）
      bytes += 2;
    }
  }
  return bytes;
}

// UTF-8バイト数計算
function getUtf8Bytes(text: string): number {
  return new TextEncoder().encode(text).length;
}

export function countChars(text: string): CharCountResult {
  const charsWithSpaces = [...text].length;
  const charsWithoutSpaces = [...text.replace(/\s/g, '')].length;
  const bytesUtf8 = getUtf8Bytes(text);
  const bytesShiftJis = getShiftJisBytes(text);
  const lines = text === '' ? 0 : text.split('\n').length;
  const manuscriptPages = Math.ceil(charsWithSpaces / 400) || 0;

  return {
    charsWithSpaces,
    charsWithoutSpaces,
    bytesUtf8,
    bytesShiftJis,
    lines,
    manuscriptPages,
  };
}

// SNS文字数制限チェック
export function getTwitterProgress(charCount: number): {
  percentage: number;
  remaining: number;
  isOver: boolean;
} {
  const limit = 140;
  return {
    percentage: Math.min((charCount / limit) * 100, 100),
    remaining: limit - charCount,
    isOver: charCount > limit,
  };
}
