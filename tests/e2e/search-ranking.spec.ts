import { expect, test } from './fixtures/base';

test.describe('Search result ranking', () => {
	// 検索モーダルはデスクトップサイズでのみ操作可能なため、モバイルテストはスキップ
	test.skip(
		({ isMobile }) => isMobile,
		'Search modal is only operable on desktop',
	);

	test('「csv」検索でタイトルにCSVを含むツールが先頭グループに来る', async ({
		page,
	}) => {
		await page.goto('/');
		await page.keyboard.press('Control+k');

		const searchInput = page.getByPlaceholder(/ツールを検索/i);
		await expect(searchInput).toBeVisible({ timeout: 5000 });
		await searchInput.fill('csv');

		const results = page.getByTestId('search-result');
		await expect(results.first()).toBeVisible();

		// タイトル前方一致の「CSVビューア/エディタ」が最優先で先頭に来る
		await expect(results.nth(0)).toContainText('CSVビューア/エディタ');
		await expect(results.nth(1)).toContainText('CSV文字化け修復');

		// 説明文・キーワードのみ一致の「ダミーデータ生成」はタイトル一致グループより後ろ
		const titles = await results.locator('span.font-medium').allTextContents();
		const dummyIndex = titles.indexOf('ダミーデータ生成');
		const csvEditorIndex = titles.indexOf('CSVビューア/エディタ');
		expect(dummyIndex).toBeGreaterThan(-1);
		expect(csvEditorIndex).toBe(0);

		// タイトルにCSVを含むツールはすべてダミーデータ生成より上位
		for (const [index, title] of titles.entries()) {
			if (title.toLowerCase().includes('csv')) {
				expect(index).toBeLessThan(dummyIndex);
			}
		}
	});

	test('ひらがな検索「かうんと」でカタカナタイトルのツールがヒットする', async ({
		page,
	}) => {
		await page.goto('/');
		await page.keyboard.press('Control+k');

		const searchInput = page.getByPlaceholder(/ツールを検索/i);
		await expect(searchInput).toBeVisible({ timeout: 5000 });
		await searchInput.fill('かうんと');

		const results = page.getByTestId('search-result');
		await expect(results.first()).toBeVisible();
		await expect(results.first()).toContainText('文字数カウント');
	});

	test('一致しないクエリでは結果が空になる', async ({ page }) => {
		await page.goto('/');
		await page.keyboard.press('Control+k');

		const searchInput = page.getByPlaceholder(/ツールを検索/i);
		await expect(searchInput).toBeVisible({ timeout: 5000 });
		await searchInput.fill('存在しないツールxyz');

		await expect(
			page.getByText('一致するツールが見つかりません。'),
		).toBeVisible();
	});
});
