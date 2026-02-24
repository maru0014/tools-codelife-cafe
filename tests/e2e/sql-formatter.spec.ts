import { test } from './fixtures/base';

test.describe('SQL Formatter Tool', () => {
  test('should load the page correctly', async ({ createToolPage }) => {
    const toolPage = createToolPage('sql-formatter');
    await toolPage.goto();
    await toolPage.expectTitle('SQL整形・フォーマッター | CODE:LIFE Tools');
    await toolPage.expectSafetyBadge();
  });
});
