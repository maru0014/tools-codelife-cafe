import { test } from '../fixtures/base';

test.describe('Wareki Converter Tool', () => {
  test('should load the page correctly', async ({ toolPage }) => {
    await toolPage.goto('/tools/wareki-converter');
    await toolPage.verifyTitle('和暦↔西暦・年齢変換 - Tools CodeLife Cafe');
    await toolPage.verifyHeading('和暦↔西暦・年齢変換');
  });
});
