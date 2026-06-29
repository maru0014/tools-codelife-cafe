import type { ToolCatalogItem } from './catalog';

// 手動キュレーションによる人気ツールのslugリスト（初期順序）
const POPULAR_TOOL_SLUGS = [
	'json-formatter',
	'image-compress',
	'tax',
	'regex-tester',
	'char-count',
	'pdf-merge',
	'csv-editor',
	'qr-generator',
];

/**
 * カタログから人気順にソートされたツールのリストを取得する。
 * 将来的には Cloudflare Analytics Engine やDB等の計測データから
 * `tool_run` 集計結果を取得して並べ替えるように抽象化されている。
 */
export function getPopularTools(catalog: ToolCatalogItem[]): ToolCatalogItem[] {
	// POPULAR_TOOL_SLUGS に定義された順にソートして返す
	// 定義されていないツールは除外、または後方に配置する
	const popularMap = new Map(
		POPULAR_TOOL_SLUGS.map((slug, index) => [slug, index]),
	);

	return catalog
		.filter((tool) => popularMap.has(tool.id))
		.sort((a, b) => {
			const indexA = popularMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
			const indexB = popularMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
			return indexA - indexB;
		});
}
