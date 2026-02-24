import { test } from './fixtures/base';

test.describe('CSV Editor Tool', () => {
  test('should load the page correctly', async ({ createToolPage }) => {
    const toolPage = createToolPage('csv-editor');
    await toolPage.goto();
    await toolPage.expectTitle('CSVビューア/エディタ - Tools CodeLife Cafe');
    await toolPage.expectSafetyBadge();
  });
});
