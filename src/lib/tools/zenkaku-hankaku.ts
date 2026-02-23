// 全角↔半角変換ロジック（純粋関数）

export interface ConversionOptions {
  katakana: boolean;
  alpha: boolean;
  numbers: boolean;
  symbols: boolean;
}

export type Direction = 'toHankaku' | 'toZenkaku';

// 全角カタカナ → 半角カタカナ マッピング
const kanaMap: Record<string, string> = {
  'ガ': 'ｶﾞ', 'ギ': 'ｷﾞ', 'グ': 'ｸﾞ', 'ゲ': 'ｹﾞ', 'ゴ': 'ｺﾞ',
  'ザ': 'ｻﾞ', 'ジ': 'ｼﾞ', 'ズ': 'ｽﾞ', 'ゼ': 'ｾﾞ', 'ゾ': 'ｿﾞ',
  'ダ': 'ﾀﾞ', 'ヂ': 'ﾁﾞ', 'ヅ': 'ﾂﾞ', 'デ': 'ﾃﾞ', 'ド': 'ﾄﾞ',
  'バ': 'ﾊﾞ', 'ビ': 'ﾋﾞ', 'ブ': 'ﾌﾞ', 'ベ': 'ﾍﾞ', 'ボ': 'ﾎﾞ',
  'パ': 'ﾊﾟ', 'ピ': 'ﾋﾟ', 'プ': 'ﾌﾟ', 'ペ': 'ﾍﾟ', 'ポ': 'ﾎﾟ',
  'ヴ': 'ｳﾞ',
  'ア': 'ｱ', 'イ': 'ｲ', 'ウ': 'ｳ', 'エ': 'ｴ', 'オ': 'ｵ',
  'カ': 'ｶ', 'キ': 'ｷ', 'ク': 'ｸ', 'ケ': 'ｹ', 'コ': 'ｺ',
  'サ': 'ｻ', 'シ': 'ｼ', 'ス': 'ｽ', 'セ': 'ｾ', 'ソ': 'ｿ',
  'タ': 'ﾀ', 'チ': 'ﾁ', 'ツ': 'ﾂ', 'テ': 'ﾃ', 'ト': 'ﾄ',
  'ナ': 'ﾅ', 'ニ': 'ﾆ', 'ヌ': 'ﾇ', 'ネ': 'ﾈ', 'ノ': 'ﾉ',
  'ハ': 'ﾊ', 'ヒ': 'ﾋ', 'フ': 'ﾌ', 'ヘ': 'ﾍ', 'ホ': 'ﾎ',
  'マ': 'ﾏ', 'ミ': 'ﾐ', 'ム': 'ﾑ', 'メ': 'ﾒ', 'モ': 'ﾓ',
  'ヤ': 'ﾔ', 'ユ': 'ﾕ', 'ヨ': 'ﾖ',
  'ラ': 'ﾗ', 'リ': 'ﾘ', 'ル': 'ﾙ', 'レ': 'ﾚ', 'ロ': 'ﾛ',
  'ワ': 'ﾜ', 'ヲ': 'ｦ', 'ン': 'ﾝ',
  'ァ': 'ｧ', 'ィ': 'ｨ', 'ゥ': 'ｩ', 'ェ': 'ｪ', 'ォ': 'ｫ',
  'ッ': 'ｯ', 'ャ': 'ｬ', 'ュ': 'ｭ', 'ョ': 'ｮ',
  '。': '｡', '、': '､', 'ー': 'ｰ', '「': '｢', '」': '｣', '・': '･',
};

// 逆マッピング生成
const reverseKanaMap: Record<string, string> = {};
for (const [zen, han] of Object.entries(kanaMap)) {
  reverseKanaMap[han] = zen;
}

// 全角英字 ↔ 半角英字
function convertAlpha(text: string, direction: Direction): string {
  if (direction === 'toHankaku') {
    return text.replace(/[Ａ-Ｚａ-ｚ]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
    );
  }
  return text.replace(/[A-Za-z]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0xFEE0)
  );
}

// 全角数字 ↔ 半角数字
function convertNumbers(text: string, direction: Direction): string {
  if (direction === 'toHankaku') {
    return text.replace(/[０-９]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
    );
  }
  return text.replace(/[0-9]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0xFEE0)
  );
}

// 全角記号 ↔ 半角記号
const symbolMap: Record<string, string> = {
  '！': '!', '＂': '"', '＃': '#', '＄': '$', '％': '%', '＆': '&',
  '＇': "'", '（': '(', '）': ')', '＊': '*', '＋': '+', '，': ',',
  '－': '-', '．': '.', '／': '/', '：': ':', '；': ';', '＜': '<',
  '＝': '=', '＞': '>', '？': '?', '＠': '@', '［': '[', '＼': '\\',
  '］': ']', '＾': '^', '＿': '_', '｀': '`', '｛': '{', '｜': '|',
  '｝': '}', '～': '~', '　': ' ',
};

const reverseSymbolMap: Record<string, string> = {};
for (const [zen, han] of Object.entries(symbolMap)) {
  reverseSymbolMap[han] = zen;
}

function convertSymbols(text: string, direction: Direction): string {
  if (direction === 'toHankaku') {
    return text.replace(
      new RegExp(`[${Object.keys(symbolMap).join('')}]`, 'g'),
      (ch) => symbolMap[ch] ?? ch
    );
  }
  // 半角→全角: only convert specific symbols
  return text.replace(
    /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~ ]/g,
    (ch) => reverseSymbolMap[ch] ?? ch
  );
}

// 全角カナ ↔ 半角カナ
function convertKatakana(text: string, direction: Direction): string {
  if (direction === 'toHankaku') {
    let result = '';
    for (const ch of text) {
      result += kanaMap[ch] ?? ch;
    }
    return result;
  }
  // 半角→全角: need to handle dakuten/handakuten
  let result = '';
  let i = 0;
  while (i < text.length) {
    const twoChar = text.substring(i, i + 2);
    if (reverseKanaMap[twoChar]) {
      result += reverseKanaMap[twoChar];
      i += 2;
    } else {
      const oneChar = text[i];
      result += reverseKanaMap[oneChar] ?? oneChar;
      i += 1;
    }
  }
  return result;
}

export function convert(
  text: string,
  direction: Direction,
  options: ConversionOptions
): string {
  let result = text;
  if (options.katakana) result = convertKatakana(result, direction);
  if (options.alpha) result = convertAlpha(result, direction);
  if (options.numbers) result = convertNumbers(result, direction);
  if (options.symbols) result = convertSymbols(result, direction);
  return result;
}
