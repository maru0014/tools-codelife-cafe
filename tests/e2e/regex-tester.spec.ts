import { test } from '../fixtures/base';

test.describe('Regex Tester Tool', () => {
  test('should load the page correctly', async ({ toolPage }) => {
    await toolPage.goto('/tools/regex-tester');
    await toolPage.verifyTitle('正規表現テスター - Tools CodeLife Cafe');
    await toolPage.verifyHeading('正規表現テスター');
  });
});
