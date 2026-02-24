import { useState, useMemo, useEffect, useRef } from 'react';
import {
	testRegex,
	COMMON_PATTERNS,
	type RegexMatch
} from '@/lib/tools/regex-tester';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import CopyButton from '@/components/common/CopyButton';
import { Trash2, XCircle } from 'lucide-react';

export default function RegexTester() {
	const [pattern, setPattern] = useState('\\d{3}-\\d{4}');
	const [flags, setFlags] = useState('g');
	const [text, setText] = useState('郵便番号: 100-0001 と 530-0001');

	const [showReplace, setShowReplace] = useState(false);
	const [replacement, setReplacement] = useState('');

	// Auto-sync flags
	const toggleFlag = (flag: string) => {
		setFlags(prev => prev.includes(flag) ? prev.replace(flag, '') : prev + flag);
	};

	const result = useMemo(() => {
		return testRegex(pattern, flags, text, showReplace ? replacement : undefined);
	}, [pattern, flags, text, showReplace, replacement]);

	// Handle synchronized scrolling for highlight overlay
	const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
		const overlay = document.getElementById('highlight-overlay');
		if (overlay) {
			overlay.scrollTop = e.currentTarget.scrollTop;
			overlay.scrollLeft = e.currentTarget.scrollLeft;
		}
	};

	// Generate highlight nodes
	const highlightNodes = useMemo(() => {
		if (result.error || result.matches.length === 0 || !pattern) {
			return <span>{text}</span>;
		}

		const nodes = [];
		let lastIndex = 0;

		// Sort matches by index to render sequentially (just in case)
		const sorted = [...result.matches].sort((a, b) => a.index - b.index);

		for (let i = 0; i < sorted.length; i++) {
			const match = sorted[i];
			if (match.index > lastIndex) {
				nodes.push(<span key={`t-${i}`}>{text.slice(lastIndex, match.index)}</span>);
			}
			nodes.push(
				<mark key={`m-${i}`} className="bg-primary/30 text-transparent rounded-[2px]">
					{match.value}
				</mark>
			);
			lastIndex = match.index + match.value.length;
		}

		if (lastIndex < text.length) {
			nodes.push(<span key="end">{text.slice(lastIndex)}</span>);
		}
		return nodes;
	}, [text, result.matches, result.error, pattern]);


	return (
		<div className="space-y-8">
			{/* Pattern Input Area */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<div className="lg:col-span-3 space-y-4">
					<div>
						<div className="flex justify-between mb-2">
							<Label className="text-sm font-medium">正規表現パターン</Label>
							<Select onValueChange={(val) => {
								const pat = COMMON_PATTERNS.find(p => p.label === val);
								if (pat) {
									setPattern(pat.pattern);
									setFlags(pat.flags);
								}
							}}>
								<SelectTrigger className="w-[200px] h-8 text-xs rounded-xl">
									<SelectValue placeholder="よく使うパターン" />
								</SelectTrigger>
								<SelectContent>
									{COMMON_PATTERNS.map(p => (
										<SelectItem key={p.label} value={p.label}>{p.label}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center gap-2">
							<div className="text-xl font-mono text-muted-foreground">/</div>
							<Input
								value={pattern}
								onChange={(e) => setPattern(e.target.value)}
								className={`font-mono-tool text-base rounded-xl focus:ring-2 focus:ring-primary ${result.error ? 'border-red-500 ring-red-500 focus:ring-red-500' : ''
									}`}
								placeholder="\d{3}-\d{4}"
							/>
							<div className="text-xl font-mono text-muted-foreground">/</div>
							<Input
								value={flags}
								onChange={(e) => setFlags(e.target.value)}
								className="w-24 font-mono-tool text-base rounded-xl focus:ring-2 focus:ring-primary"
								placeholder="gim"
							/>
						</div>
						{result.error && (
							<p className="text-red-500 text-sm mt-2 flex items-center gap-1">
								<XCircle className="h-4 w-4" /> {result.error}
							</p>
						)}
					</div>

					<div className="flex flex-wrap gap-4">
						{Object.entries({
							g: 'Global (全件一致)',
							i: 'Ignore Case (大文字小文字区別なし)',
							m: 'Multiline (複数行)',
							s: 'Dot All (.が改行に一致)',
							u: 'Unicode'
						}).map(([flag, desc]) => (
							<div key={flag} className="flex items-center gap-2">
								<Checkbox
									id={`flag-${flag}`}
									checked={flags.includes(flag)}
									onCheckedChange={() => toggleFlag(flag)}
								/>
								<Label htmlFor={`flag-${flag}`} className="text-sm cursor-pointer whitespace-nowrap">
									<span className="font-mono bg-muted px-1 py-0.5 rounded mr-1">{flag}</span>
									{desc}
								</Label>
							</div>
						))}
					</div>
				</div>

				<div className="lg:col-span-1 border rounded-xl p-4 bg-card flex flex-col items-center justify-center">
					<div className="text-sm text-muted-foreground mb-2">マッチ数</div>
					<div className={`text-4xl font-bold ${result.matches.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
						{result.matches.length}
					</div>
				</div>
			</div>

			<hr />

			{/* Test String Area */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Label className="text-sm font-medium">テスト文字列</Label>
					<Button variant="outline" size="sm" onClick={() => setText('')} disabled={!text}>
						<Trash2 className="h-4 w-4 mr-1" />
						クリア
					</Button>
				</div>

				{/* Highlight Overlay Container */}
				<div className="relative min-h-[160px] rounded-xl border border-input shadow-sm focus-within:ring-2 focus-within:ring-primary bg-background overflow-hidden">
					{/* Highlight Layer */}
					<div
						id="highlight-overlay"
						className="absolute inset-0 pointer-events-none px-3 py-2 text-sm whitespace-pre-wrap break-words font-mono-tool overflow-hidden"
						aria-hidden="true"
					>
						{highlightNodes}
					</div>
					{/* Actual Textarea */}
					<Textarea
						value={text}
						onChange={(e) => setText(e.target.value)}
						onScroll={handleScroll}
						className="absolute inset-0 min-h-0 bg-transparent text-foreground font-mono-tool resize-none border-none ring-0 shadow-none focus-visible:ring-0 rounded-xl"
						spellCheck={false}
					/>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<Label className="text-sm font-medium whitespace-nowrap">置換モード</Label>
				<Switch
					checked={showReplace}
					onCheckedChange={setShowReplace}
				/>
			</div>

			{showReplace && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4">
					<div>
						<Label className="text-sm font-medium mb-2 block">置換文字列</Label>
						<Input
							value={replacement}
							onChange={(e) => setReplacement(e.target.value)}
							placeholder="***-**** または $1 など"
							className="font-mono-tool rounded-xl"
						/>
						<p className="text-xs text-muted-foreground mt-2">
							キャプチャグループは <code>$1</code>, <code>$2</code> などで参照できます。
						</p>
					</div>
					<div>
						<div className="flex items-center justify-between mb-2">
							<Label className="text-sm font-medium">置換結果</Label>
							<CopyButton text={result.replacedText || ''} />
						</div>
						<Textarea
							value={result.replacedText}
							readOnly
							className="min-h-[120px] font-mono-tool rounded-xl bg-muted/50"
						/>
					</div>
				</div>
			)}

			{/* Match Results Panel */}
			{result.matches.length > 0 && (
				<div className="space-y-3 pt-4 border-t">
					<Label className="text-sm font-medium">マッチ詳細</Label>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{result.matches.map((match, i) => (
							<Card key={i} className="rounded-xl overflow-hidden text-sm">
								<div className="bg-muted px-3 py-1.5 border-b flex justify-between items-center text-xs">
									<span className="font-semibold text-muted-foreground">Match #{i + 1}</span>
									<span className="text-muted-foreground">Index: {match.index}</span>
								</div>
								<CardContent className="p-3 bg-card font-mono-tool">
									<div className="break-all font-medium text-foreground">{match.value}</div>

									{match.groups.length > 0 && (
										<div className="mt-3 space-y-1.5 border-t pt-2 border-border/50">
											{match.groups.map((group, gi) => (
												<div key={gi} className="flex gap-2 text-xs items-start">
													<Badge variant="secondary" className="px-1 text-[10px] h-4 leading-4 flex-shrink-0">
														Group {gi + 1}
													</Badge>
													<span className="break-all opacity-80">{group ?? '(undefined)'}</span>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)}

		</div>
	);
}
