import { test as baseTest, expect, type Page } from '@playwright/test';
import { ToolPage } from '../helpers/tool-page';

type MyFixtures = {
	createToolPage: (path: string) => ToolPage;
};

export const test = baseTest.extend<MyFixtures>({
	page: async ({ page }, use) => {
		// Block analytics to prevent test timeouts/flakiness
		await page.route('**/*googletagmanager*', (route) => route.abort());
		// React Island のハイドレーション完了前に fill/click すると controlled component が
		// 空文字でリセットされ flaky になるため、goto 後に全 astro-island の ssr 属性削除
		// （= ハイドレーション完了）を待つ
		const originalGoto = page.goto.bind(page);
		page.goto = async (url: string, options?: Parameters<Page['goto']>[1]) => {
			const response = await originalGoto(url, options);
			// 並列実行のCPU飽和時はハイドレーションに15秒以上かかることがあるため余裕を持たせる
			await expect(page.locator('astro-island[ssr]')).toHaveCount(0, {
				timeout: 25_000,
			});
			return response;
		};
		await use(page);
	},
	createToolPage: async ({ page }, use) => {
		await use((path: string) => new ToolPage(page, path));
	},
});

export { expect };
