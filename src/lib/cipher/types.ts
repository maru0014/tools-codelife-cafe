export type CipherAlgorithm = 'caesar' | 'rot13' | 'reverse' | 'morse';
export type CipherDirection = 'encode' | 'decode';

export type CaesarOptions = {
	shift: number;
	direction: CipherDirection;
};

export type MorseOptions = {
	direction: CipherDirection;
	separator?: string;
};

export type CipherResult = {
	output: string;
	algorithm: CipherAlgorithm;
	inputLength: number;
	outputLength: number;
};

export type BruteForceResult = {
	shift: number;
	output: string;
};
