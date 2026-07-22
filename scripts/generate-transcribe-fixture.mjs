// generate-transcribe-fixture.mjs
// /transcribe の E2E / スモークテスト用の小さな WAV を生成する。
//
//   node scripts/generate-transcribe-fixture.mjs
//
// 音声内容は合成トーン（音声認識の精度検証用ではない）。
// E2E は Mock Worker で「投入 → progress/segment/done → SRT ダウンロード」を検証するため、
// フィクスチャに求められるのは「ブラウザが decodeAudioData できる小さな実ファイル」であること。

import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'tests', 'e2e', 'fixtures', 'transcribe-sample.wav');

const SAMPLE_RATE = 16000;
const DURATION_SEC = 2;
const samples = SAMPLE_RATE * DURATION_SEC;

const data = Buffer.alloc(samples * 2);
for (let i = 0; i < samples; i++) {
	const t = i / SAMPLE_RATE;
	// 220Hz のトーンを 3Hz で振幅変調（無音ではないが音声でもない合成波）
	const envelope = 0.4 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 3 * t));
	const value = Math.sin(2 * Math.PI * 220 * t) * envelope;
	data.writeInt16LE(Math.round(value * 32767), i * 2);
}

const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + data.length, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16); // PCM chunk size
header.writeUInt16LE(1, 20); // format = PCM
header.writeUInt16LE(1, 22); // channels
header.writeUInt32LE(SAMPLE_RATE, 24);
header.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
header.writeUInt16LE(2, 32); // block align
header.writeUInt16LE(16, 34); // bits per sample
header.write('data', 36);
header.writeUInt32LE(data.length, 40);

await writeFile(OUT, Buffer.concat([header, data]));
console.log(
	`生成: ${OUT} (${DURATION_SEC}秒 / ${SAMPLE_RATE}Hz / mono / ${(44 + data.length) / 1024}KB)`,
);
