import { test, expect } from './fixtures/base';

test.describe('Zenkaku Hankaku Converter', () => {
  test.beforeEach(async ({ createToolPage }) => {
    const page = createToolPage('zenkaku-hankaku');
    await page.goto();
  });

  test('converts zenkaku to hankaku by default', async ({ page, createToolPage }) => {
    const toolPage = createToolPage('zenkaku-hankaku');
    await toolPage.fillInput('ＡＢＣ１２３アイウ');
    await toolPage.expectOutputContains('ABC123ｱｲｳ');
  });

  test('can clear input', async ({ page }) => {
    await page.getByRole('textbox').first().fill('test');
    await page.getByRole('button', { name: /クリア/ }).click();
    await expect(page.getByRole('textbox').first()).toHaveValue('');
  });
});
