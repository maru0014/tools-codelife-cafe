import { useState, useMemo, useCallback, type DragEvent } from 'react';
import { computeDiff, readFileAsText, type DiffMode } from '@/lib/tools/text-diff';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CopyButton from '@/components/common/CopyButton';
import { GitCompareArrows, FileText } from 'lucide-react';

export default function TextDiff() {
	const [textA, setTextA] = useState('');
	const [textB, setTextB] = useState('');
	const [mode, setMode] = useState<DiffMode>('lines');
	const [dragOverA, setDragOverA] = useState(false);
	const [dragOverB, setDragOverB] = useState(false);

	const result = useMemo(() => {
		if (!textA && !textB) return null;
		return computeDiff(textA, textB, mode);
	}, [textA, textB, mode]);

	const handleDrop = useCallback(
		async (e: DragEvent<HTMLTextAreaElement>, target: 'A' | 'B') => {
			e.preventDefault();
			setDragOverA(false);
			setDragOverB(false);
			const file = e.dataTransfer.files[0];
			if (file) {
				try {
					const content = await readFileAsText(file);
					if (target === 'A') setTextA(content);
					else setTextB(content);
				} catch {
					// ignore
				}
			}
		},
		[]
	);

	const diffText = useMemo(() => {
		if (!result) return '';
		return result.parts.map((p) => {
			const prefix = p.type === 'added' ? '+ ' : p.type === 'removed' ? '- ' : '  ';
			return p.value.split('\n').filter(Boolean).map((line) => `${prefix}${line}`).join('\n');
		}).join('\n');
	}, [result]);

	return (
		<div className="space-y-6">
			{/* Mode Toggle */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<GitCompareArrows className="h-5 w-5 text-muted-foreground" />
					<span className="text-sm font-medium">比較モード:</span>
				</div>
				<Tabs value={mode} onValueChange={(v) => setMode(v as DiffMode)}>
					<TabsList>
						<TabsTrigger value="lines">行単位</TabsTrigger>
						<TabsTrigger value="chars">文字単位</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			{/* Two-pane input */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<Label className="text-sm font-medium mb-2 block">テキストA（変更前）</Label>
					<Textarea
						value={textA}
						onChange={(e) => setTextA(e.target.value)}
						onDrop={(e) => handleDrop(e, 'A')}
						onDragOver={(e) => { e.preventDefault(); setDragOverA(true); }}
						onDragLeave={() => setDragOverA(false)}
						placeholder="変更前のテキストをここに入力..."
						className={`min-h-[200px] font-mono-tool rounded-xl focus:ring-2 focus:ring-primary ${dragOverA ? 'border-primary border-dashed bg-primary/5' : ''
							}`}
					/>
					<p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
						<FileText className="h-3 w-3" />
						.txtファイルのドラッグ&ドロップ対応
					</p>
				</div>
				<div>
					<Label className="text-sm font-medium mb-2 block">テキストB（変更後）</Label>
					<Textarea
						value={textB}
						onChange={(e) => setTextB(e.target.value)}
						onDrop={(e) => handleDrop(e, 'B')}
						onDragOver={(e) => { e.preventDefault(); setDragOverB(true); }}
						onDragLeave={() => setDragOverB(false)}
						placeholder="変更後のテキストをここに入力..."
						className={`min-h-[200px] font-mono-tool rounded-xl focus:ring-2 focus:ring-primary ${dragOverB ? 'border-primary border-dashed bg-primary/5' : ''
							}`}
					/>
				</div>
			</div>

			{/* Summary Bar */}
			{result && (
				<Card className="rounded-xl">
					<CardContent className="p-4">
						<div className="flex items-center gap-4 text-sm">
							<span className="font-medium">差分サマリー:</span>
							<span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
								<span className="inline-block h-3 w-3 rounded-sm bg-green-500/20 border border-green-500/50"></span>
								追加: {result.addedCount}{mode === 'lines' ? '行' : '文字'}
							</span>
							<span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
								<span className="inline-block h-3 w-3 rounded-sm bg-red-500/20 border border-red-500/50"></span>
								削除: {result.removedCount}{mode === 'lines' ? '行' : '文字'}
							</span>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Diff Result */}
			{result && (
				<div>
					<div className="flex items-center justify-between mb-2">
						<Label className="text-sm font-medium">差分結果</Label>
						<CopyButton text={diffText} />
					</div>
					<div className="rounded-xl border border-border bg-card overflow-hidden font-mono-tool text-sm">
						{result.parts.map((part, i) => (
							<div
								key={i}
								className={`px-4 py-0.5 whitespace-pre-wrap break-all ${part.type === 'added'
										? 'bg-green-500/10 text-green-700 dark:text-green-300'
										: part.type === 'removed'
											? 'bg-red-500/10 text-red-700 dark:text-red-300'
											: ''
									}`}
							>
								{part.type === 'added' && <span className="select-none opacity-50">+ </span>}
								{part.type === 'removed' && <span className="select-none opacity-50">- </span>}
								{part.type === 'unchanged' && <span className="select-none opacity-30">  </span>}
								{part.value}
							</div>
						))}
					</div>
				</div>
			)}

			{!result && (
				<div className="text-center py-12 text-muted-foreground">
					<GitCompareArrows className="h-12 w-12 mx-auto mb-4 opacity-30" />
					<p>両方のテキストを入力すると差分が表示されます</p>
				</div>
			)}
		</div>
	);
}
