// 実行方法: npm run test:unit（Node 22 の型ストリッピングで .ts を直接実行）
// 単体実行: node --test tests/unit/image-compress.test.ts
//
// canvas 依存（compressImage / compressToTargetSize）はブラウザ専用のため E2E で検証する。
// ここでは純粋ロジック（寸法計算・二分探索・形式解決・ZIPバイナリ生成）を対象とする。
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crc32 as zlibCrc32 } from 'node:zlib';
import {
	buildCompressedFilename,
	computeTargetDimensions,
	extensionForMime,
	needsBackgroundFill,
	resolveOutputFormat,
	searchQualityForTargetSize,
	validateFileCount,
	validateImageFile,
} from '../../src/lib/tools/image-compress.ts';
import { buildZip, crc32Of, dedupeZipNames } from '../../src/lib/tools/zip.ts';

// ---------------------------------------------------------------------------
// computeTargetDimensions
// ---------------------------------------------------------------------------

test('computeTargetDimensions: none は原寸を返す', () => {
	assert.deepEqual(computeTargetDimensions(1920, 1080, { type: 'none' }), {
		width: 1920,
		height: 1080,
	});
});

test('computeTargetDimensions: max-width は縦横比維持・拡大しない', () => {
	assert.deepEqual(
		computeTargetDimensions(1920, 1080, { type: 'max-width', value: 960 }),
		{ width: 960, height: 540 },
	);
	// 既に小さい場合は原寸（拡大しない）
	assert.deepEqual(
		computeTargetDimensions(800, 600, { type: 'max-width', value: 960 }),
		{ width: 800, height: 600 },
	);
});

test('computeTargetDimensions: max-height は高さ基準で縮小', () => {
	assert.deepEqual(
		computeTargetDimensions(1920, 1080, { type: 'max-height', value: 540 }),
		{ width: 960, height: 540 },
	);
});

test('computeTargetDimensions: long-edge は長辺基準（縦長/横長両対応）', () => {
	assert.deepEqual(
		computeTargetDimensions(1000, 2000, { type: 'long-edge', value: 1000 }),
		{ width: 500, height: 1000 },
	);
	assert.deepEqual(
		computeTargetDimensions(2000, 1000, { type: 'long-edge', value: 1000 }),
		{ width: 1000, height: 500 },
	);
});

test('computeTargetDimensions: percent は倍率適用・最小1px', () => {
	assert.deepEqual(
		computeTargetDimensions(1000, 500, { type: 'percent', value: 50 }),
		{ width: 500, height: 250 },
	);
	assert.deepEqual(
		computeTargetDimensions(10, 10, { type: 'percent', value: 1 }),
		{ width: 1, height: 1 },
	);
});

// ---------------------------------------------------------------------------
// searchQualityForTargetSize（二分探索）
// ---------------------------------------------------------------------------

function makeProbe(size: number) {
	return { blob: new Blob([new Uint8Array(0)]), size };
}

test('searchQualityForTargetSize: 目標以下の最大品質を選ぶ', async () => {
	let calls = 0;
	// size は quality に対して単調増加（quality*10000 バイト）
	const encode = async (q: number) => {
		calls++;
		return makeProbe(Math.round(q * 10000));
	};
	const target = 6000; // quality 0.6 相当
	const { probe, quality, reached } = await searchQualityForTargetSize(
		encode,
		target,
	);
	assert.equal(reached, true);
	assert.ok(probe.size <= target, `size ${probe.size} <= ${target}`);
	assert.ok(quality >= 0.3 && quality <= 1);
	// 収束した品質は目標境界(0.6)付近
	assert.ok(Math.abs(quality - 0.6) < 0.05, `quality≈0.6 (${quality})`);
	assert.ok(calls <= 8, `encode 呼び出しは8回以下 (${calls})`);
});

test('searchQualityForTargetSize: 下限でも超過なら target-not-reached 相当', async () => {
	let calls = 0;
	const encode = async (q: number) => {
		calls++;
		return makeProbe(Math.round(q * 10000));
	};
	// 下限品質 0.3 → 3000バイト。target=1000 はどう頑張っても未達
	const { probe, quality, reached } = await searchQualityForTargetSize(
		encode,
		1000,
	);
	assert.equal(reached, false);
	assert.equal(quality, 0.3);
	assert.equal(probe.size, 3000, '下限品質の結果を返す');
	assert.equal(calls, 1, '未達時は下限1回のみ測定');
});

// ---------------------------------------------------------------------------
// バリデーション / 形式解決
// ---------------------------------------------------------------------------

test('validateImageFile: 対応形式・サイズ', () => {
	assert.deepEqual(validateImageFile({ type: 'image/jpeg', size: 1000 }), {
		ok: true,
	});
	assert.equal(validateImageFile({ type: 'image/gif', size: 1000 }).ok, false);
	assert.equal(
		validateImageFile({ type: 'image/jpeg', size: 51 * 1024 * 1024 }).ok,
		false,
	);
});

test('validateFileCount: 30枚上限', () => {
	assert.deepEqual(validateFileCount(30), { ok: true });
	assert.equal(validateFileCount(31).ok, false);
});

test('resolveOutputFormat: keep は入力維持・未知はJPEGフォールバック', () => {
	assert.deepEqual(resolveOutputFormat('keep', 'image/png'), {
		mime: 'image/png',
		ext: 'png',
	});
	assert.deepEqual(resolveOutputFormat('webp', 'image/png'), {
		mime: 'image/webp',
		ext: 'webp',
	});
	assert.deepEqual(resolveOutputFormat('jpeg', 'image/png'), {
		mime: 'image/jpeg',
		ext: 'jpg',
	});
	assert.deepEqual(resolveOutputFormat('keep', 'image/gif'), {
		mime: 'image/jpeg',
		ext: 'jpg',
	});
});

test('extensionForMime / needsBackgroundFill / buildCompressedFilename', () => {
	assert.equal(extensionForMime('image/jpeg'), 'jpg');
	assert.equal(extensionForMime('image/webp'), 'webp');
	assert.equal(needsBackgroundFill('image/jpeg'), true);
	assert.equal(needsBackgroundFill('image/png'), false);
	assert.equal(
		buildCompressedFilename('photo.JPEG', 'webp'),
		'photo_compressed.webp',
	);
	assert.equal(buildCompressedFilename('noext', 'jpg'), 'noext_compressed.jpg');
});

// ---------------------------------------------------------------------------
// zip.ts
// ---------------------------------------------------------------------------

test('dedupeZipNames: 同名に _2/_3 を付与（拡張子前）', () => {
	assert.deepEqual(dedupeZipNames(['a.jpg', 'a.jpg', 'a.jpg', 'b.png']), [
		'a.jpg',
		'a_2.jpg',
		'a_3.jpg',
		'b.png',
	]);
});

test('crc32Of: zlib.crc32 と一致する', () => {
	for (const s of ['', 'abc', '123456789', 'こんにちは🍣']) {
		const bytes = new TextEncoder().encode(s);
		assert.equal(crc32Of(bytes), zlibCrc32(bytes) >>> 0, `CRC32("${s}")`);
	}
});

// ---- ZIP バイナリの最小パーサ（検証用） ----
function parseZip(buf: Uint8Array) {
	const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
	// EOCD はコメント無しなので末尾22バイト
	const eocd = buf.byteLength - 22;
	assert.equal(dv.getUint32(eocd, true), 0x06054b50, 'EOCD シグネチャ');
	const totalRecords = dv.getUint16(eocd + 10, true);
	const cdSize = dv.getUint32(eocd + 12, true);
	const cdOffset = dv.getUint32(eocd + 16, true);

	const entries: Array<{ name: string; crc: number; data: Uint8Array }> = [];
	let p = cdOffset;
	const decoder = new TextDecoder();
	for (let i = 0; i < totalRecords; i++) {
		assert.equal(
			dv.getUint32(p, true),
			0x02014b50,
			'中央ディレクトリ シグネチャ',
		);
		const flag = dv.getUint16(p + 8, true);
		assert.equal(flag & 0x0800, 0x0800, 'UTF-8フラグ(bit11)が立っている');
		const crc = dv.getUint32(p + 16, true);
		const compSize = dv.getUint32(p + 20, true);
		const nameLen = dv.getUint16(p + 28, true);
		const extraLen = dv.getUint16(p + 30, true);
		const commentLen = dv.getUint16(p + 32, true);
		const localOffset = dv.getUint32(p + 42, true);
		const name = decoder.decode(buf.subarray(p + 46, p + 46 + nameLen));

		// ローカルヘッダからデータを取り出す
		assert.equal(
			dv.getUint32(localOffset, true),
			0x04034b50,
			'ローカルヘッダ シグネチャ',
		);
		const localNameLen = dv.getUint16(localOffset + 26, true);
		const localExtraLen = dv.getUint16(localOffset + 28, true);
		const dataStart = localOffset + 30 + localNameLen + localExtraLen;
		const data = buf.subarray(dataStart, dataStart + compSize);

		entries.push({ name, crc, data });
		p += 46 + nameLen + extraLen + commentLen;
	}
	return { totalRecords, cdSize, cdOffset, entries };
}

test('buildZip: PKシグネチャ・エントリ数・CRC32・stored復元が正しい', async () => {
	const file1 = new TextEncoder().encode('Hello, CODE:LIFE!');
	const file2 = new TextEncoder().encode(
		'日本語ファイル名のテスト🍣'.repeat(5),
	);
	const blob = await buildZip([
		{ name: '英語.txt', data: file1 },
		{ name: '日本語.txt', data: file2 },
	]);
	const buf = new Uint8Array(await blob.arrayBuffer());

	// 先頭は PK シグネチャ
	assert.equal(buf[0], 0x50, 'P');
	assert.equal(buf[1], 0x4b, 'K');
	assert.equal(blob.type, 'application/zip');

	const parsed = parseZip(buf);
	assert.equal(parsed.totalRecords, 2, '中央ディレクトリのエントリ数');
	assert.deepEqual(
		parsed.entries.map((e) => e.name),
		['英語.txt', '日本語.txt'],
		'日本語ファイル名が保持される',
	);

	// CRC32 と stored データの復元検証
	const originals = [file1, file2];
	for (let i = 0; i < originals.length; i++) {
		const entry = parsed.entries[i];
		assert.equal(entry.crc, zlibCrc32(originals[i]) >>> 0, `CRC32一致 [${i}]`);
		assert.deepEqual(
			Array.from(entry.data),
			Array.from(originals[i]),
			`stored データ復元 [${i}]`,
		);
	}
});

test('buildZip: Blob入力も扱える', async () => {
	const data = new TextEncoder().encode('blob input test');
	const blob = await buildZip([{ name: 't.txt', data: new Blob([data]) }]);
	const buf = new Uint8Array(await blob.arrayBuffer());
	const parsed = parseZip(buf);
	assert.equal(parsed.totalRecords, 1);
	assert.deepEqual(Array.from(parsed.entries[0].data), Array.from(data));
});
