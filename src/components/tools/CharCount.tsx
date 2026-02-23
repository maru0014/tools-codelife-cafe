import { useState, useMemo } from 'react';
import { countChars, getTwitterProgress } from '@/lib/tools/char-count';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

function formatNumber(n: number): string {
	return n.toLocaleString('ja-JP');
}

export default function CharCount() {
	const [text, setText] = useState('');

	const result = useMemo(() => countChars(text), [text]);
	const twitter = useMemo(() => getTwitterProgress(result.charsWithSpaces), [result.charsWithSpaces]);

	const stats = [
		{ label: '文字数（空白含む）', value: formatNumber(result.charsWithSpaces), unit: '文字' },
		{ label: '文字数（空白除く）', value: formatNumber(result.charsWithoutSpaces), unit: '文字' },
		{ label: 'バイト数（UTF-8）', value: formatNumber(result.bytesUtf8), unit: 'bytes' },
		{ label: 'バイト数（Shift-JIS）', value: formatNumber(result.bytesShiftJis), unit: 'bytes' },
		{ label: '行数', value: formatNumber(result.lines), unit: '行' },
		{ label: '原稿用紙（400字）', value: formatNumber(result.manuscriptPages), unit: '枚' },
	];

	return (
		<div className="space-y-6">
			{/* Input Textarea */}
			<div>
				<Label className="text-sm font-medium mb-2 block">入力テキスト</Label>
				<Textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="ここに文章を入力すると、リアルタイムで文字数がカウントされます。"
					className="min-h-[200px] font-mono-tool rounded-xl focus:ring-2 focus:ring-primary"
				/>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
				{stats.map((stat) => (
					<Card key={stat.label} className="rounded-xl">
						<CardContent className="p-4 text-center">
							<p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
							<p className="text-2xl font-bold tabular-nums">{stat.value}</p>
							<p className="text-xs text-muted-foreground">{stat.unit}</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Twitter Character Limit Bar */}
			<Card className="rounded-xl">
				<CardContent className="p-4">
					<div className="flex items-center justify-between mb-2">
						<p className="text-sm font-medium">X（旧Twitter）文字数制限</p>
						<p className={`text-sm font-mono tabular-nums ${twitter.isOver ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
							{twitter.remaining >= 0 ? `残り ${formatNumber(twitter.remaining)} 文字` : `${formatNumber(Math.abs(twitter.remaining))} 文字オーバー`}
						</p>
					</div>
					<div className="h-2 rounded-full bg-muted overflow-hidden">
						<div
							className={`h-full rounded-full transition-all duration-300 ${twitter.isOver ? 'bg-destructive' : twitter.percentage > 80 ? 'bg-yellow-500' : 'bg-primary'
								}`}
							style={{ width: `${Math.min(twitter.percentage, 100)}%` }}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
