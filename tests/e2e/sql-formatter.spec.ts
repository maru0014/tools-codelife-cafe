import { test, expect } from './fixtures/base';

test.describe('SQL Formatter Tool', () => {
  test.beforeEach(async ({ createToolPage }) => {
    const toolPage = createToolPage('sql-formatter');
    await toolPage.goto();
  });

  test('should load the page correctly', async ({ page }) => {
    await expect(page).toHaveTitle('SQL整形・フォーマッター | CODE:LIFE Tools');
    await expect(page.getByRole('heading', { name: 'SQL整形・フォーマッター' })).toBeVisible();
  });

  test('should format SQL with default options (2 spaces, uppercase)', async ({ page }) => {
    const input = 'select id, name from users where status = 1';
    await page.locator('textarea').fill(input);

    await expect(page.locator('.shimmer code')).toContainText('SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  status = 1');
  });

  test('should disable uppercase when toggled off', async ({ page }) => {
    const input = 'select id from test';
    await page.locator('textarea').fill(input);

    // wait for format
    await expect(page.locator('.shimmer code')).toContainText('SELECT\n  id\nFROM\n  test');

    // Toggle uppercase off
    await page.getByLabel('大文字化').click();

    await expect(page.locator('.shimmer code')).toContainText('select\n  id\nfrom\n  test');
  });

  test('should compress SQL to a single line', async ({ page }) => {
    const input = 'SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  status = 1;';
    await page.locator('textarea').fill(input);

    // wait for format
    await expect(page.locator('.shimmer code')).toContainText('SELECT');

    // Toggle compress on
    await page.getByLabel('圧縮 (1行化)').click();

    // Inner text of compressed should be single line
    await expect(page.locator('.shimmer code')).toContainText('SELECT id, name FROM users WHERE status = 1;');
  });

  test('should handle different dialects and indents', async ({ page }) => {
    await page.locator('textarea').fill('SELECT * FROM users LIMIT 10 OFFSET 0');
    await expect(page.locator('.shimmer code')).toContainText('SELECT\n  *\nFROM\n  users');

    // Change dialect to PostgreSQL
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'PostgreSQL' }).click();

    // Change indent to Tabs
    await page.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: 'Tabs' }).click();

    await expect(page.locator('.shimmer code')).toContainText('SELECT\n\t*\nFROM\n\tusers');
  });

  test('should clear the input when clear button is clicked', async ({ page }) => {
    await page.locator('textarea').fill('SELECT * FROM users');
    await expect(page.locator('.shimmer code')).toBeVisible();

    // Click clear
    await page.getByRole('button', { name: 'クリア' }).click();

    // Check if textarea is empty
    await expect(page.locator('textarea')).toBeEmpty();

    // Check if output is back to placeholder text
    await expect(page.getByText('左側（または上）にSQLを入力すると')).toBeVisible();
  });
});
