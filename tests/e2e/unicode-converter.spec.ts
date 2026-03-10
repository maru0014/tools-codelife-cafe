import { test } from './fixtures/base';

test.describe('Unicode Converter Tool', () => {
  test('should load the page correctly', async ({ createToolPage }) => {
    const toolPage = createToolPage('unicode-converter');
    await toolPage.goto();
    await toolPage.expectTitle('ユニコード変換 | CODE:LIFE Tools');
    await toolPage.expectSafetyBadge();
  });
});
