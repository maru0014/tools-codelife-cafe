import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from './fixtures/base';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('CSV/TSV/Excel Viewer & Editor (Phase 3 Enhancements)', () => {
	test('should load the page correctly and show initial UI', async ({
		createToolPage,
	}) => {
		const toolPage = createToolPage('csv-editor');
		await toolPage.goto();
		await toolPage.expectTitle('CSVビューア/エディタ | CODE:LIFE Tools');
		await toolPage.expectSafetyBadge();
	});

	test('should parse CSV and allow table editing and Undo', async ({
		page,
		createToolPage,
	}) => {
		const toolPage = createToolPage('csv-editor');
		await toolPage.goto();

		const inputArea = page.getByRole('textbox').first();
		await inputArea.fill('名前,年齢,部署\n田中,25,開発\n佐藤,30,営業');
		await page.getByRole('button', { name: 'パースして編集へ' }).click();

		await expect(page.getByRole('tab', { name: /テーブル/ })).toHaveAttribute(
			'data-state',
			'active',
		);
		await expect(page.getByRole('button', { name: /行を追加/i })).toBeVisible();

		const inputs = page.locator('table input[type="text"]');
		await expect(inputs.nth(0)).toHaveValue('名前');
		await expect(inputs.nth(3)).toHaveValue('田中');

		// Cell editing
		await inputs.nth(3).fill('田中太郎');
		await expect(inputs.nth(3)).toHaveValue('田中太郎');

		// Undo
		await page.getByRole('button', { name: 'Undo' }).click();
		await expect(inputs.nth(3)).toHaveValue('田中');
	});

	test('should import TSV file correctly', async ({ page, createToolPage }) => {
		const toolPage = createToolPage('csv-editor');
		await toolPage.goto();

		const tsvPath = path.join(__dirname, '../fixtures/sample-data.tsv');
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(tsvPath);

		await expect(page.getByRole('tab', { name: /テーブル/ })).toHaveAttribute(
			'data-state',
			'active',
		);
		const inputs = page.locator('table input[type="text"]');
		await expect(inputs.nth(0)).toHaveValue('名前');
		await expect(inputs.nth(3)).toHaveValue('山田');
	});

	test('should import multi-sheet XLSX and switch sheets', async ({
		page,
		createToolPage,
	}) => {
		const toolPage = createToolPage('csv-editor');
		await toolPage.goto();

		const xlsxPath = path.join(__dirname, '../fixtures/sample-multisheet.xlsx');
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(xlsxPath);

		await expect(page.getByRole('tab', { name: /テーブル/ })).toHaveAttribute(
			'data-state',
			'active',
		);

		// Check sheet buttons
		await expect(
			page.getByRole('button', { name: /売上データ/ }),
		).toBeVisible();
		await expect(page.getByRole('button', { name: /部署一覧/ })).toBeVisible();

		const inputs = page.locator('table input[type="text"]');
		await expect(inputs.nth(0)).toHaveValue('名前');
		await expect(inputs.nth(3)).toHaveValue('田中');

		// Switch sheet
		await page.getByRole('button', { name: /部署一覧/ }).click();
		await expect(inputs.nth(0)).toHaveValue('開発部');
	});

	test('should apply advanced filter, multi-sort, and render chart', async ({
		page,
		createToolPage,
	}) => {
		const toolPage = createToolPage('csv-editor');
		await toolPage.goto();

		const inputArea = page.getByRole('textbox').first();
		await inputArea.fill(
			'品名,価格,数量\nりんご,100,5\nみかん,80,10\nバナナ,120,3\nぶどう,200,2',
		);
		await page.getByRole('button', { name: 'パースして編集へ' }).click();

		// Switch to Filter/Sort tab
		await page.getByRole('tab', { name: /絞込・ソート/ }).click();

		// Add Filter Condition
		await page.getByRole('button', { name: /条件を追加/ }).click();
		const filterInput = page.locator('input[placeholder="値"]');
		await filterInput.fill('100');

		// Verify table filtered count in tab stats
		await page.getByRole('tab', { name: /テーブル/ }).click();
		await expect(page.locator('table tbody tr')).toHaveCount(3); // 価格 >= 100 or contains 100

		// Switch to Chart tab
		await page.getByRole('tab', { name: /グラフ/ }).click();
		await expect(
			page.getByRole('button', { name: /SVG ダウンロード/ }),
		).toBeVisible();
		await expect(
			page.getByRole('button', { name: /PNG ダウンロード/ }),
		).toBeVisible();
	});

	test('should render responsively on mobile (375px)', async ({
		page,
		createToolPage,
	}) => {
		await page.setViewportSize({ width: 375, height: 667 });
		const toolPage = createToolPage('csv-editor');
		await toolPage.goto();

		await expect(
			page.getByRole('button', { name: 'パースして編集へ' }),
		).toBeVisible();
	});
});
