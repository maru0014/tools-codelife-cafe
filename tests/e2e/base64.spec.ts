import { test } from './fixtures/base';

test.describe('Base64 Converter Tool', () => {
  test('should load the page correctly', async ({ createToolPage }) => {
    const toolPage = createToolPage('base64');
    await toolPage.goto();
    await toolPage.expectTitle('Base64エンコード/デコード | CODE:LIFE Tools');
    await toolPage.expectSafetyBadge();
  });
});
