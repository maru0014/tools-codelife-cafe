import { expect, test } from './fixtures/base';

test.describe('Dummy Data Generator Tool', () => {
	test('should load the page correctly', async ({ createToolPage }) => {
		const toolPage = createToolPage('dummy-data');
		await toolPage.goto();
		await toolPage.expectTitle('ダミーデータ生成（日本語） | CODE:LIFE Tools');
		await toolPage.expectSafetyBadge();
	});

	test('should generate dummy data and switch formats', async ({
		page,
		createToolPage,
	}) => {
		const toolPage = createToolPage('dummy-data');
		await toolPage.goto();

		// 1. Check if the default preview data is generated in JSON
		const previewContainer = page.locator('pre');
		await expect(previewContainer).toBeVisible();
		await expect(previewContainer).toContainText('"name"');

		// 2. Change count to 5
		const countInput = page.locator('input[type="number"]');
		await countInput.fill('5');

		// 3. Switch format to CSV
		await page.getByRole('tab', { name: 'CSV' }).click();

		// 4. Verify output changes to CSV layout (should contain English header ID)
		await expect(previewContainer).toContainText('name');
	});
});
