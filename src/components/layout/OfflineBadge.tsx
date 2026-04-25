import { Download, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

type BadgeState = 'offline' | 'installed' | 'uninstalled';

function getBadgeState(): BadgeState {
	if (typeof window === 'undefined') return 'uninstalled';
	if (!navigator.onLine) return 'offline';
	if (window.matchMedia('(display-mode: standalone)').matches) return 'installed';
	return 'uninstalled';
}

export default function OfflineBadge() {
	const [state, setState] = useState<BadgeState>('uninstalled');

	useEffect(() => {
		setState(getBadgeState());

		const handleOnline = () => setState(getBadgeState());
		const handleOffline = () => setState('offline');

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	if (state === 'offline') {
		return (
			<span className="hidden lg:flex items-center gap-1.5 text-xs text-amber-400 font-medium">
				<WifiOff className="h-3.5 w-3.5" />
				オフラインモードで動作中
			</span>
		);
	}

	if (state === 'installed') {
		return (
			<span className="hidden lg:flex items-center gap-1.5 text-xs text-safety font-medium">
				<span className="inline-block h-2 w-2 rounded-full bg-safety pulse-dot" />
				オフライン対応済み
			</span>
		);
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground font-medium hover:text-foreground transition-colors cursor-pointer"
					aria-label="PWAインストール手順を表示"
				>
					<Download className="h-3.5 w-3.5" />
					オフラインモードを有効化
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-80" align="end">
				<div className="space-y-3">
					<h4 className="font-semibold text-sm">
						📲 PWAをインストールしてオフライン対応
					</h4>
					<p className="text-sm text-muted-foreground leading-relaxed">
						PWAとしてインストールすると、ネット接続なしでもツールを使えます。
					</p>
					<div className="rounded-md bg-muted p-3 text-xs text-muted-foreground space-y-1.5">
						<p>🍎 <strong>iOS/Safari:</strong> 共有 → ホーム画面に追加</p>
						<p>🤖 <strong>Android/Chrome:</strong> メニュー → アプリをインストール</p>
						<p>🖥️ <strong>PC/Chrome:</strong> アドレスバー右の ＋ をクリック</p>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
