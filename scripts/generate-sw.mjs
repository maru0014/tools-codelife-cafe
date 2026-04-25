// ビルド後に実行し、dist/ を走査して dist/sw.js へページ・アセット URL リストを注入する
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';

const DIST = './dist';

// dist/ 直下のディレクトリ（各ルートページ）を収集
const entries = await readdir(DIST, { withFileTypes: true });
const pageURLs = [
  '/',
  ...entries
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
    .map((d) => `/${d.name}/`),
];

// dist/_astro/ 配下の全ファイルを収集
const assetFiles = await readdir(join(DIST, '_astro'));
const assetURLs = assetFiles.map((f) => `/_astro/${f}`);

// アセット内容に基づくキャッシュバージョンハッシュ（変更があると自動失効）
const hash = createHash('md5')
  .update([...pageURLs, ...assetURLs].sort().join('\n'))
  .digest('hex')
  .slice(0, 8);

// テンプレートのプレースホルダーを置換して dist/sw.js を上書き
const template = await readFile('./public/sw.js', 'utf8');
const output = template
  .replace("'cl-tools-__HASH__'", `'cl-tools-${hash}'`)
  .replace('[/* __ALL_PAGES__ */]', JSON.stringify(pageURLs, null, 2))
  .replace('[/* __ALL_ASSETS__ */]', JSON.stringify(assetURLs, null, 2));

await writeFile(join(DIST, 'sw.js'), output, 'utf8');

console.log(`[generate-sw] CACHE_NAME: cl-tools-${hash}`);
console.log(`[generate-sw] pages: ${pageURLs.length}, assets: ${assetURLs.length}`);
