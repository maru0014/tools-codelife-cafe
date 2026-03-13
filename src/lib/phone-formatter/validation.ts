/**
 * CSVファイルバリデーションモジュール
 */

type ValidationResult = {
	valid: boolean;
	error?: string;
	maxSize: number;
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['.csv', '.tsv', '.txt'];

/**
 * アップロードされたCSVファイルのバリデーションを行う
 *
 * @param file - バリデーション対象のFileオブジェクト
 * @returns ValidationResult
 */
export function validateCsvFile(file: File): ValidationResult {
	// 拡張子チェック
	const name = file.name.toLowerCase();
	const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
		name.endsWith(ext),
	);

	if (!hasValidExtension) {
		return {
			valid: false,
			error: 'CSV、TSV、TXTファイルのみ対応しています。',
			maxSize: MAX_FILE_SIZE_BYTES,
		};
	}

	// ファイルサイズチェック
	if (file.size > MAX_FILE_SIZE_BYTES) {
		return {
			valid: false,
			error: `ファイルが大きすぎます（最大5MB）。現在のサイズ: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
			maxSize: MAX_FILE_SIZE_BYTES,
		};
	}

	return {
		valid: true,
		maxSize: MAX_FILE_SIZE_BYTES,
	};
}
