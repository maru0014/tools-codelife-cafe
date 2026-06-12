import { expect, test } from './fixtures/base';

test.describe('Unicode Converter Tool', () => {
	test('should load the page correctly', async ({ createToolPage }) => {
		const toolPage = createToolPage('unicode-converter');
		await toolPage.goto();
		await toolPage.expectTitle('ユニコード変換 | CODE:LIFE Tools');
		await toolPage.expectSafetyBadge();
	});

	test('should convert text to unicode and vice versa', async ({ page, createToolPage }) => {
		const toolPage = createToolPage('unicode-converter');
		await toolPage.goto();

		// 1. Convert text to unicode (default)
		await toolPage.fillInput('あ');
		await toolPage.expectOutputContains('\\u3042');

		// 2. Switch to decode mode
		await page.getByRole('switch').click();
		await toolPage.fillInput('\\u3042');
		await toolPage.expectOutputContains('あ');
	});
});

