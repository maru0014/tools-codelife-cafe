import { test } from './fixtures/base';

test.describe('Regex Tester Tool', () => {
  test('should load the page correctly', async ({ createToolPage }) => {
    const toolPage = createToolPage('regex-tester');
    await toolPage.goto();
    await toolPage.expectTitle('正規表現テスター - Tools CodeLife Cafe');
    await toolPage.expectSafetyBadge();
  });
});
