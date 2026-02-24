import { test } from './fixtures/base';

test.describe('Dummy Data Generator Tool', () => {
  test('should load the page correctly', async ({ createToolPage }) => {
    const toolPage = createToolPage('dummy-data');
    await toolPage.goto();
    await toolPage.expectTitle('ダミーデータ生成（日本語） - Tools CodeLife Cafe');
    await toolPage.expectSafetyBadge();
  });
});
