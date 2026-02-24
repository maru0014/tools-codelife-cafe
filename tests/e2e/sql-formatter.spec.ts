import { test } from '../fixtures/base';

test.describe('SQL Formatter Tool', () => {
  test('should load the page correctly', async ({ toolPage }) => {
    await toolPage.goto('/tools/sql-formatter');
    await toolPage.verifyTitle('SQL整形・フォーマッター - Tools CodeLife Cafe');
    await toolPage.verifyHeading('SQL整形・フォーマッター');
  });
});
