import { useState } from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

export default function SafetyBadge() {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					className="inline-flex items-center gap-2 rounded-lg border border-safety/30 bg-safety/5 px-3 py-1.5 text-sm font-medium text-safety hover:bg-safety/10 transition-colors cursor-pointer"
					aria-label="セキュリティ情報を表示"
				>
					<span className="relative flex h-2.5 w-2.5">
						<span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-safety opacity-75"></span>
						<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-safety"></span>
					</span>
					<ShieldCheck className="h-4 w-4" />
					<span className="hidden sm:inline">このツールはサーバーと通信しません</span>
					<span className="sm:hidden">ローカル処理</span>
					<Info className="h-3 w-3 opacity-50" />
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-80" align="start">
				<div className="space-y-3">
					<h4 className="font-semibold text-sm flex items-center gap-2">
						<ShieldCheck className="h-4 w-4 text-safety" />
						完全クライアントサイド処理
					</h4>
					<p className="text-sm text-muted-foreground leading-relaxed">
						このツールのすべてのデータ処理はブラウザ内のJavaScriptで完結しています。
						入力されたデータがサーバーに送信されることは一切ありません。
					</p>
					<div className="rounded-md bg-muted p-3 text-xs text-muted-foreground space-y-1">
						<p>✅ ネットワーク通信なし</p>
						<p>✅ データはブラウザ内のみで処理</p>
						<p>✅ ページを閉じるとデータは消去</p>
						<p>✅ ソースコードはGitHubで公開中</p>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
