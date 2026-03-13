export type NumberType =
	| 'fixed'
	| 'mobile'
	| 'ip_phone'
	| 'toll_free'
	| 'premium'
	| 'pager'
	| 'unknown';

export type FormatResult = {
	e164: string; // +81312345678
	international: string; // +81 3-1234-5678
	national: string; // 03-1234-5678
	rfc3966: string; // tel:+81-3-1234-5678
};

export type ParseResult = {
	valid: boolean;
	input: string; // original input
	cleaned: string; // after preprocessing
	formats: FormatResult | null;
	numberType: NumberType;
	regionName: string | null; // e.g. "東京23区", "大阪"
	countryCode: string; // "JP"
	error?: string; // Japanese error message if invalid
};

export type BulkResult = {
	results: ParseResult[];
	summary: { total: number; valid: number; invalid: number };
};
