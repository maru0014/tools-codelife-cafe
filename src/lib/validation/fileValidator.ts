export interface ValidationResult {
	valid: boolean;
	error?: 'INVALID_EXTENSION' | 'FILE_TOO_LARGE' | 'EMPTY_FILE';
	maxSize: number;
}

export function getMaxFileSize(): number {
	if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
		// navigator.deviceMemory gives memory in GB
		const memory = (navigator as any).deviceMemory || 4;

		if (memory < 4) {
			// Mobile (< 4GB): clamp to deviceMemory * 5 MB, min 10MB, max 20MB
			return Math.min(Math.max(memory * 5, 10), 20) * 1024 * 1024;
		}
	}

	// Desktop (no navigator.deviceMemory or >= 4GB): 50MB
	return 50 * 1024 * 1024;
}

export function validateFile(file: File): ValidationResult {
	const maxSize = getMaxFileSize();

	if (file.size === 0) {
		return { valid: false, error: 'EMPTY_FILE', maxSize };
	}

	if (file.size > maxSize) {
		return { valid: false, error: 'FILE_TOO_LARGE', maxSize };
	}

	const validExtensions = ['.csv', '.tsv', '.txt'];
	const fileName = file.name.toLowerCase();
	const hasValidExtension = validExtensions.some((ext) =>
		fileName.endsWith(ext),
	);

	if (!hasValidExtension) {
		return { valid: false, error: 'INVALID_EXTENSION', maxSize };
	}

	return { valid: true, maxSize };
}
