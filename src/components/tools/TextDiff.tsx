import { FileText, GitCompareArrows, Trash2 } from 'lucide-react';
import { type DragEvent, useCallback, useMemo, useState } from 'react';
import CopyButton from '@/components/common/CopyButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
	computeDiff,
	type DiffMode,
	readFileAsText,
} from '@/lib/tools/text-diff';

export default function TextDiff() {
	const [textA, setTextA] = useState('');
	const [textB, setTextB] = useState('');
	const [mode, setMode] = useState<DiffMode>('lines');
	const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
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
		[],
	);

	const diffText = useMemo(() => {
		if (!result) return '';
		return result.parts
			.map((p) => {
				const prefix =
					p.type === 'added' ? '+ ' : p.type === 'removed' ? '- ' : '  ';
				return p.value
					.split('\n')
					.filter(Boolean)
					.map((line) => `${prefix}${line}`)
					.join('\n');
			})
			.join('\n');
	}, [result]);

	return (
		<div className="space-y-6">
			{/* Mode Toggle */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<GitCompareArrows className="h-5 w-5 text-muted-foreground" />
					<span className="text-sm font-medium">比較モード:</span>
				</div>
				<div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto">
					<Tabs value={mode} onValueChange={(v) => setMode(v as DiffMode)}>
						<TabsList>
							<TabsTrigger value="lines">行単位</TabsTrigger>
							<TabsTrigger value="chars">文字単位</TabsTrigger>
						</TabsList>
					</Tabs>
					<Tabs
						value={viewMode}
						onValueChange={(v) => setViewMode(v as 'unified' | 'split')}
						className="hidden sm:block"
					>
						<TabsList>
							<TabsTrigger value="unified">Unified</TabsTrigger>
							<TabsTrigger value="split">Split</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			{/* Two-pane input */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<div className="flex items-center justify-between mb-2">
						<Label className="text-sm font-medium">テキストA（変更前）</Label>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setTextA('')}
							disabled={!textA}
							className="h-6 px-2 text-xs"
						>
							<Trash2 className="h-3 w-3 mr-1" />
							クリア
						</Button>
					</div>
					<Textarea
						value={textA}
						onChange={(e) => setTextA(e.target.value)}
						onDrop={(e) => handleDrop(e, 'A')}
						onDragOver={(e) => {
							e.preventDefault();
							setDragOverA(true);
						}}
						onDragLeave={() => setDragOverA(false)}
						placeholder="変更前のテキストをここに入力..."
						className={`min-h-[200px] font-mono-tool rounded-xl focus:ring-2 focus:ring-primary ${
							dragOverA ? 'border-primary border-dashed bg-primary/5' : ''
						}`}
					/>
					<p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
						<FileText className="h-3 w-3" />
						.txtファイルのドラッグ&ドロップ対応
					</p>
				</div>
				<div>
					<div className="flex items-center justify-between mb-2">
						<Label className="text-sm font-medium">テキストB（変更後）</Label>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setTextB('')}
							disabled={!textB}
							className="h-6 px-2 text-xs"
						>
							<Trash2 className="h-3 w-3 mr-1" />
							クリア
						</Button>
					</div>
					<Textarea
						value={textB}
						onChange={(e) => setTextB(e.target.value)}
						onDrop={(e) => handleDrop(e, 'B')}
						onDragOver={(e) => {
							e.preventDefault();
							setDragOverB(true);
						}}
						onDragLeave={() => setDragOverB(false)}
						placeholder="変更後のテキストをここに入力..."
						className={`min-h-[200px] font-mono-tool rounded-xl focus:ring-2 focus:ring-primary ${
							dragOverB ? 'border-primary border-dashed bg-primary/5' : ''
						}`}
					/>
				</div>
			</div>

			{/* Summary Bar */}
			{result && (
				<Card className="rounded-xl">
					<CardContent className="p-4">
						<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
							<span className="font-medium">差分統計:</span>
							<div className="flex items-center gap-4">
								<span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
									<span className="inline-block h-3 w-3 rounded-sm bg-green-500/20 border border-green-500/50"></span>
									追加: {result.addedLines}行 ({result.addedChars}文字)
								</span>
								<span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
									<span className="inline-block h-3 w-3 rounded-sm bg-red-500/20 border border-red-500/50"></span>
									削除: {result.removedLines}行 ({result.removedChars}文字)
								</span>
							</div>
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
					{viewMode === 'split' ? (
						<div className="grid grid-cols-2 gap-4">
							<div className="rounded-xl border border-border bg-card overflow-x-auto whitespace-pre font-mono-tool text-sm min-h-[100px]">
								<div className="bg-muted px-4 py-1.5 border-b border-border text-xs font-bold text-muted-foreground sticky top-0">
									テキストA（変更前）
								</div>
								<div className="w-full min-w-max">
									{result.parts
										.filter((p) => p.type !== 'added')
										.map((part, i) => (
											<div
												key={`l-${i}`}
												className={`px-4 py-0.5 min-w-max ${part.type === 'removed' ? 'bg-red-500/10 text-red-700 dark:text-red-300' : ''}`}
											>
												{part.type === 'removed' && (
													<span className="select-none opacity-50">- </span>
												)}
												{part.type === 'unchanged' && (
													<span className="select-none opacity-30"> </span>
												)}
												{part.value}
											</div>
										))}
								</div>
							</div>
							<div className="rounded-xl border border-border bg-card overflow-x-auto whitespace-pre font-mono-tool text-sm min-h-[100px]">
								<div className="bg-muted px-4 py-1.5 border-b border-border text-xs font-bold text-muted-foreground sticky top-0">
									テキストB（変更後）
								</div>
								<div className="w-full min-w-max">
									{result.parts
										.filter((p) => p.type !== 'removed')
										.map((part, i) => (
											<div
												key={`r-${i}`}
												className={`px-4 py-0.5 min-w-max ${part.type === 'added' ? 'bg-green-500/10 text-green-700 dark:text-green-300' : ''}`}
											>
												{part.type === 'added' && (
													<span className="select-none opacity-50">+ </span>
												)}
												{part.type === 'unchanged' && (
													<span className="select-none opacity-30"> </span>
												)}
												{part.value}
											</div>
										))}
								</div>
							</div>
						</div>
					) : (
						<div className="rounded-xl border border-border bg-card overflow-hidden font-mono-tool text-sm">
							{result.parts.map((part, i) => (
								<div
									key={i}
									className={`px-4 py-0.5 whitespace-pre-wrap break-all ${
										part.type === 'added'
											? 'bg-green-500/10 text-green-700 dark:text-green-300'
											: part.type === 'removed'
												? 'bg-red-500/10 text-red-700 dark:text-red-300'
												: ''
									}`}
								>
									{part.type === 'added' && (
										<span className="select-none opacity-50">+ </span>
									)}
									{part.type === 'removed' && (
										<span className="select-none opacity-50">- </span>
									)}
									{part.type === 'unchanged' && (
										<span className="select-none opacity-30"> </span>
									)}
									{part.value}
								</div>
							))}
						</div>
					)}
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
