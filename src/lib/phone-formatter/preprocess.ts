/**
 * 電話番号の前処理モジュール
 * 全角文字→半角変換、特殊文字の正規化を行う
 */

/**
 * 全角数字を半角数字に変換する
 */
function convertFullwidthDigits(str: string): string {
  return str.replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xFF10 + 0x30)
  );
}

/**
 * 全角ハイフン・ダッシュ類を半角ハイフンに変換する
 */
function convertFullwidthHyphens(str: string): string {
  // ー(ー U+30FC), −(U+2212), ‐(U+2010), ―(U+2015), ﹣(U+FE63),－(U+FF0D)
  return str.replace(/[ー−‐―﹣－]/g, '-');
}

/**
 * 全角括弧を半角括弧に変換する
 */
function convertFullwidthParentheses(str: string): string {
  return str.replace(/（/g, '(').replace(/）/g, ')');
}

/**
 * パース用に数字と+のみに絞り込む（ハイフン・スペース・括弧をstrip）
 * 先頭の+は国際番号フォーマットとして保持
 */
function stripSeparators(str: string): string {
  // 先頭の+を保持しつつ、数字以外を除去
  const hasPlus = str.startsWith('+');
  const digitsOnly = str.replace(/\D/g, '');
  return hasPlus ? '+' + digitsOnly : digitsOnly;
}

/**
 * 生の入力文字列を前処理してパース可能な形式に変換する
 * 
 * @param raw - 元の入力文字列
 * @returns パース用に正規化されたクリーンな文字列
 * 
 * @example
 * preprocessInput('０３−１２３４−５６７８') // => '0312345678'
 * preprocessInput('+81 3-1234-5678')       // => '+81312345678'
 * preprocessInput('（03）1234-5678')       // => '0312345678'
 */
export function preprocessInput(raw: string): string {
  let result = raw;
  
  // 1. 全角数字→半角
  result = convertFullwidthDigits(result);
  
  // 2. 全角ハイフン類→半角ハイフン
  result = convertFullwidthHyphens(result);
  
  // 3. 全角括弧→半角括弧
  result = convertFullwidthParentheses(result);
  
  // 4. セパレータ（スペース・括弧・ハイフン）を除去してパース用文字列を生成
  result = stripSeparators(result);
  
  return result;
}
