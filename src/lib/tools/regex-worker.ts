import type { RegexMatch, RegexResult } from './regex-tester';

type WorkerInput = {
	pattern: string;
	flags: string;
	text: string;
	replacement?: string;
};

self.onmessage = (event: MessageEvent<WorkerInput>) => {
	const { pattern, flags, text, replacement } = event.data;

	try {
		const regex = new RegExp(pattern, flags);
		const matches: RegexMatch[] = [];

		if (regex.global) {
			let match: RegExpExecArray | null = regex.exec(text);
			while (match !== null) {
				matches.push({
					value: match[0],
					index: match.index,
					groups: match.slice(1),
				});
				if (match.index === regex.lastIndex) {
					regex.lastIndex++;
				}
				match = regex.exec(text);
			}
		} else {
			const match = regex.exec(text);
			if (match) {
				matches.push({
					value: match[0],
					index: match.index,
					groups: match.slice(1),
				});
			}
		}

		let replacedText: string | undefined;
		if (replacement !== undefined) {
			replacedText = text.replace(regex, replacement);
		}

		const result: RegexResult = { matches, replacedText };
		self.postMessage(result);
	} catch (err: unknown) {
		const result: RegexResult = {
			matches: [],
			error: err instanceof Error ? err.message : String(err),
		};
		self.postMessage(result);
	}
};
