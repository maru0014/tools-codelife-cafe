import { expect, test } from './fixtures/base';

test.describe('Wareki Converter Tool', () => {
	test('should load the page correctly', async ({ createToolPage }) => {
		const toolPage = createToolPage('wareki-converter');
		await toolPage.goto();
		await toolPage.expectTitle('和暦↔西暦・年齢変換 | CODE:LIFE Tools');
		await toolPage.expectSafetyBadge();
	});

	test('should convert seireki to wareki and vice versa', async ({
		page,
		createToolPage,
	}) => {
		const toolPage = createToolPage('wareki-converter');
		await toolPage.goto();

		// 1. Convert Seireki to Wareki (default)
		const seirekiInput = page.locator('input[type="number"]');
		await seirekiInput.fill('2000');

		// Verify output (平成12年) in the result table
		await expect(page.getByRole('cell', { name: '平成12年' })).toBeVisible();

		// 2. Switch direction to Wareki -> Seireki
		await page.getByRole('switch').click();

		// Set Wareki input to 令和2年
		const warekiInput = page.locator('input[type="text"]');
		await warekiInput.fill('令和2年');

		// Verify output (2020年)
		await expect(page.getByRole('cell', { name: '2020年' })).toBeVisible();
	});

	test('should show pre-Meiji era results with a caveat notice', async ({
		page,
		createToolPage,
	}) => {
		const toolPage = createToolPage('wareki-converter');
		await toolPage.goto();

		await page.getByRole('switch').click();
		const warekiInput = page.locator('input[type="text"]');
		await warekiInput.fill('慶応3年');

		await expect(page.getByRole('cell', { name: '1867年' })).toBeVisible();
		await expect(
			page.getByText('旧暦月日を新暦月日に変換した結果ではありません'),
		).toBeVisible();
	});

	test('should show multiple era candidates for a era-change year', async ({
		page,
		createToolPage,
	}) => {
		const toolPage = createToolPage('wareki-converter');
		await toolPage.goto();

		const seirekiInput = page.locator('input[type="number"]');
		await seirekiInput.fill('1868');

		await expect(
			page.getByRole('cell', { name: '慶応4年 明治元年' }).first(),
		).toBeVisible();
	});

	test('should copy the result as a single formatted text', async ({
		page,
		createToolPage,
	}) => {
		const toolPage = createToolPage('wareki-converter');
		await toolPage.goto();

		const seirekiInput = page.locator('input[type="number"]');
		await seirekiInput.fill('2000');

		await page.getByRole('button', { name: 'コピー' }).click();
		await expect(
			page.getByRole('button', { name: 'コピーしました' }),
		).toBeVisible();
	});
});
