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
    // The dark mode toggle is a button with aria-label 'ダークモードに切替'
    const toggleButton = page.getByRole('button', { name: /モードに切替/i });
    await expect(toggleButton).toBeVisible();

    // Click to switch to dark mode
    await toggleButton.click();

    // After clicking, the html element should have 'dark' class
    await expect(page.locator('html')).toHaveClass(/dark/);

    // The button's aria-label should now contain 'ライト'
    const lightToggle = page.getByRole('button', { name: /ライトモードに切替/i });
    await expect(lightToggle).toBeVisible();
  });

  test('Cmd+K Search focuses search input', async ({ page }) => {
    // Wait for React SearchModal component to hydrate by checking for an interactive element
    await page.waitForTimeout(1000);

    // Press Ctrl+K
    await page.keyboard.press('Control+k');

    // Verify search modal/input is visible and focused
    const searchInput = page.getByPlaceholder(/ツールを検索/i);
    await expect(searchInput).toBeVisible({ timeout: 5000 });
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
