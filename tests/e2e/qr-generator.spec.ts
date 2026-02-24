import { test, expect } from './fixtures/base';

test.describe('QR Generator', () => {
  test.beforeEach(async ({ createToolPage }) => {
    const page = createToolPage('qr-generator');
    await page.goto();
  });

  test('generates QR code from text', async ({ page }) => {
    const input = page.getByRole('textbox').first();
    await input.fill('https://example.com');

    // Check if QR image is generated
    const qrImage = page.getByRole('img', { name: /QRコード/i });
    await expect(qrImage).toBeVisible();

    // Check download buttons
    await expect(page.getByRole('button', { name: /PNG ダウンロード/i })).toBeEnabled();
  });
});
