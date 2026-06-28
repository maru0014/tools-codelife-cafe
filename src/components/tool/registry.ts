import CsvFixerTool from '../tools/CsvFixer';

/**
 * ツールスラッグからツール本体コンポーネント（React Island）への静的マッピングレジストリ
 */
export const toolRegistry = {
	'csv-mojibake': CsvFixerTool,
	'csv-fixer': CsvFixerTool,
} as const;

export type ToolSlug = keyof typeof toolRegistry;

/**
 * スラッグに対応するツールコンポーネントを取得する
 * @param slug ツールスラッグ
 * @returns Reactコンポーネント、未登録の場合はnull
 */
export function getToolComponent(slug: string) {
	return toolRegistry[slug as ToolSlug] || null;
}
