import { useState, useMemo, useRef, type UIEvent } from 'react';
import { formatSql, type SqlDialect, type IndentStyle, type SqlFormatOptions } from '@/lib/tools/sql-formatter';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import CopyButton from '@/components/common/CopyButton';
import { Trash2, Download, Code2 } from 'lucide-react';

const SQL_KEYWORDS = [
	'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON',
	'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'INTO', 'VALUES',
	'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'ADD', 'COLUMN',
	'AS', 'DISTINCT', 'COUNT', 'MAX', 'MIN', 'AVG', 'SUM', 'IS', 'NULL', 'NOT', 'IN', 'BETWEEN', 'LIKE'
];

export default function SqlFormatter() {
	const [input, setInput] = useState('');

	const [dialect, setDialect] = useState<SqlDialect>('sql');
	const [indent, setIndent] = useState<IndentStyle>('2spaces');
	const [uppercase, setUppercase] = useState(true);
	const [compress, setCompress] = useState(false);

	const options: SqlFormatOptions = { dialect, indent, uppercase, compress };

	const { output, error } = useMemo(() => formatSql(input, options), [input, options]);

	// Basic syntax highlighter
	const highlightedOutput = useMemo(() => {
		if (!output) return '';
		let html = output
			// Escape HTML
			.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
			// Strings
			.replace(/('.*?')/g, '<span class="text-green-600 dark:text-green-400">$1</span>')
			// Numbers
			.replace(/\b(\d+)\b/g, '<span class="text-blue-600 dark:text-blue-400">$1</span>');

		// Keywords
		const keywordRegex = new RegExp(`\\b(${SQL_KEYWORDS.join('|')})\\b`, 'ig');
		html = html.replace(keywordRegex, '<span class="text-purple-600 dark:text-purple-400 font-bold">$1</span>');

		return html;
	}, [output]);

	// Line numbers setup
	const lineCount = useMemo(() => (input.match(/\n/g) || []).length + 1, [input]);
	const lines = Array.from({ length: Math.max(lineCount, 10) }, (_, i) => i + 1);

	const handleScroll = (e: UIEvent<HTMLTextAreaElement>) => {
		const gutter = document.getElementById('line-numbers');
		if (gutter) {
			gutter.scrollTop = e.currentTarget.scrollTop;
		}
	};

	const handleDownload = () => {
		if (output && !error) {
			const blob = new Blob([output], { type: 'text/sql;charset=utf-8' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'query.sql';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
	};

	return (
		<div className="space-y-6">
			{/* Options Toolbar */}
			<div className="flex flex-wrap items-center gap-4 bg-muted/30 p-4 rounded-xl border">
				<div>
					<Label className="text-xs mb-1 block text-muted-foreground">SQL方言</Label>
					<Select value={dialect} onValueChange={(v) => setDialect(v as SqlDialect)}>
						<SelectTrigger className="w-[140px] h-8 rounded-lg bg-background">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="sql">Standard SQL</SelectItem>
							<SelectItem value="mysql">MySQL</SelectItem>
							<SelectItem value="postgresql">PostgreSQL</SelectItem>
							<SelectItem value="tsql">T-SQL</SelectItem>
							<SelectItem value="plsql">PL/SQL</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{!compress && (
					<div>
						<Label className="text-xs mb-1 block text-muted-foreground">インデント</Label>
						<Select value={indent} onValueChange={(v) => setIndent(v as IndentStyle)}>
							<SelectTrigger className="w-[120px] h-8 rounded-lg bg-background">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="2spaces">2 Spaces</SelectItem>
								<SelectItem value="4spaces">4 Spaces</SelectItem>
								<SelectItem value="tabs">Tabs</SelectItem>
							</SelectContent>
						</Select>
					</div>
				)}

				<div className="flex items-center gap-4 ml-2 mt-4 sm:mt-0">
					<div className="flex items-center gap-2">
						<Switch id="opt-uppercase" checked={uppercase} onCheckedChange={setUppercase} />
						<Label htmlFor="opt-uppercase" className="text-sm cursor-pointer whitespace-nowrap">大文字化</Label>
					</div>

					<div className="flex items-center gap-2">
						<Switch id="opt-compress" checked={compress} onCheckedChange={setCompress} />
						<Label htmlFor="opt-compress" className="text-sm cursor-pointer whitespace-nowrap">圧縮 (1行化)</Label>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Input */}
				<div>
					<div className="flex items-center justify-between mb-2">
						<Label className="text-sm font-medium">整形前SQL</Label>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setInput('')}
							disabled={!input}
							className="h-8 text-muted-foreground hover:text-foreground"
						>
							<Trash2 className="h-4 w-4 mr-1" />
							クリア
						</Button>
					</div>
					<div className="relative rounded-xl border border-input shadow-sm focus-within:ring-2 focus-within:ring-primary bg-background overflow-hidden flex h-[400px]">
						{/* Gutter */}
						<div
							id="line-numbers"
							className="w-12 border-r bg-muted/40 text-right pr-2 py-3 overflow-hidden text-xs text-muted-foreground font-mono-tool select-none"
						>
							{lines.map(num => <div key={num} className="leading-5 h-5">{num}</div>)}
						</div>
						{/* Textarea */}
						<Textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onScroll={handleScroll}
							placeholder="SELECT * FROM users WHERE active = 1"
							spellCheck={false}
							className="flex-1 min-h-0 bg-transparent text-foreground font-mono-tool text-sm leading-5 p-3 resize-none border-none ring-0 shadow-none focus-visible:ring-0 rounded-none whitespace-pre"
						/>
					</div>
				</div>

				{/* Output */}
				<div>
					<div className="flex items-center justify-between mb-2">
						<Label className="text-sm font-medium">
							{error ? <span className="text-red-500">エラー</span> : '整形後SQL'}
						</Label>
						<div className="flex items-center gap-2">
							{output && !error && (
								<Button variant="outline" size="sm" onClick={handleDownload} className="h-8">
									<Download className="h-4 w-4 mr-1" />
									.sql保存
								</Button>
							)}
							<CopyButton text={output} />
						</div>
					</div>
					<div className={`rounded-xl border shadow-sm h-[400px] overflow-auto bg-card relative ${error ? 'border-red-500 border-2' : ''
						} ${output ? 'shimmer' : ''}`}>
						{error ? (
							<div className="p-4 text-red-500 font-medium whitespace-pre-wrap flex items-start gap-2">
								<Code2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
								{error}
							</div>
						) : output ? (
							<pre className="p-4 m-0 font-mono-tool text-sm text-foreground overflow-auto w-full h-full">
								<code dangerouslySetInnerHTML={{ __html: highlightedOutput }} />
							</pre>
						) : (
							<div className="flex h-full items-center justify-center text-muted-foreground p-6 text-center">
								<div>
									<Code2 className="h-10 w-10 mx-auto mb-3 opacity-20" />
									<p className="text-sm">左側（または上）にSQLを入力すると<br />整形されたコードが表示されます</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
