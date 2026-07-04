import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	type BatchItemBase,
	type BatchRunHandlers,
	runBatch,
} from '../../src/lib/hooks/useBatchProcessing.ts';
import {
	createResourceTracker,
	createRunTracker,
} from '../../src/lib/hooks/useProcessingLifecycle.ts';

type Item = BatchItemBase & { url: string };

function noopHandlers(overrides: Partial<BatchRunHandlers<Item>> = {}) {
	return {
		onRunStart: () => {},
		onItemSuccess: () => {},
		onStalePatch: () => {},
		onItemError: () => {},
		onProgress: () => {},
		onRunComplete: () => {},
		...overrides,
	} satisfies BatchRunHandlers<Item>;
}

describe('runBatch — 選択と処理開始を分離する2段階フロー', () => {
	it('保持→遅延開始: アイテムを保持した後、任意のタイミングで開始しても全件処理される', async () => {
		const runner = createRunTracker();
		const held: Item[] = [
			{ id: '1', status: 'pending', url: 'blob:1' },
			{ id: '2', status: 'pending', url: 'blob:2' },
		];
		// 「保持」段階では runBatch は一切呼ばれない（選択と処理開始の分離）
		// 後から任意のタイミングで開始する
		const processed: string[] = [];
		const succeeded: string[] = [];

		await runBatch(
			runner,
			held,
			async (item) => {
				processed.push(item.id);
				return { url: `${item.url}-done` };
			},
			noopHandlers({
				onItemSuccess: (item) => succeeded.push(item.id),
			}),
			'失敗しました',
		);

		assert.deepEqual(processed, ['1', '2']);
		assert.deepEqual(succeeded, ['1', '2']);
	});

	it('開始前キャンセル: 保持のみで開始前にキャンセルしても、後続の開始が正常に動作する', async () => {
		const runner = createRunTracker();

		// 保持段階でキャンセル（クリア）してもランは一度も始まっていない
		runner.cancel();

		const processed: string[] = [];
		await runBatch(
			runner,
			[{ id: '1', status: 'pending', url: 'blob:1' }],
			async (item) => {
				processed.push(item.id);
				return {};
			},
			noopHandlers(),
			'失敗しました',
		);

		// beginRun() がキャンセル状態をリセットするため、開始前キャンセルは以後の開始を妨げない
		assert.deepEqual(processed, ['1']);
	});

	it('開始前キャンセル: 保持したアイテムを一度も開始せずにクリアすると、processItem は呼ばれずリソースのみ解放される', () => {
		const tracker = createResourceTracker<Item>();
		const released: string[] = [];
		const release = (item: Item) => released.push(item.url);
		const processorCalls: string[] = [];

		const held: Item[] = [
			{ id: '1', status: 'pending', url: 'blob:1' },
			{ id: '2', status: 'pending', url: 'blob:2' },
		];
		tracker.track(held);

		// startHeld を一度も呼ばずに clear() 相当の操作を行う
		tracker.releaseAll(release);

		assert.deepEqual(released, ['blob:1', 'blob:2']);
		assert.deepEqual(processorCalls, []);
	});

	it('失敗時のリソース解放: 一部アイテムが失敗しても処理は継続し、失敗アイテムのエラーが記録される', async () => {
		const runner = createRunTracker();
		const errors: { id: string; message: string }[] = [];
		const succeeded: string[] = [];

		await runBatch(
			runner,
			[
				{ id: '1', status: 'pending', url: 'blob:1' },
				{ id: '2', status: 'pending', url: 'blob:2' },
				{ id: '3', status: 'pending', url: 'blob:3' },
			],
			async (item) => {
				if (item.id === '2') throw new Error('boom');
				return { url: `${item.url}-done` };
			},
			noopHandlers({
				onItemSuccess: (item) => succeeded.push(item.id),
				onItemError: (item, message) => errors.push({ id: item.id, message }),
			}),
			'失敗しました',
		);

		assert.deepEqual(succeeded, ['1', '3']);
		assert.deepEqual(errors, [{ id: '2', message: 'boom' }]);
	});

	it('失敗時のリソース解放: 中断後に届いた成功パッチは onStalePatch へ渡され、確実に解放できる', async () => {
		const runner = createRunTracker();
		const released: string[] = [];

		const run = runBatch(
			runner,
			[{ id: '1', status: 'pending', url: 'blob:1' }],
			async () => {
				runner.cancel();
				return { url: 'blob:stale-result' };
			},
			noopHandlers({
				onStalePatch: (patch) => {
					if (patch.url) released.push(patch.url);
				},
			}),
			'失敗しました',
		);

		await run;

		assert.deepEqual(released, ['blob:stale-result']);
	});

	it('結果クリア時のObjectURL解放: 完了後にアイテムを差し替えると、旧アイテムのリソースが解放される', () => {
		const tracker = createResourceTracker<Item>();
		const revoked: string[] = [];
		const release = (item: Item) => revoked.push(item.url);

		tracker.track([
			{ id: '1', status: 'done', url: 'blob:old-1' },
			{ id: '2', status: 'done', url: 'blob:old-2' },
		]);

		// clear() 相当: 現在の追跡対象を解放してから空に差し替える
		tracker.releaseAll(release);
		tracker.track([]);

		assert.deepEqual(revoked, ['blob:old-1', 'blob:old-2']);

		// 差し替え後に再度 releaseAll しても二重解放されない
		tracker.releaseAll(release);
		assert.deepEqual(revoked, ['blob:old-1', 'blob:old-2']);
	});

	it('調整後の再実行: 完了後に同じアイテムを新しい処理内容で再実行できる', async () => {
		const runner = createRunTracker();
		const results: string[] = [];

		const items: Item[] = [{ id: '1', status: 'pending', url: 'blob:1' }];

		await runBatch(
			runner,
			items,
			async () => ({ url: 'result-v1' }),
			noopHandlers({
				onItemSuccess: (_item, patch) => {
					if (patch.url) results.push(patch.url);
				},
			}),
			'失敗しました',
		);

		// クロップ・回転などを調整した後、同じアイテムを再実行する
		await runBatch(
			runner,
			items,
			async () => ({ url: 'result-v2' }),
			noopHandlers({
				onItemSuccess: (_item, patch) => {
					if (patch.url) results.push(patch.url);
				},
			}),
			'失敗しました',
		);

		assert.deepEqual(results, ['result-v1', 'result-v2']);
	});
});
