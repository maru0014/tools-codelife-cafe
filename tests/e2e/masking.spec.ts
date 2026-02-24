import { test } from '../fixtures/base';

test.describe('Personal Info Masking Tool', () => {
  test('should load the page correctly', async ({ toolPage }) => {
    await toolPage.goto('/tools/masking');
    await toolPage.verifyTitle('個人情報マスキング - Tools CodeLife Cafe');
    await toolPage.verifyHeading('個人情報マスキング');
  });
});
