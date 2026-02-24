import { test, expect } from './fixtures/base';
import { ToolPage } from './helpers/tool-page';

const TOOLS = [
  'zenkaku-hankaku',
  'char-count',
  'json-formatter',
  'text-diff',
  'qr-generator',
];

test.describe('Smoke Tests - Tools', () => {
  for (const toolSlug of TOOLS) {
    test(`Tool page /tools/${toolSlug} should load and show safety badge`, async ({ page, createToolPage }) => {
      const response = await page.goto(`/tools/${toolSlug}`);
      expect(response?.status()).toBe(200);

      const toolPage = createToolPage(toolSlug);
      await toolPage.expectSafetyBadge();
    });
  }

  test('Top page should load successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/codelife.cafe/i);
  });
});
