import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	type AnalyticsEvents,
	getSearchQueryMetadata,
} from '../../src/lib/analytics.ts';

test('getSearchQueryMetadata: 正常な検索クエリからメタデータを抽出する', () => {
	const meta1 = getSearchQueryMetadata('JSON 整形');
	assert.strictEqual(meta1.lengthBucket, '4-10');
	assert.strictEqual(meta1.hasJapanese, true);
	assert.strictEqual(meta1.tokenCount, 2);
	assert.strictEqual(meta1.q_redacted, undefined);
});

test('getSearchQueryMetadata: メールアドレス等のPIIを含む場合はq_redactedが付与される', () => {
	const meta2 = getSearchQueryMetadata('test@example.com');
	assert.strictEqual(meta2.hasJapanese, false);
	assert.strictEqual(meta2.q_redacted, true);
});

test('AnalyticsEvents: settings_restore は設定保持利用率の計測元を表現できる', () => {
	const event = {
		tool: 'json-formatter',
		source: 'url',
	} satisfies AnalyticsEvents['settings_restore'];

	assert.deepStrictEqual(event, { tool: 'json-formatter', source: 'url' });
});
