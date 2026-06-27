import { expect, test } from './fixtures/base';

const SAMPLE_JWT =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoi5bGx55Sw5aSq6YOOIiwicm9sZSI6IueuoeeQhuiAhSJ9.signature';

test.describe('JWT Decoder Tool', () => {
	test('should decode JWT header and payload locally', async ({
		page,
		createToolPage,
	}) => {
		const toolPage = createToolPage('jwt-decoder');
		await toolPage.goto();
		await toolPage.expectTitle('JWTデコーダー | CODE:LIFE Tools');
		await toolPage.expectSafetyBadge();

		await page.getByLabel('JWT').fill(SAMPLE_JWT);

		await expect(page.getByText('"alg": "HS256"')).toBeVisible();
		await expect(page.getByText('"name": "山田太郎"')).toBeVisible();
		await expect(page.getByText('signature')).toBeVisible();
	});

	test('should show validation error for invalid token shape', async ({
		page,
		createToolPage,
	}) => {
		const toolPage = createToolPage('jwt-decoder');
		await toolPage.goto();

		await page.getByLabel('JWT').fill('invalid-token');

		await expect(page.getByText('デコードできません')).toBeVisible();
		await expect(page.getByText('3つの部分で構成')).toBeVisible();
	});
});
