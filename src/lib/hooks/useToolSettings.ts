import { useEffect, useState } from 'react';

/**
 * ツール固有の設定値を localStorage および URL クエリパラメータと同期するためのカスタムフック。
 * 入力テキストなどの機密データではなく、設定値（数値やトグル状態）のみを対象とする。
 *
 * @param slug ツールの識別子 (例: 'json-formatter')
 * @param defaultSettings 初期設定オブジェクト
 */
// biome-ignore lint/suspicious/noExplicitAny: settings can contain any basic value types
export function useToolSettings<T extends Record<string, any>>(
	slug: string,
	defaultSettings: T,
) {
	const [settings, setSettings] = useState<T>(() => {
		if (typeof window === 'undefined') {
			return defaultSettings;
		}

		// 1. URL クエリパラメータから復元を試みる
		const params = new URLSearchParams(window.location.search);
		const settingsParam = params.get('settings');
		if (settingsParam) {
			try {
				// Base64 デコード (Unicode対応)
				const decoded = decodeURIComponent(escape(atob(settingsParam)));
				const parsed = JSON.parse(decoded);
				// デフォルト値をマージして不足プロパティを補完
				return { ...defaultSettings, ...parsed };
			} catch (e) {
				console.error('Failed to restore settings from URL:', e);
			}
		}

		// 2. localStorage から復元を試みる
		try {
			const stored = localStorage.getItem(`tool_settings_${slug}`);
			if (stored) {
				const parsed = JSON.parse(stored);
				return { ...defaultSettings, ...parsed };
			}
		} catch (e) {
			console.error('Failed to restore settings from localStorage:', e);
		}

		return defaultSettings;
	});

	// 設定変更時に localStorage に同期する
	useEffect(() => {
		try {
			localStorage.setItem(`tool_settings_${slug}`, JSON.stringify(settings));
		} catch (e) {
			console.error('Failed to save settings to localStorage:', e);
		}
	}, [slug, settings]);

	// 設定更新用のヘルパー (部分更新対応)
	const updateSettings = (updates: Partial<T> | ((prev: T) => T)) => {
		setSettings((prev) => {
			const next =
				typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
			return next;
		});
	};

	// 共有用URLを生成する
	const generateShareUrl = () => {
		const encoded = btoa(
			unescape(encodeURIComponent(JSON.stringify(settings))),
		);
		const url = new URL(window.location.href);
		url.searchParams.set('settings', encoded);
		return url.toString();
	};

	return [settings, updateSettings, generateShareUrl] as const;
}
export default useToolSettings;
