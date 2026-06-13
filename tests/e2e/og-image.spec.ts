import { expect, test } from './fixtures/base';

test.describe('OGP画像', () => {
	test('ツールページの og:image がツール別画像を指し、画像が配信される', async ({
		page,
		createToolPage,
	}) => {
		const toolPage = createToolPage('json-formatter');
		await toolPage.goto();

		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			'https://tools.codelife.cafe/og/json-formatter.png',
		);

		// 画像が実際に 200 / PNG で取得できること
		const res = await page.request.get('/og/json-formatter.png');
		expect(res.status()).toBe(200);
		expect(res.headers()['content-type']).toContain('image/png');
	});

	test('トップページの og:image はサイト共通画像のまま', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			'https://tools.codelife.cafe/og-image.png',
		);
	});
});
