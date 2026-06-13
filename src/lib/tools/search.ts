import { type ToolCatalogItem, toolCatalog } from './catalog';

// マッチ箇所ごとの重み（大きいほど優先）
const SCORE_TITLE_PREFIX = 100;
const SCORE_TITLE_PARTIAL = 80;
const SCORE_KEYWORD = 60;
const SCORE_CATEGORY_DESCRIPTION = 40;

/**
 * 検索用にテキストを正規化する。
 * 小文字化に加え、ひらがなをカタカナに変換することで
 * 「かうんと」→「カウント」のような表記ゆれを吸収する。
 */
export function normalizeSearchText(text: string): string {
	return text
		.toLowerCase()
		.replace(/[ぁ-ゖ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
}

/**
 * ツール1件に対するクエリの関連度スコアを返す（0 = 不一致）。
 * 優先順: タイトル前方一致 > タイトル部分一致 > キーワード一致 > カテゴリ・説明文一致
 */
export function scoreToolMatch(tool: ToolCatalogItem, query: string): number {
	const q = normalizeSearchText(query);
	if (!q) return 0;

	const title = normalizeSearchText(tool.title);
	if (title.startsWith(q)) return SCORE_TITLE_PREFIX;
	if (title.includes(q)) return SCORE_TITLE_PARTIAL;

	if (
		tool.keywords.some((keyword) => normalizeSearchText(keyword).includes(q))
	) {
		return SCORE_KEYWORD;
	}

	const rest = normalizeSearchText(`${tool.category} ${tool.description}`);
	if (rest.includes(q)) return SCORE_CATEGORY_DESCRIPTION;

	return 0;
}

/**
 * クエリに一致するツールを関連度の降順で返す。
 * 同スコアの場合はカタログ定義順を維持する（安定ソート）。
 * クエリが空の場合はカタログ全件をそのまま返す。
 */
export function searchTools(
	query: string,
	catalog: readonly ToolCatalogItem[] = toolCatalog,
): readonly ToolCatalogItem[] {
	const trimmed = query.trim();
	if (!trimmed) return catalog;

	return catalog
		.map((tool, index) => ({
			tool,
			index,
			score: scoreToolMatch(tool, trimmed),
		}))
		.filter((entry) => entry.score > 0)
		.sort((a, b) => b.score - a.score || a.index - b.index)
		.map((entry) => entry.tool);
}
