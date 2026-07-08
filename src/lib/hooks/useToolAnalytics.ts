import { useCallback, useEffect, useRef } from 'react';
import { track } from '../analytics';

// 「初回操作」とみなすユーザー操作イベント。
// マウント（＝擬似PV）ではなく、実際にツールへ触れた最初の操作で tool_engage を発火させる。
const ENGAGE_EVENTS = ['pointerdown', 'keydown'] as const;

export function useToolAnalytics(toolSlug: string) {
	const hasEngagedRef = useRef(false);

	// tool_engage は「個別ツールで初めて入力・操作があった時」に発火する（docs/analytics.md 準拠）。
	// マウント時の無条件発火はやめ、最初のポインタ/キー操作を捕捉して 1 回だけ送信する。
	useEffect(() => {
		if (!toolSlug || hasEngagedRef.current) return;

		const handleFirstInteraction = () => {
			if (hasEngagedRef.current) return;
			hasEngagedRef.current = true;
			track('tool_engage', { tool: toolSlug });
			for (const eventName of ENGAGE_EVENTS) {
				document.removeEventListener(eventName, handleFirstInteraction, true);
			}
		};

		for (const eventName of ENGAGE_EVENTS) {
			document.addEventListener(eventName, handleFirstInteraction, true);
		}

		return () => {
			for (const eventName of ENGAGE_EVENTS) {
				document.removeEventListener(eventName, handleFirstInteraction, true);
			}
		};
	}, [toolSlug]);

	const trackRun = useCallback(() => {
		if (!toolSlug) return;
		// 実行は明確なエンゲージメントなので、初回操作を捕捉できていなくても保険として engage を確定させる。
		if (!hasEngagedRef.current) {
			hasEngagedRef.current = true;
			track('tool_engage', { tool: toolSlug });
		}
		track('tool_run', { tool: toolSlug });
	}, [toolSlug]);

	const trackSharedUrlOpen = useCallback(() => {
		if (!toolSlug) return;
		track('shared_url_open', { tool: toolSlug });
	}, [toolSlug]);

	const trackSettingsRestore = useCallback(
		(source: 'localStorage' | 'url') => {
			if (!toolSlug) return;
			track('settings_restore', { tool: toolSlug, source });
		},
		[toolSlug],
	);

	return {
		trackRun,
		trackSharedUrlOpen,
		trackSettingsRestore,
	};
}
