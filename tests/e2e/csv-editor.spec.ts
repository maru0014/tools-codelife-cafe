import { expect, test } from './fixtures/base';

test.describe('CSV Editor Tool', () => {
	test('should load the page correctly', async ({ createToolPage }) => {
		const toolPage = createToolPage('csv-editor');
		await toolPage.goto();
		await toolPage.expectTitle('CSVビューア/エディタ | CODE:LIFE Tools');
		await toolPage.expectSafetyBadge();
	});

	test('should parse CSV and allow editing', async ({ page, createToolPage }) => {
		const toolPage = createToolPage('csv-editor');
		await toolPage.goto();

		// 1. Fill CSV data
		const inputArea = page.getByRole('textbox').first();
		await inputArea.fill('Name,Age,Job\nAlice,20,Student\nBob,30,Developer');

		// 2. Click parse button
		await page.getByRole('button', { name: 'パースして編集へ' }).click();

		// 3. Verify table view is active
		await expect(page.getByRole('tab', { name: 'テーブル編集' })).toHaveAttribute('data-state', 'active');
		await expect(page.getByRole('button', { name: /行を追加/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /列を追加/i })).toBeVisible();

		// 4. Verify table cells
		const inputs = page.locator('table input[type="text"]');
		await expect(inputs.nth(0)).toHaveValue('Name');
		await expect(inputs.nth(1)).toHaveValue('Age');
		await expect(inputs.nth(2)).toHaveValue('Job');
		await expect(inputs.nth(3)).toHaveValue('Alice');
	});
});

