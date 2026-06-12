import { expect, test } from './fixtures/base';

test.describe('Base64 Converter Tool', () => {
	test('should load the page correctly', async ({ createToolPage }) => {
		const toolPage = createToolPage('base64');
		await toolPage.goto();
		await toolPage.expectTitle('Base64エンコード/デコード | CODE:LIFE Tools');
		await toolPage.expectSafetyBadge();
	});

	test('should encode and decode text correctly', async ({
		page,
		createToolPage,
	}) => {
		const toolPage = createToolPage('base64');
		await toolPage.goto();

		// 1. Text encode (default)
		await toolPage.fillInput('こんにちは世界');
		await toolPage.expectOutputContains('44GT44KT44Gr44Gh44Gv5LiW55WM');

		// 2. Switch direction to decode
		await page.getByRole('switch').click();
		await toolPage.fillInput('44GT44KT44Gr44Gh44Gv5LiW55WM');
		await toolPage.expectOutputContains('こんにちは世界');

		// 3. Clear button
		await page.getByRole('button', { name: /クリア/ }).click();
		await expect(page.getByRole('textbox').first()).toHaveValue('');
	});
});
