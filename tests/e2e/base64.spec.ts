import { test } from '../fixtures/base';

test.describe('Base64 Converter Tool', () => {
  test('should load the page correctly', async ({ toolPage }) => {
    await toolPage.goto('/tools/base64');
    await toolPage.verifyTitle('Base64エンコード/デコード - Tools CodeLife Cafe');
    await toolPage.verifyHeading('Base64エンコード/デコード');
  });
});
