import { test, expect } from './fixtures/base';

test.describe('JSON Formatter', () => {
  test('loads page and shows format UI', async ({ page, createToolPage }) => {
    const toolPage = createToolPage('json-formatter');
    await toolPage.goto();

    // Verify key UI elements are present
    await expect(page.getByRole('textbox').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /整形/ })).toBeVisible();
  });

  test('has working format button', async ({ page, createToolPage }) => {
    const toolPage = createToolPage('json-formatter');
    await toolPage.goto();

    // The format button should be clickable
    const formatBtn = page.getByRole('button', { name: /整形/ });
    await expect(formatBtn).toBeVisible();
    await formatBtn.click();

    // After clicking format with no/default input, page should not crash
    await expect(page.getByRole('textbox').first()).toBeVisible();
  });
});
