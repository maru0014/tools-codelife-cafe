import Papa from 'papaparse';
import type { PreviewResult } from './types';

export function parsePreview(str: string, maxRows: number = 10): PreviewResult {
	// Estimate total rows by counting line endings in the full string
	// Fast and doesn't require full parse
	const totalRowEstimate = (str.match(/\r\n|\r|\n/g) || []).length + 1;

	const result = Papa.parse(str, {
		preview: maxRows,
		header: false,
		skipEmptyLines: true,
	});

	const parsedRows = result.data as string[][];
	const delimiter = result.meta.delimiter || ',';

	let headers: string[] | null = null;
	let rows: string[][] = [];

	if (parsedRows.length > 0) {
		// Simple heuristic: if the first row contains non-numeric strings that are mostly distinct,
		// it's likely a header. For simplicity in the preview component we can always treat
		// the first row as headers or just pass it as is and let the component decide.
		// The prompt says "If first row looks like headers (non-numeric, distinct values): render as <thead>"
		// We'll just return it all, and let the component handle the heuristic as instructed,
		// or we can do it here. We'll pass `headers` as null for now and let the component decide, or set it here.

		// For now, let's keep it simple: rows are everything. The UI can extract headers if needed.
		// Actually, prompt says: Return: { headers: string[] | null, rows: string[][] ... }

		const firstRow = parsedRows[0];
		const isHeaderLike = firstRow.some(
			(val) => Number.isNaN(Number(val)) && val.trim() !== '',
		);

		if (isHeaderLike) {
			headers = firstRow;
			rows = parsedRows.slice(1);
		} else {
			headers = null;
			rows = parsedRows;
		}
	}

	return {
		headers,
		rows,
		totalRowEstimate,
		delimiter,
	};
}
