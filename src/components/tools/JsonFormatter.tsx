import { useState, useCallback } from 'react';
import { formatJson, minifyJson, type IndentType } from '@/lib/tools/json-formatter';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import CopyButton from '@/components/common/CopyButton';
import { Wand2, Minimize2, Download, AlertCircle } from 'lucide-react';

function highlightJson(json: string) {
	if (!json) return '';
	const jsonStr = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return jsonStr.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
		let cls = 'text-green-600 dark:text-green-400'; // number
		if (/^"/.test(match)) {
			if (/:$/.test(match)) {
				cls = 'text-blue-600 dark:text-blue-400'; // key
			} else {
				cls = 'text-orange-600 dark:text-orange-400'; // string
			}
		} else if (/true|false/.test(match)) {
			cls = 'text-purple-600 dark:text-purple-400'; // boolean
		} else if (/null/.test(match)) {
			cls = 'text-gray-500 dark:text-gray-400'; // null
		}
		return '<span class="' + cls + '">' + match + '</span>';
	});
}

export default function JsonFormatter() {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [indent, setIndent] = useState<IndentType>('2');
	const [error, setError] = useState<string | null>(null);
	const [errorPosition, setErrorPosition] = useState<number | null>(null);

	const errorLine = useState<number | null>(null);
	const currentErrorLine = errorPosition !== null && input
		? input.substring(0, errorPosition).split('\n').length
		: null;

	const handleFormat = useCallback(() => {
		const result = formatJson(input, indent);
		if (result.success) {
			setOutput(result.output);
			setError(null);
			setErrorPosition(null);
		} else {
			setOutput('');
			setError(result.error ?? 'エラーが発生しました');
			setErrorPosition(result.errorPosition ?? null);
		}
	}, [input, indent]);

	const handleMinify = useCallback(() => {
		const result = minifyJson(input);
		if (result.success) {
			setOutput(result.output);
			setError(null);
			setErrorPosition(null);
		} else {
			setOutput('');
			setError(result.error ?? 'エラーが発生しました');
		}
	}, [input]);

	const handleDownload = useCallback(() => {
		if (!output) return;
		const blob = new Blob([output], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'formatted.json';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}, [output]);

	const handleInputChange = useCallback((value: string) => {
		setInput(value);
		setError(null);
		setErrorPosition(null);
		// Auto-format on input change
		if (value.trim()) {
			const result = formatJson(value, indent);
			if (result.success) {
				setOutput(result.output);
				setError(null);
				setErrorPosition(null);
			} else {
				// Don't clear output immediately if they're just typing,
				// but let's show the error state or position if it fails
				setError(result.error ?? 'エラーが発生しました');
				setErrorPosition(result.errorPosition ?? null);
				setOutput('');
			}
		} else {
			setOutput('');
		}
	}, [indent]);

	return (
		<div className="space-y-6">
			{/* Error Banner */}
			{error && (
				<div className="flex items-start gap-2 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
					<AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
					<p>{error} {currentErrorLine && <span className="font-bold">（{currentErrorLine}行目付近）</span>}</p>
				</div>
			)}

			{/* Controls */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="flex items-center gap-2">
					<Label className="text-sm whitespace-nowrap">インデント:</Label>
					<Select value={indent} onValueChange={(v) => setIndent(v as IndentType)}>
						<SelectTrigger className="w-[140px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="2">2スペース</SelectItem>
							<SelectItem value="4">4スペース</SelectItem>
							<SelectItem value="tab">タブ</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex gap-2">
					<Button onClick={handleFormat} size="sm">
						<Wand2 className="h-4 w-4 mr-1" />
						整形
					</Button>
					<Button onClick={handleMinify} variant="outline" size="sm">
						<Minimize2 className="h-4 w-4 mr-1" />
						圧縮
					</Button>
				</div>
			</div>

			{/* Input */}
			<div>
				<Label className="text-sm font-medium mb-2 block">入力JSON</Label>
				<Textarea
					value={input}
					onChange={(e) => handleInputChange(e.target.value)}
					placeholder={'{"name":"太郎","age":30,"city":"東京"}'}
					className="min-h-[200px] font-mono-tool rounded-xl focus:ring-2 focus:ring-primary"
					spellCheck={false}
				/>
			</div>

			{/* Output */}
			<div>
				<div className="flex items-center justify-between mb-2">
					<Label className="text-sm font-medium">出力</Label>
					<div className="flex gap-2">
						<CopyButton text={output} />
						<Button
							variant="outline"
							size="sm"
							onClick={handleDownload}
							disabled={!output}
						>
							<Download className="h-4 w-4 mr-1" />
							.json
						</Button>
					</div>
				</div>
				{output ? (
					<div
						className="min-h-[200px] font-mono-tool text-sm rounded-xl border border-border bg-muted/50 p-3 overflow-auto whitespace-pre-wrap break-all shimmer"
						dangerouslySetInnerHTML={{ __html: highlightJson(output) }}
					/>
				) : (
					<Textarea
						value=""
						readOnly
						disabled={!!error}
						placeholder={error ? "入力JSONにエラーがあります" : "整形結果がここに表示されます..."}
						className={`min-h-[200px] font-mono-tool rounded-xl bg-muted/50`}
						spellCheck={false}
					/>
				)}
			</div>
		</div>
	);
}
