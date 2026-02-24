import { test } from './fixtures/base';

test.describe('Wareki Converter Tool', () => {
  test('should load the page correctly', async ({ createToolPage }) => {
    const toolPage = createToolPage('wareki-converter');
    await toolPage.goto();
    await toolPage.expectTitle('和暦↔西暦・年齢変換 - Tools CodeLife Cafe');
    await toolPage.expectSafetyBadge();
  });
});
