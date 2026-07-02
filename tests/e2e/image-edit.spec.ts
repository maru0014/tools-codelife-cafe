import fs from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';
import { expect, test } from './fixtures/base';

const FIX = (name: string) =>
	path.join(process.cwd(), 'tests', 'e2e', 'fixtures', name);

const PNG = FIX('sample-400x300.png');
const WEBP = FIX('convert-sample.webp');

const input = (page: Page) => page.getByTestId('image-edit-input');
const downloadBtn = (page: Page) =>
	page.getByRole('button', { name: 'ダウンロード', exact: true });

/** ダウンロードボタンを押して結果ファイルを読み取る */
async function readDownload(
	page: Page,
): Promise<{ name: string; buf: Buffer }> {
	const downloadPromise = page.waitForEvent('download');
	await downloadBtn(page).click();
	const download = await downloadPromise;
	const buf = fs.readFileSync(await download.path());
	return { name: download.suggestedFilename(), buf };
}

/** PNG の IHDR から幅・高さを読み取る */
function pngSize(buf: Buffer): { width: number; height: number } {
	return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

test.describe('画像クロップ・回転・反転', () => {
	test.beforeEach(async ({ createToolPage }) => {
		const toolPage = createToolPage('image-edit');
		await toolPage.goto();
	});

	test('ページ表示とSafetyBadge・プライバシー注記', async ({
		page,
		createToolPage,
	}) => {
		const toolPage = createToolPage('image-edit');
		await toolPage.expectTitle('画像のクロップ・回転・反転');
		await toolPage.expectSafetyBadge();
		await expect(
			page
				.getByText('画像はサーバーに送信されません', { exact: false })
				.first(),
		).toBeVisible();
	});

	test('単一PNGを編集なしでダウンロードできる', async ({ page }) => {
		await input(page).setInputFiles(PNG);
		await expect(downloadBtn(page)).toBeVisible();

		const { name, buf } = await readDownload(page);
		expect(name).toBe('sample-400x300_edited.png');
		// PNG マジックナンバー
		expect(buf[0]).toBe(0x89);
		expect(buf.toString('latin1', 1, 4)).toBe('PNG');
		expect(pngSize(buf)).toEqual({ width: 400, height: 300 });

		await expect(page.getByTestId('edit-completion')).toContainText(
			'処理完了: 1件',
		);
	});

	test('右90°回転で縦横が入れ替わる', async ({ page }) => {
		await input(page).setInputFiles(PNG);
		await page.getByRole('button', { name: '右に90°回転' }).click();
		await expect(page.getByText('90°', { exact: true })).toBeVisible();

		const { buf } = await readDownload(page);
		expect(pngSize(buf)).toEqual({ width: 300, height: 400 });
	});

	test('180°回転で元の寸法を維持する（1px膨らみの回帰テスト）', async ({
		page,
	}) => {
		await input(page).setInputFiles(PNG);
		const rotate = page.getByRole('button', { name: '右に90°回転' });
		await rotate.click();
		await rotate.click();
		await expect(page.getByText('180°', { exact: true })).toBeVisible();

		// cos(π) の浮動小数点誤差により 401×301 になっていた回帰を検証する
		const { buf } = await readDownload(page);
		expect(pngSize(buf)).toEqual({ width: 400, height: 300 });
	});

	test('複数画像 → edited.zip（PK署名＋エントリ数）', async ({ page }) => {
		await input(page).setInputFiles([PNG, WEBP]);
		const zipButton = page.getByRole('button', {
			name: '2枚をZIPでダウンロード',
		});
		await expect(zipButton).toBeVisible();

		const downloadPromise = page.waitForEvent('download');
		await zipButton.click();
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toBe('edited.zip');

		const buf = fs.readFileSync(await download.path());
		expect(buf[0]).toBe(0x50);
		expect(buf[1]).toBe(0x4b); // PK
		// EOCD（末尾22バイト・コメント無し）の総エントリ数 = 2
		const eocd = buf.length - 22;
		expect(buf.readUInt32LE(eocd)).toBe(0x06054b50);
		expect(buf.readUInt16LE(eocd + 10)).toBe(2);
	});

	test('上限超過（枚数）で日本語エラー', async ({ page }) => {
		const files = Array.from({ length: 31 }, (_, i) => ({
			name: `a${i}.png`,
			mimeType: 'image/png',
			buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
		}));
		await input(page).setInputFiles(files);
		await expect(page.getByRole('alert')).toContainText(
			'一度に処理できるのは30ファイルまで',
		);
	});

	test('クリアで初期状態に戻る', async ({ page }) => {
		await input(page).setInputFiles(PNG);
		await expect(downloadBtn(page)).toBeVisible();
		await page.getByRole('button', { name: 'クリア' }).click();
		await expect(downloadBtn(page)).toBeHidden();
	});
});
