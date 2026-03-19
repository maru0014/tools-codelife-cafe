/**
 * URL Encode/Decode options
 */
export type UrlEncodeMode = "component" | "full";

export interface UrlEncodeOptions {
	mode: UrlEncodeMode;
}

/**
 * Encodes a string into a URL-encoded format.
 *
 * @param text The string to encode.
 * @param options Options for encoding, choosing between component (encodeURIComponent) and full URL (encodeURI) modes.
 * @returns The URL-encoded string.
 */
export function encodeUrl(
	text: string,
	options: UrlEncodeOptions = { mode: "component" },
): string {
	if (!text) return "";

	try {
		if (options.mode === "full") {
			return encodeURI(text);
		}
		return encodeURIComponent(text);
	} catch (error) {
		console.error("URL encoding error:", error);
		return text;
	}
}

/**
 * Decodes a URL-encoded string.
 *
 * @param text The URL-encoded string to decode.
 * @param options Options for decoding, choosing between component (decodeURIComponent) and full URL (decodeURI) modes.
 * @returns The decoded string. Returns the original string if decoding fails (e.g., malformed URI).
 */
export function decodeUrl(
	text: string,
	options: UrlEncodeOptions = { mode: "component" },
): string {
	if (!text) return "";

	try {
		// "+" is often used to represent space in query parameters
		// decodeURIComponent doesn't convert "+" to space, so we do it manually if we are in component mode
		// However, standard encodeURIComponent encodes space as "%20", not "+".
		// To be safely handling "+", we replace it with "%20" before decoding.
		const normalizedText =
			options.mode === "component" ? text.replace(/\+/g, "%20") : text;

		if (options.mode === "full") {
			return decodeURI(normalizedText);
		}
		return decodeURIComponent(normalizedText);
	} catch (error) {
		// Return original text if malformed URI component
		console.error("URL decoding error:", error);
		return text;
	}
}
