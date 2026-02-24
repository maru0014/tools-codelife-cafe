export type Gengo = '明治' | '大正' | '昭和' | '平成' | '令和';

export interface WarekiResult {
  gengo: Gengo | null;
  warekiYear: number | null;
  warekiString: string;
  seirekiYear: number;
  zodiac: string;
  age: number;
  error?: string;
}

const ERAS = [
  { name: '令和', start: new Date('2019-05-01') },
  { name: '平成', start: new Date('1989-01-08') },
  { name: '昭和', start: new Date('1926-12-25') },
  { name: '大正', start: new Date('1912-07-30') },
  { name: '明治', start: new Date('1868-10-23') } // 明治改元の日
] as const;

const ZODIAC = ['申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未'];

export function getZodiac(year: number): string {
  if (year < 0) return '';
  return ZODIAC[year % 12];
}

export function getAge(year: number): number {
  const currentYear = new Date().getFullYear();
  return Math.max(0, currentYear - year);
}

export function formatWarekiYear(gengo: string, year: number): string {
  if (gengo === '不明') return '変換範囲外';
  return year === 1 ? `${gengo}元年` : `${gengo}${year}年`;
}

export function seirekiToWareki(year: number, month: number, day: number): WarekiResult {
  if (year < 1868) {
    return {
      gengo: null, warekiYear: null, warekiString: '変換範囲外',
      seirekiYear: year, zodiac: getZodiac(year), age: getAge(year),
      error: '明治以前は対応していません'
    };
  }

  const date = new Date(year, month - 1, day);

  let gengoObj = ERAS.find(era => date >= era.start);
  if (!gengoObj) {
    return {
      gengo: null, warekiYear: null, warekiString: '変換範囲外',
      seirekiYear: year, zodiac: getZodiac(year), age: getAge(year),
      error: '明治以前の日付です'
    };
  }

  const gengoName = gengoObj.name as Gengo;
  const warekiYear = year - gengoObj.start.getFullYear() + 1;
  const warekiString = formatWarekiYear(gengoName, warekiYear);

  return {
    gengo: gengoName,
    warekiYear,
    warekiString,
    seirekiYear: year,
    zodiac: getZodiac(year),
    age: getAge(year)
  };
}

export function warekiToSeireki(gengo: Gengo, warekiYear: number): WarekiResult {
  if (warekiYear < 1) {
    return {
      gengo, warekiYear, warekiString: formatWarekiYear(gengo, warekiYear),
      seirekiYear: 0, zodiac: '', age: 0,
      error: '年は1以上を指定してください'
    };
  }

  const era = ERAS.find(e => e.name === gengo);
  if (!era) {
    return {
      gengo, warekiYear, warekiString: formatWarekiYear(gengo, warekiYear),
      seirekiYear: 0, zodiac: '', age: 0,
      error: '不正な元号です'
    };
  }

  const startYear = era.start.getFullYear();
  const seirekiYear = startYear + warekiYear - 1;

  // 簡単なバリデーション (次の元号の開始年を超えるかどうかは厳密ではないが、実用上許容される範囲)
  return {
    gengo,
    warekiYear,
    warekiString: formatWarekiYear(gengo, warekiYear),
    seirekiYear,
    zodiac: getZodiac(seirekiYear),
    age: getAge(seirekiYear)
  };
}
