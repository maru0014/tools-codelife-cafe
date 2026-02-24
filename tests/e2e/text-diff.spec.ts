import { test, expect } from './fixtures/base';

test.describe('Text Diff', () => {
  test.beforeEach(async ({ createToolPage }) => {
    const page = createToolPage('text-diff');
    await page.goto();
  });

  test('computes diff correctly', async ({ page }) => {
    const textboxes = page.getByRole('textbox');
    await textboxes.first().fill('hello\nworld');
    await textboxes.nth(1).fill('hello\nplaywright');

    // Check if diff summary appears
    await expect(page.getByText(/差分サマリー/i)).toBeVisible();
    await expect(page.getByText('追加: 1行')).toBeVisible();
    await expect(page.getByText('削除: 1行')).toBeVisible();
  });
});
