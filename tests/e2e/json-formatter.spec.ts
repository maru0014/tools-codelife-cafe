import { test, expect } from './fixtures/base';

test.describe('JSON Formatter', () => {
  test.beforeEach(async ({ createToolPage }) => {
    const page = createToolPage('json-formatter');
    await page.goto();
  });

  test('formats JSON correctly', async ({ page, createToolPage }) => {
    const toolPage = createToolPage('json-formatter');
    await toolPage.fillInput('{"test": 123}');

    // Assuming output is pretty-printed JSON
    await toolPage.expectOutputContains('"test": 123');

    await page.getByRole('button', { name: /クリア/ }).click();
    await expect(page.getByRole('textbox').first()).toHaveValue('');
  });

  test('shows error for invalid JSON', async ({ page, createToolPage }) => {
    const toolPage = createToolPage('json-formatter');
    await toolPage.fillInput('{"test": 123'); // Missing brace
    await expect(page.getByText(/エラー/i)).toBeVisible();
  });
});
