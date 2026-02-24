import { test } from '../fixtures/base';

test.describe('Dummy Data Generator Tool', () => {
  test('should load the page correctly', async ({ toolPage }) => {
    await toolPage.goto('/tools/dummy-data');
    await toolPage.verifyTitle('ダミーデータ生成（日本語） - Tools CodeLife Cafe');
    await toolPage.verifyHeading('ダミーデータ生成（日本語）');
  });
});
