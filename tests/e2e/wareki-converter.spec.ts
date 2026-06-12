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

		// Verify output (平成12年)
		await expect(page.getByText('平成12年')).toBeVisible();

		// 2. Switch direction to Wareki -> Seireki
		await page.getByRole('switch').click();

		// Set Wareki Year to 2 (令和2年)
		const warekiInput = page.locator('input[type="number"]');
		await warekiInput.fill('2');

		// Verify output (2020年)
		await expect(page.getByText('2020年')).toBeVisible();
	});
});
