import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	calculateAge,
	convertWarekiToResult,
	convertWesternYearToResult,
	ERA_DEFINITIONS,
	formatEraColumnText,
	formatResultForCopy,
	getEraCandidates,
	getZodiac,
	isValidDate,
	normalizeWarekiInput,
} from '../../src/lib/tools/wareki-converter.ts';

const REF_DATE = '2026-07-12';

function labelsOf(westernYear: number): string[] {
	return getEraCandidates(westernYear).map((c) => c.label);
}

test('isValidDate: 正常系・うるう年および存在しない日付の判定', () => {
	assert.strictEqual(
		isValidDate(2024, 2, 29),
		true,
		'2024年はうるう年のため2/29は有効',
	);
	assert.strictEqual(
		isValidDate(2023, 2, 29),
		false,
		'2023年は平年のため2/29は無効',
	);
	assert.strictEqual(isValidDate(2023, 2, 31), false, '2/31は無効');
	assert.strictEqual(isValidDate(2023, 13, 1), false, '13月は無効');
});

test('元号開始年・終了年・中間年の換算', () => {
	assert.deepStrictEqual(labelsOf(1927), ['昭和2年']);
	assert.deepStrictEqual(labelsOf(1970), ['昭和45年']);
	assert.deepStrictEqual(labelsOf(2000), ['平成12年']);
});

test('弘化〜慶応: 各元号の元年・最終年・最大元号年超過', () => {
	const cases: Array<{
		eraId: string;
		era: string;
		firstYearWestern: number;
		lastEraYear: number;
		lastYearWestern: number;
	}> = [
		{
			eraId: 'kouka',
			era: '弘化',
			firstYearWestern: 1844,
			lastEraYear: 5,
			lastYearWestern: 1848,
		},
		{
			eraId: 'kaei',
			era: '嘉永',
			firstYearWestern: 1848,
			lastEraYear: 7,
			lastYearWestern: 1854,
		},
		{
			eraId: 'ansei',
			era: '安政',
			firstYearWestern: 1854,
			lastEraYear: 7,
			lastYearWestern: 1860,
		},
		{
			eraId: 'manen',
			era: '万延',
			firstYearWestern: 1860,
			lastEraYear: 2,
			lastYearWestern: 1861,
		},
		{
			eraId: 'bunkyu',
			era: '文久',
			firstYearWestern: 1861,
			lastEraYear: 4,
			lastYearWestern: 1864,
		},
		{
			eraId: 'genji',
			era: '元治',
			firstYearWestern: 1864,
			lastEraYear: 2,
			lastYearWestern: 1865,
		},
		{
			eraId: 'keio',
			era: '慶応',
			firstYearWestern: 1865,
			lastEraYear: 4,
			lastYearWestern: 1868,
		},
	];

	for (const c of cases) {
		const firstResult = convertWarekiToResult(c.eraId, 1, REF_DATE);
		assert.strictEqual(
			firstResult.westernYear,
			c.firstYearWestern,
			`${c.era}元年は${c.firstYearWestern}年`,
		);

		const lastResult = convertWarekiToResult(c.eraId, c.lastEraYear, REF_DATE);
		assert.strictEqual(
			lastResult.westernYear,
			c.lastYearWestern,
			`${c.era}${c.lastEraYear}年は${c.lastYearWestern}年`,
		);

		const overResult = convertWarekiToResult(
			c.eraId,
			c.lastEraYear + 1,
			REF_DATE,
		);
		assert.ok(
			overResult.error,
			`${c.era}${c.lastEraYear + 1}年は範囲外エラーになること`,
		);
	}
});

test('1854年は嘉永7年/安政元年、1855年は安政2年のみ', () => {
	assert.deepStrictEqual(labelsOf(1854), ['嘉永7年', '安政元年']);
	assert.deepStrictEqual(labelsOf(1855), ['安政2年']);
});

test('1848年は弘化5年/嘉永元年、1849年は嘉永2年のみ', () => {
	assert.deepStrictEqual(labelsOf(1848), ['弘化5年', '嘉永元年']);
	assert.deepStrictEqual(labelsOf(1849), ['嘉永2年']);
});

test('万延2年=1861年、文久4年=1864年、元治2年=1865年として受理される', () => {
	assert.strictEqual(
		convertWarekiToResult('manen', 2, REF_DATE).westernYear,
		1861,
	);
	assert.strictEqual(
		convertWarekiToResult('bunkyu', 4, REF_DATE).westernYear,
		1864,
	);
	assert.strictEqual(
		convertWarekiToResult('genji', 2, REF_DATE).westernYear,
		1865,
	);
});

test('1844年で下限境界の注記が生成され、1843年以前は対応元号なしになる', () => {
	const result1844 = convertWesternYearToResult(1844, REF_DATE);
	assert.deepStrictEqual(labelsOf(1844), ['弘化元年']);
	assert.ok(
		result1844.notices.some((n) => n.includes('天保')),
		'1844年には天保併存の注記が含まれること',
	);

	assert.deepStrictEqual(getEraCandidates(1843), [], '1843年は対応元号なし');
	assert.deepStrictEqual(getEraCandidates(1700), [], '1700年は対応元号なし');
});

test('嘉永8年・安政8年・慶応5年は範囲外エラー', () => {
	assert.ok(convertWarekiToResult('kaei', 8, REF_DATE).error);
	assert.ok(convertWarekiToResult('ansei', 8, REF_DATE).error);
	assert.ok(convertWarekiToResult('keio', 5, REF_DATE).error);
});

test('改元年の複数候補がsequence昇順で表示される', () => {
	assert.deepStrictEqual(labelsOf(1860), ['安政7年', '万延元年']);
	assert.deepStrictEqual(labelsOf(1861), ['万延2年', '文久元年']);
	assert.deepStrictEqual(labelsOf(1864), ['文久4年', '元治元年']);
	assert.deepStrictEqual(labelsOf(1865), ['元治2年', '慶応元年']);
	assert.deepStrictEqual(labelsOf(1868), ['慶応4年', '明治元年']);
	assert.deepStrictEqual(labelsOf(1912), ['明治45年', '大正元年']);
	assert.deepStrictEqual(labelsOf(1926), ['大正15年', '昭和元年']);
	assert.deepStrictEqual(labelsOf(1989), ['昭和64年', '平成元年']);
	assert.deepStrictEqual(labelsOf(2019), ['平成31年', '令和元年']);
});

test('入力正規化: 元年、全角数字、漢数字、略記(M/T/S/H/R)、昭45形式', () => {
	assert.deepStrictEqual(normalizeWarekiInput('令和元年'), {
		ok: true,
		eraId: 'reiwa',
		eraYear: 1,
	});
	assert.deepStrictEqual(normalizeWarekiInput('昭和４５年'), {
		ok: true,
		eraId: 'showa',
		eraYear: 45,
	});
	assert.deepStrictEqual(normalizeWarekiInput('昭和四十五年'), {
		ok: true,
		eraId: 'showa',
		eraYear: 45,
	});
	assert.deepStrictEqual(normalizeWarekiInput('昭和四五年'), {
		ok: true,
		eraId: 'showa',
		eraYear: 45,
	});
	assert.deepStrictEqual(normalizeWarekiInput('S45'), {
		ok: true,
		eraId: 'showa',
		eraYear: 45,
	});
	assert.deepStrictEqual(normalizeWarekiInput('昭45'), {
		ok: true,
		eraId: 'showa',
		eraYear: 45,
	});
	assert.deepStrictEqual(normalizeWarekiInput('M45'), {
		ok: true,
		eraId: 'meiji',
		eraYear: 45,
	});
	assert.deepStrictEqual(normalizeWarekiInput('T15'), {
		ok: true,
		eraId: 'taisho',
		eraYear: 15,
	});
	assert.deepStrictEqual(normalizeWarekiInput('H31'), {
		ok: true,
		eraId: 'heisei',
		eraYear: 31,
	});
	assert.deepStrictEqual(normalizeWarekiInput('R6'), {
		ok: true,
		eraId: 'reiwa',
		eraYear: 6,
	});
});

test('旧字体正規化: 慶應3年は1867年、萬延元年は1860年になる', () => {
	const keio = normalizeWarekiInput('慶應3年');
	assert.ok(keio.ok);
	if (keio.ok) {
		assert.strictEqual(
			convertWarekiToResult(keio.eraId, keio.eraYear, REF_DATE).westernYear,
			1867,
		);
	}

	const manen = normalizeWarekiInput('萬延元年');
	assert.ok(manen.ok);
	if (manen.ok) {
		assert.strictEqual(
			convertWarekiToResult(manen.eraId, manen.eraYear, REF_DATE).westernYear,
			1860,
		);
	}
});

test('壱・弐・参・廿は未対応形式として扱われる', () => {
	for (const input of ['昭和壱年', '昭和弐年', '昭和参年', '昭和廿年']) {
		const result = normalizeWarekiInput(input);
		assert.strictEqual(result.ok, false, `${input}は未対応形式`);
	}
});

test('範囲外の元号年、未知の元号、空入力はエラーになる', () => {
	assert.strictEqual(normalizeWarekiInput('').ok, false, '空入力はエラー');
	assert.strictEqual(normalizeWarekiInput('   ').ok, false, '空白のみはエラー');
	assert.strictEqual(
		normalizeWarekiInput('存在しない元号5年').ok,
		false,
		'未知の元号はエラー',
	);
	assert.ok(
		convertWarekiToResult('showa', 100, REF_DATE).error,
		'範囲外の元号年はエラー',
	);
	assert.ok(
		convertWarekiToResult('unknown-era', 1, REF_DATE).error,
		'未知のeraIdはエラー',
	);
});

test('年齢計算: 基準日を固定した場合の年のみ入力の範囲', () => {
	const age = calculateAge(1970, REF_DATE);
	assert.deepStrictEqual(age, {
		kind: 'range',
		min: 55,
		max: 56,
		referenceDate: '2026-07-12',
	});
});

test('年齢計算: 基準日を固定した場合の満年齢（誕生日前後）', () => {
	const beforeBirthday = calculateAge(1970, '2026-07-11', 7, 12);
	assert.strictEqual(beforeBirthday.kind, 'exact');
	if (beforeBirthday.kind === 'exact') {
		assert.strictEqual(beforeBirthday.value, 55, '誕生日前日はまだ55歳');
	}

	const onBirthday = calculateAge(1970, '2026-07-12', 7, 12);
	assert.strictEqual(onBirthday.kind, 'exact');
	if (onBirthday.kind === 'exact') {
		assert.strictEqual(onBirthday.value, 56, '誕生日当日から56歳');
	}
});

test('年齢計算: 実行日ではなく渡された基準日にのみ依存する', () => {
	const resultA = calculateAge(2000, '2020-01-01');
	const resultB = calculateAge(2000, '2020-01-01');
	assert.deepStrictEqual(
		resultA,
		resultB,
		'同一の基準日なら常に同じ結果になること',
	);
});

test('年齢計算: 未来の年はunavailableになる', () => {
	const result = calculateAge(2999, REF_DATE);
	assert.strictEqual(result.kind, 'unavailable');
});

test('1868年（慶応4年/明治元年）の一覧・年齢・注意表示', () => {
	const result = convertWesternYearToResult(1868, REF_DATE);
	assert.deepStrictEqual(
		result.eraCandidates.map((c) => c.label),
		['慶応4年', '明治元年'],
	);
	assert.strictEqual(result.zodiac, '辰');
	assert.deepStrictEqual(result.age, {
		kind: 'range',
		min: 157,
		max: 158,
		referenceDate: '2026-07-12',
	});
	assert.ok(
		result.notices.some((n) =>
			n.includes('旧暦月日を新暦月日に変換した結果ではありません'),
		),
	);
});

test('回帰: 既存の明治・大正・昭和・平成・令和の変換', () => {
	assert.strictEqual(
		convertWarekiToResult('meiji', 1, REF_DATE).westernYear,
		1868,
	);
	assert.strictEqual(
		convertWarekiToResult('taisho', 1, REF_DATE).westernYear,
		1912,
	);
	assert.strictEqual(
		convertWarekiToResult('showa', 1, REF_DATE).westernYear,
		1926,
	);
	assert.strictEqual(
		convertWarekiToResult('heisei', 1, REF_DATE).westernYear,
		1989,
	);
	assert.strictEqual(
		convertWarekiToResult('reiwa', 1, REF_DATE).westernYear,
		2019,
	);
	assert.deepStrictEqual(labelsOf(2000), ['平成12年']);
});

test('回帰: 干支計算', () => {
	assert.strictEqual(getZodiac(2024), '辰');
	assert.strictEqual(getZodiac(2000), '辰');
	assert.strictEqual(getZodiac(1868), '辰');
});

test('コピー結果は一覧表示（同一の結果モデル）と一致する', () => {
	const result = convertWesternYearToResult(1868, REF_DATE);
	assert.strictEqual(formatEraColumnText(result), '慶応4年 / 明治元年');
	const copyText = formatResultForCopy(result);
	assert.strictEqual(
		copyText,
		[
			'和暦: 慶応4年 / 明治元年',
			'西暦: 1868年',
			'干支: 辰年',
			'年齢: 157〜158歳',
			'注意: 年単位の対応候補です。旧暦月日を新暦月日に変換した結果ではありません。',
		].join('\n'),
	);
});

test('対応元号なし（1843年以前）の和暦欄表示', () => {
	const result = convertWesternYearToResult(1700, REF_DATE);
	assert.strictEqual(formatEraColumnText(result), '対応元号なし');
});

test('元号マスタはsequence昇順で12件定義されている', () => {
	assert.strictEqual(ERA_DEFINITIONS.length, 12);
	const sequences = ERA_DEFINITIONS.map((e) => e.sequence);
	assert.deepStrictEqual(
		sequences,
		[...sequences].sort((a, b) => a - b),
	);
});
