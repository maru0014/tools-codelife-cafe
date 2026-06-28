import { useCallback, useEffect, useRef } from 'react';
import { track } from '../analytics';

export function useToolAnalytics(toolSlug: string) {
	const hasEngagedRef = useRef(false);

	useEffect(() => {
		if (!toolSlug || hasEngagedRef.current) return;
		hasEngagedRef.current = true;
		track('tool_engage', { tool: toolSlug });
	}, [toolSlug]);

	const trackRun = useCallback(() => {
		if (!toolSlug) return;
		track('tool_run', { tool: toolSlug });
	}, [toolSlug]);

	const trackSharedUrlOpen = useCallback(() => {
		if (!toolSlug) return;
		track('shared_url_open', { tool: toolSlug });
	}, [toolSlug]);

	return {
		trackRun,
		trackSharedUrlOpen,
	};
}
