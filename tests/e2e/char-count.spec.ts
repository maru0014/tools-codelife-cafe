import { expect, test } from './fixtures/base';

test.describe('Character Counter', () => {
	test('loads page and shows character count UI', async ({
		page,
		createToolPage,
	}) => {
		const toolPage = createToolPage('char-count');
		await toolPage.goto();

		// Verify the character count UI elements are present
		await expect(page.getByText('文字数（空白含む）')).toBeVisible();
		await expect(page.getByText('バイト数（UTF-8）')).toBeVisible();
		await expect(page.getByRole('textbox').first()).toBeVisible();
	});

	test('should count characters and bytes in real-time', async ({ page, createToolPage }) => {
		const toolPage = createToolPage('char-count');
		await toolPage.goto();

		// Input "テスト" (3 characters, UTF-8 9 bytes)
		const textbox = page.getByRole('textbox').first();
		await textbox.fill('テスト');

		// Verify stats are calculated correctly
		const charCountCard = page.locator('.rounded-xl', { hasText: '文字数（空白含む）' });
		await expect(charCountCard.locator('.text-2xl')).toHaveText('3');

		const byteCountCard = page.locator('.rounded-xl', { hasText: 'バイト数（UTF-8）' });
		await expect(byteCountCard.locator('.text-2xl')).toHaveText('9');
	});
});

