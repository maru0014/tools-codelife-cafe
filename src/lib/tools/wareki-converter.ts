export type CalendarKind = 'gregorian' | 'lunisolar';

export interface EraDefinition {
	id: string;
	name: string;
	aliases: string[];
	startYear: number;
	endYear: number;
	maxEraYear: number;
	sequence: number;
	calendar: CalendarKind;
}

export interface EraCandidate {
	eraId: string;
	eraName: string;
	eraYear: number;
	label: string;
	isFirstYear: boolean;
	sequence: number;
}

export type AgeResult =
	| { kind: 'exact'; value: number; referenceDate: string }
	| { kind: 'range'; min: number; max: number; referenceDate: string }
	| { kind: 'unavailable'; reason: string };

export interface ConversionResult {
	westernYear: number;
	eraCandidates: EraCandidate[];
	zodiac: string;
	age: AgeResult;
	notices: string[];
	error?: string;
}

export type NormalizeResult =
	| { ok: true; eraId: string; eraYear: number }
	| { ok: false; error: string };

/**
 * 元号マスタ（旧い順）。西暦→和暦は startYear <= year <= endYear を満たす候補を
 * すべて抽出し、sequence 昇順で表示する。1868年以降は既存の明治〜令和データを維持する。
 */
export const ERA_DEFINITIONS: EraDefinition[] = [
	{
		id: 'kouka',
		name: '弘化',
		aliases: ['弘化'],
		startYear: 1844,
		endYear: 1848,
		maxEraYear: 5,
		sequence: 1,
		calendar: 'lunisolar',
	},
	{
		id: 'kaei',
		name: '嘉永',
		aliases: ['嘉永'],
		startYear: 1848,
		endYear: 1854,
		maxEraYear: 7,
		sequence: 2,
		calendar: 'lunisolar',
	},
	{
		id: 'ansei',
		name: '安政',
		aliases: ['安政'],
		startYear: 1854,
		endYear: 1860,
		maxEraYear: 7,
		sequence: 3,
		calendar: 'lunisolar',
	},
	{
		id: 'manen',
		name: '万延',
		aliases: ['万延', '萬延'],
		startYear: 1860,
		endYear: 1861,
		maxEraYear: 2,
		sequence: 4,
		calendar: 'lunisolar',
	},
	{
		id: 'bunkyu',
		name: '文久',
		aliases: ['文久'],
		startYear: 1861,
		endYear: 1864,
		maxEraYear: 4,
		sequence: 5,
		calendar: 'lunisolar',
	},
	{
		id: 'genji',
		name: '元治',
		aliases: ['元治'],
		startYear: 1864,
		endYear: 1865,
		maxEraYear: 2,
		sequence: 6,
		calendar: 'lunisolar',
	},
	{
		id: 'keio',
		name: '慶応',
		aliases: ['慶応', '慶應'],
		startYear: 1865,
		endYear: 1868,
		maxEraYear: 4,
		sequence: 7,
		calendar: 'lunisolar',
	},
	{
		id: 'meiji',
		name: '明治',
		aliases: ['明治', 'M', '明'],
		startYear: 1868,
		endYear: 1912,
		maxEraYear: 45,
		sequence: 8,
		calendar: 'gregorian',
	},
	{
		id: 'taisho',
		name: '大正',
		aliases: ['大正', 'T', '大'],
		startYear: 1912,
		endYear: 1926,
		maxEraYear: 15,
		sequence: 9,
		calendar: 'gregorian',
	},
	{
		id: 'showa',
		name: '昭和',
		aliases: ['昭和', 'S', '昭'],
		startYear: 1926,
		endYear: 1989,
		maxEraYear: 64,
		sequence: 10,
		calendar: 'gregorian',
	},
	{
		id: 'heisei',
		name: '平成',
		aliases: ['平成', 'H', '平'],
		startYear: 1989,
		endYear: 2019,
		maxEraYear: 31,
		sequence: 11,
		calendar: 'gregorian',
	},
	{
		id: 'reiwa',
		name: '令和',
		aliases: ['令和', 'R', '令'],
		startYear: 2019,
		endYear: 9999,
		maxEraYear: 9999,
		sequence: 12,
		calendar: 'gregorian',
	},
];

/** 対応する最古の元号年（これより前の西暦年は「対応元号なし」となる） */
export const MIN_SUPPORTED_YEAR = ERA_DEFINITIONS[0].startYear;

const ERA_BY_ID = new Map(ERA_DEFINITIONS.map((era) => [era.id, era]));

const ZODIAC = [
	'申',
	'酉',
	'戌',
	'亥',
	'子',
	'丑',
	'寅',
	'卯',
	'辰',
	'巳',
	'午',
	'未',
];

export function isValidDate(year: number, month: number, day: number): boolean {
	if (month < 1 || month > 12 || day < 1 || day > 31) return false;
	const date = new Date(year, month - 1, day);
	return (
		date.getFullYear() === year &&
		date.getMonth() === month - 1 &&
		date.getDate() === day
	);
}

export function getZodiac(year: number): string {
	if (year < 0) return '';
	return ZODIAC[year % 12];
}

function formatEraLabel(eraName: string, eraYear: number): string {
	return eraYear === 1 ? `${eraName}元年` : `${eraName}${eraYear}年`;
}

/**
 * 西暦年から候補となる元号をすべて抽出し、sequence 昇順で返す。
 * 明治以降も含め、改元年は複数候補を返す（年単位換算のため月日は考慮しない）。
 */
export function getEraCandidates(westernYear: number): EraCandidate[] {
	return ERA_DEFINITIONS.filter(
		(era) => westernYear >= era.startYear && westernYear <= era.endYear,
	)
		.sort((a, b) => a.sequence - b.sequence)
		.map((era) => {
			const eraYear = westernYear - era.startYear + 1;
			return {
				eraId: era.id,
				eraName: era.name,
				eraYear,
				label: formatEraLabel(era.name, eraYear),
				isFirstYear: eraYear === 1,
				sequence: era.sequence,
			};
		});
}

function toDate(referenceDate: Date | string): Date {
	return typeof referenceDate === 'string'
		? new Date(referenceDate)
		: referenceDate;
}

function toIsoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/**
 * 年齢を算出する。基準日は引数として受け取り、実行時刻には依存しない。
 * - 誕生月日が判明している場合は満年齢を確定する（exact）
 * - 年のみの場合は「基準年-生年-1」〜「基準年-生年」の範囲を返す（range）
 * - 未来の年は unavailable を返す
 */
export function calculateAge(
	westernYear: number,
	referenceDate: Date | string,
	birthMonth?: number,
	birthDay?: number,
): AgeResult {
	const refDate = toDate(referenceDate);
	const referenceIso = toIsoDate(refDate);
	const refYear = refDate.getFullYear();

	if (westernYear > refYear) {
		return { kind: 'unavailable', reason: '未来の年は年齢を計算できません' };
	}

	if (birthMonth !== undefined && birthDay !== undefined) {
		if (!isValidDate(westernYear, birthMonth, birthDay)) {
			return { kind: 'unavailable', reason: '存在しない日付です' };
		}
		let value = refYear - westernYear;
		const hasHadBirthdayThisYear =
			refDate.getMonth() + 1 > birthMonth ||
			(refDate.getMonth() + 1 === birthMonth && refDate.getDate() >= birthDay);
		if (!hasHadBirthdayThisYear) {
			value -= 1;
		}
		return { kind: 'exact', value, referenceDate: referenceIso };
	}

	return {
		kind: 'range',
		min: refYear - westernYear - 1,
		max: refYear - westernYear,
		referenceDate: referenceIso,
	};
}

function buildNotices(
	westernYear: number,
	eraCandidates: EraCandidate[],
	age: AgeResult,
	birthMonth: number | undefined,
	birthDay: number | undefined,
): string[] {
	const notices: string[] = [];

	const hasLunisolarCandidate = eraCandidates.some(
		(candidate) => ERA_BY_ID.get(candidate.eraId)?.calendar === 'lunisolar',
	);

	if (hasLunisolarCandidate) {
		notices.push(
			'年単位の対応候補です。旧暦月日を新暦月日に変換した結果ではありません。',
		);
		if (birthMonth !== undefined && birthDay !== undefined) {
			notices.push(
				'旧暦期間の月日は厳密な日付換算の対象外のため、年齢計算には使用していません。',
			);
		}
	}

	if (westernYear === MIN_SUPPORTED_YEAR) {
		notices.push('これより前の元号（天保）が併存する可能性があります。');
	}

	// 旧暦期間はそもそも年単位換算である旨を既に案内済みのため、
	// 「誕生日前後で年齢が変わる」注記は近代以降（年のみ入力）の場合にのみ表示する。
	if (age.kind === 'range' && !hasLunisolarCandidate) {
		notices.push('誕生日前後で年齢が変わるため、範囲で表示しています。');
	}

	return notices;
}

/**
 * 西暦年（および任意の月日）から一覧表示用の変換結果を生成する。
 */
export function convertWesternYearToResult(
	westernYear: number,
	referenceDate: Date | string,
	birthMonth?: number,
	birthDay?: number,
): ConversionResult {
	const eraCandidates = getEraCandidates(westernYear);
	const hasLunisolarCandidate = eraCandidates.some(
		(c) => ERA_BY_ID.get(c.eraId)?.calendar === 'lunisolar',
	);
	const ageBirthMonth = hasLunisolarCandidate ? undefined : birthMonth;
	const ageBirthDay = hasLunisolarCandidate ? undefined : birthDay;

	const age = calculateAge(
		westernYear,
		referenceDate,
		ageBirthMonth,
		ageBirthDay,
	);

	return {
		westernYear,
		eraCandidates,
		zodiac: getZodiac(westernYear),
		age,
		notices: buildNotices(
			westernYear,
			eraCandidates,
			age,
			birthMonth,
			birthDay,
		),
	};
}

/**
 * 元号名・略記・全角数字・漢数字・元年表記を含む文字列を正規化し、
 * eraId と元号年（整数）に解決する。解釈不能・未対応形式はエラーを返す。
 */
export function normalizeWarekiInput(raw: string): NormalizeResult {
	const trimmed = raw.trim();
	if (trimmed === '') {
		return { ok: false, error: '和暦を入力してください' };
	}

	const halfWidth = zenkakuToHankaku(trimmed);

	// 元号エイリアスは長い文字列から優先的にマッチさせる（例: "昭和" を "昭" より先に判定）
	const sortedAliases = ERA_DEFINITIONS.flatMap((era) =>
		era.aliases.map((alias) => ({ era, alias })),
	).sort((a, b) => b.alias.length - a.alias.length);

	const matched = sortedAliases.find(({ alias }) =>
		startsWithAlias(halfWidth, alias),
	);

	if (!matched) {
		return {
			ok: false,
			error: '元号を認識できませんでした（例: 昭和45年 / S45 / 令和元年）',
		};
	}

	let rest = halfWidth.slice(matched.alias.length).trim();
	rest = rest.replace(/年$/, '');

	if (rest === '') {
		return { ok: false, error: '元号の年を入力してください' };
	}

	if (rest === '元') {
		return { ok: true, eraId: matched.era.id, eraYear: 1 };
	}

	const unsupportedNumeral = /[壱弐参拾廿]/;
	if (unsupportedNumeral.test(rest)) {
		return {
			ok: false,
			error: '未対応の数字表記です（大字・「廿」等は非対応）',
		};
	}

	const yearValue = parseYearToken(rest);
	if (yearValue === null || yearValue < 1 || yearValue > 99) {
		return { ok: false, error: '年の値を認識できませんでした' };
	}

	return { ok: true, eraId: matched.era.id, eraYear: yearValue };
}

function startsWithAlias(value: string, alias: string): boolean {
	if (/^[A-Za-z]+$/.test(alias)) {
		return value.slice(0, alias.length).toUpperCase() === alias.toUpperCase();
	}
	return value.startsWith(alias);
}

function zenkakuToHankaku(value: string): string {
	return value.replace(/[０-９]/g, (char) =>
		String.fromCharCode(char.charCodeAt(0) - 0xfee0),
	);
}

const KANJI_DIGITS: Record<string, number> = {
	〇: 0,
	零: 0,
	一: 1,
	二: 2,
	三: 3,
	四: 4,
	五: 5,
	六: 6,
	七: 7,
	八: 8,
	九: 9,
};

/**
 * 元号年トークンを整数へ変換する。半角数字はそのまま、漢数字は
 * 「十」を含む合成表記（四十五=45）と、桁読み表記（四五=45）の両方に対応する。
 */
function parseYearToken(token: string): number | null {
	if (/^\d+$/.test(token)) {
		return Number.parseInt(token, 10);
	}

	if (![...token].every((ch) => ch === '十' || ch in KANJI_DIGITS)) {
		return null;
	}

	if (token.includes('十')) {
		const [tensPartRaw, onesPartRaw] = token.split('十');
		if (onesPartRaw?.includes('十')) return null;
		const tens = tensPartRaw === '' ? 1 : KANJI_DIGITS[tensPartRaw];
		const ones =
			onesPartRaw === undefined || onesPartRaw === ''
				? 0
				: KANJI_DIGITS[onesPartRaw];
		if (tens === undefined || ones === undefined) return null;
		return tens * 10 + ones;
	}

	if (token.length === 1) {
		return KANJI_DIGITS[token];
	}
	if (token.length === 2) {
		const [a, b] = [...token];
		if (KANJI_DIGITS[a] === undefined || KANJI_DIGITS[b] === undefined) {
			return null;
		}
		return KANJI_DIGITS[a] * 10 + KANJI_DIGITS[b];
	}

	return null;
}

/**
 * 元号IDと元号年（および任意の月日）から一覧表示用の変換結果を生成する。
 * maxEraYear を超える入力は範囲外エラーとして返す。
 */
export function convertWarekiToResult(
	eraId: string,
	eraYear: number,
	referenceDate: Date | string,
	birthMonth?: number,
	birthDay?: number,
): ConversionResult {
	const era = ERA_BY_ID.get(eraId);
	if (!era) {
		return {
			westernYear: 0,
			eraCandidates: [],
			zodiac: '',
			age: { kind: 'unavailable', reason: '不正な元号です' },
			notices: [],
			error: '不正な元号です',
		};
	}

	if (eraYear < 1 || eraYear > era.maxEraYear) {
		return {
			westernYear: 0,
			eraCandidates: [],
			zodiac: '',
			age: { kind: 'unavailable', reason: '範囲外の元号年です' },
			notices: [],
			error: `${era.name}は1〜${era.maxEraYear}年の範囲で入力してください`,
		};
	}

	const westernYear = era.startYear + eraYear - 1;
	return convertWesternYearToResult(
		westernYear,
		referenceDate,
		birthMonth,
		birthDay,
	);
}

/** 和暦欄の表示文字列。対応元号が無い場合は「対応元号なし」を返す。 */
export function formatEraColumnText(result: ConversionResult): string {
	if (result.eraCandidates.length === 0) return '対応元号なし';
	return result.eraCandidates.map((c) => c.label).join(' / ');
}

/** 年齢欄の表示文字列。 */
export function formatAgeColumnText(result: ConversionResult): string {
	const { age } = result;
	if (age.kind === 'exact') return `${age.value}歳`;
	if (age.kind === 'range') return `${age.min}〜${age.max}歳`;
	return age.reason;
}

/**
 * 一覧表示と同一の結果モデルから、コピー用テキストを生成する（設計書 8.）。
 * 表示・コピーの不一致を防ぐため、必ずこの関数経由で文字列化する。
 */
export function formatResultForCopy(result: ConversionResult): string {
	const lines = [
		`和暦: ${formatEraColumnText(result)}`,
		`西暦: ${result.westernYear}年`,
		`干支: ${result.zodiac}年`,
		`年齢: ${formatAgeColumnText(result)}`,
	];
	for (const notice of result.notices) {
		lines.push(`注意: ${notice}`);
	}
	return lines.join('\n');
}
