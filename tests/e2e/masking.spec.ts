import { test } from './fixtures/base';

test.describe('Personal Info Masking Tool', () => {
  test('should load the page correctly', async ({ createToolPage }) => {
    const toolPage = createToolPage('masking');
    await toolPage.goto();
    await toolPage.expectTitle('個人情報マスキング - Tools CodeLife Cafe');
    await toolPage.expectSafetyBadge();
  });
});
