import { expect, test } from './fixtures/base';

test.describe('Regex Tester Tool', () => {
	test('should load the page correctly', async ({ createToolPage }) => {
		const toolPage = createToolPage('regex-tester');
		await toolPage.goto();
		await toolPage.expectTitle('正規表現テスター | CODE:LIFE Tools');
		await toolPage.expectSafetyBadge();
	});

	test('should display regex matches and handle pattern changes', async ({
		page,
		createToolPage,
	}) => {
		const toolPage = createToolPage('regex-tester');
		await toolPage.goto();

		// 1. Verify default match count (2 matches for \d{3}-\d{4} on default text)
		const matchCount = page.locator('.text-4xl.font-bold');
		await expect(matchCount).toHaveText('2');

		// 2. Change pattern to \d+
		const patternInput = page.locator('input').first();
		await patternInput.fill('\\d+');

		// 3. Verify match count updates to 4 (100, 0001, 530, 0001)
		await expect(matchCount).toHaveText('4');
	});
});
