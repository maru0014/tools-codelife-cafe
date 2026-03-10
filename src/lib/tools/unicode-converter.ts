/**
 * テキストをユニコードエスケープシーケンス（\uXXXX）に変換する
 */
export function textToUnicode(text: string): string {
  if (!text) return '';
  return text
    .split('')
    .map((char) => {
      const hex = char.charCodeAt(0).toString(16).padStart(4, '0');
      return `\\u${hex}`;
    })
    .join('');
}

/**
 * ユニコードエスケープシーケンス（\uXXXX）を元のテキストにデコードする
 */
export function unicodeToText(unicodeStr: string): string {
  if (!unicodeStr) return '';
  try {
    // \uXXXX 形式を抽出して変換（大文字・小文字両対応）
    return unicodeStr.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
  } catch (e) {
    throw new Error('デコードに失敗しました。ユニコード形式が正しいか確認してください。');
  }
}
