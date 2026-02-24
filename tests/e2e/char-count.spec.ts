import { test, expect } from './fixtures/base';

test.describe('Character Counter', () => {
  test('loads page and shows character count UI', async ({ page, createToolPage }) => {
    const toolPage = createToolPage('char-count');
    await toolPage.goto();

    // Verify the character count UI elements are present
    await expect(page.getByText('文字数（空白含む）')).toBeVisible();
    await expect(page.getByText('バイト数（UTF-8）')).toBeVisible();
    await expect(page.getByRole('textbox').first()).toBeVisible();
  });
});
