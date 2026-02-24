import { test } from '../fixtures/base';

test.describe('CSV Editor Tool', () => {
  test('should load the page correctly', async ({ toolPage }) => {
    await toolPage.goto('/tools/csv-editor');
    await toolPage.verifyTitle('CSVビューア/エディタ - Tools CodeLife Cafe');
    await toolPage.verifyHeading('CSVビューア/エディタ');
  });
});
