import path from 'node:path';
import { expect, test } from './fixtures/base';

const PNG = path.join(
	process.cwd(),
	'tests',
	'e2e',
	'fixtures',
	'sample-400x300.png',
);

test.describe('画像トリミング・回転', () => {
	test('ページ表示と基本操作ができる', async ({ page, createToolPage }) => {
		const toolPage = createToolPage('image-crop');
		await toolPage.goto();
		await toolPage.expectTitle('画像トリミング・回転');
		await toolPage.expectSafetyBadge();

		await page.locator('input[type="file"]').setInputFiles(PNG);
		await expect(page.getByText('元画像: 400×300px')).toBeVisible();
		await page.getByLabel('幅').fill('200');
		await page.getByLabel('高さ').fill('100');
		await page.getByRole('button', { name: '右90°' }).click();
		await expect(page.getByText('形式')).toBeVisible();
	});
});
