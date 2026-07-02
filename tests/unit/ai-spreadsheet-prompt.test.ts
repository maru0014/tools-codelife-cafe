// 実行方法: npm run test:unit（Node 22 の型ストリッピングで .ts を直接実行）
// 単体実行: node --test tests/unit/ai-spreadsheet-prompt.test.ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateSpreadsheetPrompt } from '../../src/lib/tools/ai-spreadsheet-prompt.ts';

test('TSV/Excel貼り付けデータを自動判定してMarkdown表付きプロンプトを生成する', () => {
	const result = generateSpreadsheetPrompt({
		input: '商品名\t売上\nコーヒー豆\t128000\nマグカップ\t54000',
		format: 'auto',
		task: 'analyze',
		maxRows: 30,
	});

	assert.equal(result.detectedDelimiter, '\t');
	assert.equal(result.rowCount, 3);
	assert.equal(result.columnCount, 2);
	assert.match(result.prompt, /以下の表データを分析/);
	assert.match(result.prompt, /\| 商品名 \| 売上 \|/);
	assert.match(result.prompt, /\| コーヒー豆 \| 128000 \|/);
});

test('CSVクォート、カンマ、改行、パイプをMarkdown向けに処理する', () => {
	const result = generateSpreadsheetPrompt({
		input: '名前,メモ\n"商品, A","1行目\n2行目"\n"A|B","引用""符"',
		format: 'csv',
		task: 'summarize',
		maxRows: 10,
	});

	assert.equal(result.detectedDelimiter, ',');
	assert.equal(result.rowCount, 3);
	assert.match(result.prompt, /商品, A/);
	assert.match(result.prompt, /1行目<br>2行目/);
	assert.match(result.prompt, /A\\\|B/);
	assert.match(result.prompt, /引用"符/);
});

test('最大行数を超える入力は先頭行に制限して警告する', () => {
	const result = generateSpreadsheetPrompt({
		input: '名前,売上\nA,100\nB,200\nC,300',
		format: 'csv',
		task: 'clean',
		maxRows: 2,
	});

	assert.equal(result.rowCount, 4);
	assert.equal(result.includedRows, 2);
	assert.equal(result.truncated, true);
	assert.match(result.warnings.join('\n'), /先頭2行のみ/);
	assert.doesNotMatch(result.prompt, /\| B \| 200 \|/);
});

test('自由指示と未クローズクォートの警告を扱う', () => {
	const result = generateSpreadsheetPrompt({
		input: '名前,メモ\nA,"未完了',
		format: 'csv',
		task: 'custom',
		customInstruction: '改善案だけを出してください。',
		maxRows: 10,
	});

	assert.match(result.prompt, /^改善案だけを出してください。/);
	assert.match(result.warnings.join('\n'), /ダブルクォート/);
});

test('空セルを含む行が列構造を保って保持され、完全な空行（改行のみ等）のみが除外される', () => {
	const result = generateSpreadsheetPrompt({
		input: '名前,値\nA,100\n,\nB,200\n\nC,300',
		format: 'csv',
		task: 'analyze',
		maxRows: 10,
	});

	assert.equal(result.rowCount, 5);
	assert.match(result.prompt, /\| 名前 \| 値 \|/);
	assert.match(result.prompt, /\| {2}\| {2}\|/);
	assert.match(result.prompt, /\| B \| 200 \|/);
});

test('maxRows が NaN や 0 の場合でもデフォルト値（30行）にフォールバックされる', () => {
	const inputLines = Array.from({ length: 40 }, (_, i) => `A${i},${i}`).join(
		'\n',
	);
	const resultNaN = generateSpreadsheetPrompt({
		input: `名前,値\n${inputLines}`,
		format: 'csv',
		task: 'analyze',
		maxRows: NaN,
	});

	assert.equal(resultNaN.includedRows, 30);
	assert.equal(resultNaN.truncated, true);

	const resultZero = generateSpreadsheetPrompt({
		input: `名前,値\n${inputLines}`,
		format: 'csv',
		task: 'analyze',
		maxRows: 0,
	});

	assert.equal(resultZero.includedRows, 30);
	assert.equal(resultZero.truncated, true);
});
