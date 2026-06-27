export type WebMcpTool = {
	name: string;
	description: string;
	inputSchema: Record<string, unknown>;
	execute: (input: unknown) => Promise<unknown> | unknown;
};

type MaybeDisposable = undefined | { dispose?: () => void } | (() => void);

export function provideTools(tools: WebMcpTool[]): () => void {
	if (typeof navigator === 'undefined') return () => {};

	const ctx = navigator.modelContext;
	if (!ctx || typeof ctx.provideContext !== 'function') return () => {};

	let disposable: MaybeDisposable;

	try {
		disposable = ctx.provideContext({ tools }) as MaybeDisposable;
	} catch {
		return () => {};
	}

	return () => {
		try {
			if (typeof disposable === 'function') {
				disposable();
				return;
			}

			if (disposable && typeof disposable.dispose === 'function') {
				disposable.dispose();
				return;
			}

			ctx.clearContext?.();
		} catch {
			/* no-op */
		}
	};
}
