import { expect, test } from './fixtures/base';

test.describe('JSON Formatter', () => {
	test('loads page and shows format UI', async ({ page, createToolPage }) => {
		const toolPage = createToolPage('json-formatter');
		await toolPage.goto();

		// Verify key UI elements are present
		await expect(page.getByRole('textbox').first()).toBeVisible();
		await expect(page.getByRole('button', { name: /整形/ })).toBeVisible();
	});

	test('should format valid JSON and show error for invalid JSON', async ({
		page,
		createToolPage,
	}) => {
		const toolPage = createToolPage('json-formatter');
		await toolPage.goto();

		// 1. Input valid JSON
		const inputArea = page.getByRole('textbox').first();
		await inputArea.fill('{"a":1,"b":"hello"}');

		// Verify output is formatted (should contain newline and indentation)
		const outputContainer = page.locator('pre');
		await expect(outputContainer).toContainText('"a": 1');
		await expect(outputContainer).toContainText('"b": "hello"');

		// 2. Input invalid JSON
		await inputArea.fill('{"a":1');

		// Verify error banner is visible
		const errorBanner = page.locator('.bg-destructive\\/10');
		await expect(errorBanner).toBeVisible();
		await expect(errorBanner).toContainText('エラー');
	});
});
