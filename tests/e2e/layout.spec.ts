import { test, expect } from './fixtures/base';

test.describe('Layout & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Header logo navigates to top', async ({ page }) => {
    // Navigate to a tool page first
    await page.goto('/char-count');

    // Click logo
    await page.getByRole('link', { name: /CODE:LIFE/i }).first().click();

    // Verify we are back on top page
    await expect(page).toHaveURL(/\/$/);
  });

  test('Dark mode toggle works', async ({ page }) => {
    const html = page.locator('html');

    // Check initial state (default is usually light or dark depending on system, but let's toggle)
    const toggleButton = page.getByRole('button', { name: /テーマの切り替え/i });

    // Open dropdown Menu
    await toggleButton.click();

    // Select Dark
    await page.getByRole('menuitem', { name: /ダーク/i }).click();
    await expect(html).toHaveClass(/dark/);

    // Open dropdown Menu again
    await toggleButton.click();

    // Select Light
    await page.getByRole('menuitem', { name: /ライト/i }).click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test('Cmd+K Search focuses search input', async ({ page }) => {
    // Press Cmd+K or Ctrl+K
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+k' : 'Control+k');

    // Verify search modal/input is visible and focused
    const searchInput = page.getByPlaceholder(/ツールを検索/i);
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeFocused();
  });

  test('Footer links are present', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check for standard footer links
    await expect(footer.getByRole('link', { name: /プライバシーポリシー/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /このサイトについて/i })).toBeVisible();
  });
});
