type WebMcpToolDefinition = {
	name: string;
	description: string;
	inputSchema: Record<string, unknown>;
	execute: (input: unknown) => Promise<unknown> | unknown;
};

interface ModelContext {
	provideContext(args: { tools: WebMcpToolDefinition[] }): unknown;
	clearContext?: () => void;
}

interface Navigator {
	modelContext?: ModelContext;
}
