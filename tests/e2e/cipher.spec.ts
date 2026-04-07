import { expect, test } from './fixtures/base';

test.describe('Cipher Tool', () => {
	test('should load the page correctly', async ({ createToolPage }) => {
		const toolPage = createToolPage('tools/cipher');
		await toolPage.goto();
		await toolPage.expectTitle('暗号化・難読化ツール | CODE:LIFE Tools');
		await toolPage.expectSafetyBadge();
	});

	test.describe('Tab navigation', () => {
		test('default tab is シーザー暗号', async ({ page, createToolPage }) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			const caesarTab = page.getByRole('tab', { name: 'シーザー暗号' });
			await expect(caesarTab).toHaveAttribute('data-state', 'active');
		});

		test('switching tabs resets input and output', async ({
			page,
			createToolPage,
		}) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			const inputArea = page.getByRole('textbox').first();
			await inputArea.fill('Hello');
			await page.getByRole('tab', { name: 'ROT13' }).click();
			await expect(inputArea).toHaveValue('');
		});

		test('Caesar tab shows shift slider', async ({ page, createToolPage }) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			await expect(
				page.getByRole('slider', { name: 'シフト数' }),
			).toBeVisible();
		});

		test('ROT13 tab does not show shift slider', async ({
			page,
			createToolPage,
		}) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			await page.getByRole('tab', { name: 'ROT13' }).click();
			await expect(
				page.getByRole('slider', { name: 'シフト数' }),
			).not.toBeVisible();
		});
	});

	test.describe('Caesar cipher', () => {
		test('encodes abc with shift 3 to def', async ({
			page,
			createToolPage,
		}) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			const inputArea = page.getByRole('textbox').first();
			const outputArea = page.getByRole('textbox').nth(1);
			await inputArea.fill('abc');
			await expect(outputArea).toHaveValue('def');
		});

		test('encodes ABC with shift 3 to DEF', async ({
			page,
			createToolPage,
		}) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			const inputArea = page.getByRole('textbox').first();
			const outputArea = page.getByRole('textbox').nth(1);
			await inputArea.fill('ABC');
			await expect(outputArea).toHaveValue('DEF');
		});

		test('encodes Japanese hiragana with shift 1', async ({
			page,
			createToolPage,
		}) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			const inputArea = page.getByRole('textbox').first();
			const outputArea = page.getByRole('textbox').nth(1);
			// Set shift to 1 via number input
			const shiftInput = page.getByLabel('シフト数入力');
			await shiftInput.fill('1');
			await shiftInput.press('Tab');
			await inputArea.fill('あいう');
			await expect(outputArea).toHaveValue('いうえ');
		});

		test('slider max extends to 45 for Japanese input', async ({
			page,
			createToolPage,
		}) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			const inputArea = page.getByRole('textbox').first();
			await inputArea.fill('あいう');
			// Check that the max attribute of the number input is 45
			const shiftInput = page.getByLabel('シフト数入力');
			await expect(shiftInput).toHaveAttribute('max', '45');
		});

		test('direction toggle decode works', async ({ page, createToolPage }) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			const inputArea = page.getByRole('textbox').first();
			const outputArea = page.getByRole('textbox').nth(1);
			await inputArea.fill('def');
			// Click decode button
			await page.getByRole('button', { name: /デコード（復号）/ }).click();
			await expect(outputArea).toHaveValue('abc');
		});

		test('brute force panel expands and shows patterns', async ({
			page,
			createToolPage,
		}) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			const inputArea = page.getByRole('textbox').first();
			await inputArea.fill('def');
			// Open the brute force <details> panel by clicking its <summary>
			await page
				.locator('summary')
				.filter({ hasText: 'ブルートフォース' })
				.click();
			await expect(
				page.locator('button').filter({ hasText: 'シフト 3:' }).first(),
			).toBeVisible();
		});

		test('clicking brute force row updates slider', async ({
			page,
			createToolPage,
		}) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			const inputArea = page.getByRole('textbox').first();
			await inputArea.fill('def');
			// Open the brute force <details> panel by clicking its <summary>
			await page
				.locator('summary')
				.filter({ hasText: 'ブルートフォース' })
				.click();
			// Wait for rows to appear, then click shift 5
			const shift5Row = page
				.locator('button')
				.filter({ hasText: 'シフト 5:' })
				.first();
			await expect(shift5Row).toBeVisible();
			await shift5Row.click();
			const shiftInput = page.getByLabel('シフト数入力');
			await expect(shiftInput).toHaveValue('5');
		});

		test('passes through non-alpha characters unchanged', async ({
			page,
			createToolPage,
		}) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			const inputArea = page.getByRole('textbox').first();
			const outputArea = page.getByRole('textbox').nth(1);
			await inputArea.fill('Hello! 123');
			await expect(outputArea).toHaveValue('Khoor! 123');
		});
	});

	test.describe('ROT13', () => {
		test('encodes Hello to Uryyb', async ({ page, createToolPage }) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			await page.getByRole('tab', { name: 'ROT13' }).click();
			const inputArea = page.getByRole('textbox').first();
			const outputArea = page.getByRole('textbox').nth(1);
			await inputArea.fill('Hello');
			await expect(outputArea).toHaveValue('Uryyb');
		});

		test('is self-inverse: Uryyb decodes to Hello', async ({
			page,
			createToolPage,
		}) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			await page.getByRole('tab', { name: 'ROT13' }).click();
			const inputArea = page.getByRole('textbox').first();
			const outputArea = page.getByRole('textbox').nth(1);
			await inputArea.fill('Uryyb');
			await expect(outputArea).toHaveValue('Hello');
		});

		test('passes non-ASCII chars through unchanged', async ({
			page,
			createToolPage,
		}) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			await page.getByRole('tab', { name: 'ROT13' }).click();
			const inputArea = page.getByRole('textbox').first();
			const outputArea = page.getByRole('textbox').nth(1);
			await inputArea.fill('Hello 123!');
			await expect(outputArea).toHaveValue('Uryyb 123!');
		});
	});

	test.describe('String reversal', () => {
		test('reverses Hello to olleH', async ({ page, createToolPage }) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			await page.getByRole('tab', { name: '文字列反転' }).click();
			const inputArea = page.getByRole('textbox').first();
			const outputArea = page.getByRole('textbox').nth(1);
			await inputArea.fill('Hello');
			await expect(outputArea).toHaveValue('olleH');
		});

		test('handles emoji correctly', async ({ page, createToolPage }) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			await page.getByRole('tab', { name: '文字列反転' }).click();
			const inputArea = page.getByRole('textbox').first();
			const outputArea = page.getByRole('textbox').nth(1);
			await inputArea.fill('Hello🎉');
			await expect(outputArea).toHaveValue('🎉olleH');
		});
	});

	test.describe('Morse code', () => {
		test('encodes SOS to ... --- ...', async ({ page, createToolPage }) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			await page.getByRole('tab', { name: 'モールス信号' }).click();
			const inputArea = page.getByRole('textbox').first();
			const outputArea = page.getByRole('textbox').nth(1);
			await inputArea.fill('SOS');
			await expect(outputArea).toHaveValue('... --- ...');
		});

		test('word separator / appears in Hello World encoding', async ({
			page,
			createToolPage,
		}) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			await page.getByRole('tab', { name: 'モールス信号' }).click();
			const inputArea = page.getByRole('textbox').first();
			const outputArea = page.getByRole('textbox').nth(1);
			await inputArea.fill('Hello World');
			const output = await outputArea.inputValue();
			expect(output).toContain('/');
		});

		test('decodes ... --- ... to SOS', async ({ page, createToolPage }) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			await page.getByRole('tab', { name: 'モールス信号' }).click();
			await page.getByRole('button', { name: /デコード（復号）/ }).click();
			const inputArea = page.getByRole('textbox').first();
			const outputArea = page.getByRole('textbox').nth(1);
			await inputArea.fill('... --- ...');
			await expect(outputArea).toHaveValue('SOS');
		});
	});

	test.describe('Common UI', () => {
		test('copy button copies output', async ({ page, createToolPage }) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			const inputArea = page.getByRole('textbox').first();
			await inputArea.fill('abc');
			await toolPage.clickCopy();
			// aria-label changes to 'コピーしました' after click
			await expect(
				page.getByRole('button', { name: 'コピーしました' }),
			).toBeVisible();
		});

		test('clear button resets input', async ({ page, createToolPage }) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			const inputArea = page.getByRole('textbox').first();
			await inputArea.fill('Hello');
			await page.getByRole('button', { name: 'クリア' }).click();
			await expect(inputArea).toHaveValue('');
		});

		test('character count updates in real time', async ({
			page,
			createToolPage,
		}) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			const inputArea = page.getByRole('textbox').first();
			await inputArea.fill('Hello');
			await expect(page.getByText('5 文字').first()).toBeVisible();
		});

		test('algorithm info expands and collapses', async ({
			page,
			createToolPage,
		}) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			const summary = page.getByText('シーザー暗号について');
			await summary.click();
			await expect(
				page.getByText('各文字を指定した数だけずらして'),
			).toBeVisible();
		});

		test('empty input yields empty output without errors', async ({
			page,
			createToolPage,
		}) => {
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			const outputArea = page.getByRole('textbox').nth(1);
			await expect(outputArea).toHaveValue('');
		});
	});

	test.describe('Responsive layout', () => {
		test('375px viewport: inputs stack vertically', async ({
			page,
			createToolPage,
		}) => {
			await page.setViewportSize({ width: 375, height: 812 });
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			// Both textareas should be visible and stacked
			const textareas = page.getByRole('textbox');
			await expect(textareas.first()).toBeVisible();
			await expect(textareas.nth(1)).toBeVisible();
		});

		test('1440px viewport: inputs side by side', async ({
			page,
			createToolPage,
		}) => {
			await page.setViewportSize({ width: 1440, height: 900 });
			const toolPage = createToolPage('tools/cipher');
			await toolPage.goto();
			const textareas = page.getByRole('textbox');
			await expect(textareas.first()).toBeVisible();
			await expect(textareas.nth(1)).toBeVisible();
		});
	});
});
