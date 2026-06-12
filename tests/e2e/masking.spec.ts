import { expect, test } from './fixtures/base';

test.describe('Personal Info Masking Tool', () => {
	test('should load the page correctly', async ({ createToolPage }) => {
		const toolPage = createToolPage('masking');
		await toolPage.goto();
		await toolPage.expectTitle('個人情報マスキング | CODE:LIFE Tools');
		await toolPage.expectSafetyBadge();
	});

	test('should mask personal information automatically', async ({ page, createToolPage }) => {
		const toolPage = createToolPage('masking');
		await toolPage.goto();

		// 1. Fill personal info in the input textbox
		const textareas = page.getByRole('textbox');
		await textareas.first().fill('私のメールは test@example.com です。電話番号は 090-1234-5678 です。');

		// 2. Check if output textbox contains masked values
		await expect(textareas.last()).toContainText('***');
		await expect(textareas.last()).not.toContainText('test@example.com');
		await expect(textareas.last()).not.toContainText('090-1234-5678');
	});
});

