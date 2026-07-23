// /transcribe（ローカル文字起こし）の E2E
//
// 検証は3層に分ける（正本「詳細設計書 10-A」）:
//   1. Mock Worker による UI フロー（投入 → progress/segment/done → SRT ダウンロード）
//   2. 配信・CSP・計測の検証（許可リスト方式で外部通信ゼロを確認）
//   3. 実 Whisper モデルのロード・推論は CI に持ち込まない（Phase A2 後の手動統合テスト）
//
// そのため本ファイルは外部ネットワークに依存しない。

import { getModelArtifact } from '../../src/lib/transcribe/model-manifest';
import { expect, test } from './fixtures/base';
import { installMock } from './helpers/transcribe-mock-worker';

declare global {
	interface Window {
		__TRANSCRIBE_MOCK_MODE__?: string;
		__TRANSCRIBE_MOCK_TERMINATED__?: number;
		__CLC_ANALYTICS_DISABLED__?: boolean;
	}
}

const FIXTURE = 'tests/e2e/fixtures/transcribe-sample.wav';

test('ページが表示され、SafetyBadge とモデル選択が出る', async ({
	page,
	createToolPage,
}) => {
	const toolPage = createToolPage('transcribe');
	await toolPage.goto();
	await toolPage.expectSafetyBadge();
	await expect(page.getByLabel('モデル')).toBeVisible();
	await expect(page.getByLabel('言語')).toBeVisible();
	await expect(page.getByText('音声はこの端末から出ません')).toBeVisible();
});

test('ファイル投入 → 進捗 → セグメント表示 → SRT ダウンロード', async ({
	page,
}) => {
	await installMock(page);
	await page.goto('/transcribe');

	await page.locator('input[type=file]').setInputFiles(FIXTURE);
	await expect(page.getByTestId('transcribe-run')).toBeEnabled();

	await page.getByTestId('transcribe-run').click();

	// 3フェーズ進捗のうち、モデル取得か文字起こしのいずれかが観測できること
	await expect(page.getByTestId('transcribe-progress-detail')).toBeVisible();

	// 完了後にセグメントが表示され、編集可能になる
	await expect(page.getByTestId('transcribe-segments')).toContainText(
		'こんにちは',
	);
	await expect(page.getByTestId('transcribe-segments')).toContainText(
		'テストです',
	);
	await expect(
		page.locator('[data-testid="transcribe-segments"] textarea').first(),
	).toBeVisible();

	const downloadPromise = page.waitForEvent('download');
	await page.getByTestId('transcribe-download-srt').click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toBe('transcribe-sample.srt');
});

test('処理中にキャンセルすると Worker を破棄して idle に戻る（エラーにしない）', async ({
	page,
}) => {
	await installMock(page, 'stall');
	await page.goto('/transcribe');

	await page.locator('input[type=file]').setInputFiles(FIXTURE);
	await page.getByTestId('transcribe-run').click();

	await expect(page.getByTestId('transcribe-cancel')).toBeVisible();
	await page.getByTestId('transcribe-cancel').click();

	await expect(page.getByTestId('transcribe-cancel')).toHaveCount(0);
	await expect(page.getByTestId('transcribe-progress')).toHaveCount(0);
	await expect(page.getByTestId('transcribe-error')).toHaveCount(0);
	expect(
		await page.evaluate(() => window.__TRANSCRIBE_MOCK_TERMINATED__),
	).toBeGreaterThan(0);
});

test('モデル読み込み失敗時は日本語ガイダンスと再試行手段を出す', async ({
	page,
}) => {
	await installMock(page, 'load-error');
	await page.goto('/transcribe');

	await page.locator('input[type=file]').setInputFiles(FIXTURE);
	await page.getByTestId('transcribe-run').click();

	const error = page.getByTestId('transcribe-error');
	await expect(error).toContainText('モデルの読み込みに失敗しました');
	await expect(error.getByRole('button', { name: '再試行' })).toBeVisible();
	await expect(
		error.getByRole('button', { name: 'キャッシュを削除して再取得' }),
	).toBeVisible();
});

test('推論中の OOM は専用ガイダンスに正規化される', async ({ page }) => {
	await installMock(page, 'infer-error');
	await page.goto('/transcribe');

	await page.locator('input[type=file]').setInputFiles(FIXTURE);
	await page.getByTestId('transcribe-run').click();

	await expect(page.getByTestId('transcribe-error')).toContainText(
		'メモリが不足しました',
	);
});

test('15分を超える音声はデコード前に file-too-long で停止する', async ({
	page,
}) => {
	await installMock(page);
	await page.goto('/transcribe');

	// 16分の 8kHz / 8bit モノラル WAV をページ内で生成する
	// （長尺フィクスチャをリポジトリに置かずに duration 判定だけを検証する）
	await page.evaluate(() => {
		const rate = 8000;
		const seconds = 16 * 60;
		const samples = rate * seconds;
		const buffer = new ArrayBuffer(44 + samples);
		const view = new DataView(buffer);
		const write = (offset: number, text: string) => {
			for (let i = 0; i < text.length; i++)
				view.setUint8(offset + i, text.charCodeAt(i));
		};
		write(0, 'RIFF');
		view.setUint32(4, 36 + samples, true);
		write(8, 'WAVE');
		write(12, 'fmt ');
		view.setUint32(16, 16, true);
		view.setUint16(20, 1, true);
		view.setUint16(22, 1, true);
		view.setUint32(24, rate, true);
		view.setUint32(28, rate, true);
		view.setUint16(32, 1, true);
		view.setUint16(34, 8, true);
		write(36, 'data');
		view.setUint32(40, samples, true);
		new Uint8Array(buffer, 44).fill(128); // 8bit PCM の無音は 128
		const input = document.querySelector<HTMLInputElement>('input[type=file]');
		if (!input) throw new Error('file input not found');
		const transfer = new DataTransfer();
		transfer.items.add(new File([buffer], 'long.wav', { type: 'audio/wav' }));
		input.files = transfer.files;
		input.dispatchEvent(new Event('change', { bubbles: true }));
	});

	await expect(page.getByTestId('transcribe-error')).toContainText(
		'音声が長すぎます',
	);
});

test('処理中は beforeunload で離脱を警告する', async ({ page }) => {
	await installMock(page, 'stall');
	await page.goto('/transcribe');

	await page.locator('input[type=file]').setInputFiles(FIXTURE);
	await page.getByTestId('transcribe-run').click();
	await expect(page.getByTestId('transcribe-cancel')).toBeVisible();

	const prevented = await page.evaluate(() => {
		const event = new Event('beforeunload', { cancelable: true });
		window.dispatchEvent(event);
		return event.defaultPrevented;
	});
	expect(prevented).toBe(true);
});

test('CSP・計測: connect-src が self に限定され、外部通信と計測が発生しない', async ({
	page,
}) => {
	await installMock(page);

	const requested: string[] = [];
	page.on('request', (request) => requested.push(request.url()));

	await page.goto('/transcribe');
	await page.locator('input[type=file]').setInputFiles(FIXTURE);
	await page.getByTestId('transcribe-run').click();
	await expect(page.getByTestId('transcribe-segments')).toContainText(
		'テストです',
	);

	// 1. ページ側の CSP（meta）で connect-src が self に絞られている
	const csp = await page
		.locator('meta[http-equiv="Content-Security-Policy"]')
		.getAttribute('content');
	expect(csp).toContain("connect-src 'self'");
	expect(csp).toContain("worker-src 'self' blob:");
	expect(csp).not.toContain('jsdelivr');
	expect(csp).not.toContain('huggingface');

	// 2. 計測キルスイッチが立っており、共通 Analytics が読み込まれていない
	expect(
		await page.evaluate(() => window.__CLC_ANALYTICS_DISABLED__ === true),
	).toBe(true);

	// 3. 全リクエストを許可リスト方式で検証する
	//    （connect-src 'self' だけでは同一オリジンの /api/event を防げないため、
	//     レイアウト側の無効化が効いていることをここで担保する）
	const origin = new URL(page.url()).origin;
	const disallowed = requested.filter((url) => {
		if (url.startsWith('data:') || url.startsWith('blob:')) return false;
		if (!url.startsWith(origin)) return true;
		return new URL(url).pathname.startsWith('/api/');
	});
	expect(disallowed).toEqual([]);
});

test('モデル取得先は同一オリジンかつ revision 付きのパスに固定されている', async ({
	page,
}) => {
	await page.goto('/transcribe');

	// 実モデル取得は行わず、配信ルートが同一オリジンであることだけを確認する。
	// revision なしの旧パスは配信対象ではない（Pages Function の許可リスト外）。
	const tiny = getModelArtifact('tiny');
	expect(tiny.repositoryPath).toBe(`${tiny.name}/${tiny.revision}/`);

	const status = await page.evaluate(async (repositoryPath: string) => {
		const revisioned = await fetch(
			`/models/transcribe/${repositoryPath}config.json`,
			{ method: 'HEAD' },
		);
		const legacy = await fetch('/models/transcribe/whisper-tiny/config.json', {
			method: 'HEAD',
		});
		return { revisioned: revisioned.status, legacy: legacy.status };
	}, tiny.repositoryPath);

	// ローカル未取得なら 404、取得済みなら 200。いずれにせよ外部へは出ない
	expect([200, 404]).toContain(status.revisioned);
	// revision なしの旧パスは配信対象ではない
	expect(status.legacy).toBe(404);
});

test('smallの「推奨」表示は WebGPU とメモリ安全判定の両方を通過したときだけ出る', async ({
	page,
}) => {
	const stub = (gpu: boolean, deviceMemory: number | undefined) => `
		${
			gpu
				? "Object.defineProperty(navigator, 'gpu', { configurable: true, value: { requestAdapter: async () => ({ features: new Set(['shader-f16']) }) } });"
				: "Object.defineProperty(navigator, 'gpu', { configurable: true, value: undefined });"
		}
		Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: ${
			deviceMemory === undefined ? 'undefined' : deviceMemory
		} });
	`;
	const badge = () => page.getByTestId('transcribe-small-recommended');

	// 1. WebGPU あり × メモリ十分 × ファイル選択済み → 推奨する
	await installMock(page, 'ok', [stub(true, 16)]);
	await page.goto('/transcribe');
	await expect(badge()).toHaveCount(0); // ファイル未選択では出さない
	await page.locator('input[type=file]').setInputFiles(FIXTURE);
	await expect(badge()).toBeVisible();

	// 2. WebGPU あり × メモリ 4GB（small は危険） → 推奨しない
	const risky = await page.context().newPage();
	await installMock(risky, 'ok', [stub(true, 4)]);
	await risky.goto('/transcribe');
	await risky.locator('input[type=file]').setInputFiles(FIXTURE);
	await expect(risky.getByTestId('transcribe-small-recommended')).toHaveCount(
		0,
	);
	await risky.close();

	// 3. WebGPU あり × deviceMemory 取得不能 → 安全通過扱いにしない
	const unknown = await page.context().newPage();
	await installMock(unknown, 'ok', [stub(true, undefined)]);
	await unknown.goto('/transcribe');
	await unknown.locator('input[type=file]').setInputFiles(FIXTURE);
	await expect(unknown.getByTestId('transcribe-small-recommended')).toHaveCount(
		0,
	);
	await unknown.close();

	// 4. WebGPU なし（WASM） → 推奨しない
	const wasm = await page.context().newPage();
	await installMock(wasm, 'ok', [stub(false, 32)]);
	await wasm.goto('/transcribe');
	await wasm.locator('input[type=file]').setInputFiles(FIXTURE);
	await expect(wasm.getByTestId('transcribe-small-recommended')).toHaveCount(0);
	await wasm.close();
});
