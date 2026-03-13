import { Search } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

type Tool = {
	id: string;
	name: string;
	description: string;
	href: string;
	icon: string;
	category: string;
};

const TOOLS: Tool[] = [
	{
		id: 'zenkaku-hankaku',
		name: '全角↔半角変換',
		description: 'カタカナ・英数字・記号の全角半角を一括変換',
		href: '/zenkaku-hankaku',
		icon: '🔄',
		category: 'テキスト変換',
	},
	{
		id: 'char-count',
		name: '文字数カウント',
		description: '文字数・バイト数・行数をリアルタイムカウント。Shift-JIS対応',
		href: '/char-count',
		icon: '🔢',
		category: 'テキスト解析',
	},
	{
		id: 'json-formatter',
		name: 'JSON整形',
		description: 'JSONの整形・圧縮・構文チェック',
		href: '/json-formatter',
		icon: '{ }',
		category: '開発ツール',
	},
	{
		id: 'text-diff',
		name: 'テキスト差分比較',
		description: '2つのテキストの違いをハイライト表示',
		href: '/text-diff',
		icon: '📝',
		category: 'テキスト解析',
	},
	{
		id: 'qr-generator',
		name: 'QRコード生成',
		description: 'URLやテキストからQRコードを即座に生成',
		href: '/qr-generator',
		icon: '📱',
		category: '生成ツール',
	},
	{
		id: 'wareki-converter',
		name: '和暦↔西暦変換',
		description: '明治〜令和の和暦と西暦を相互変換。干支・年齢も同時表示',
		href: '/wareki-converter',
		icon: '🎌',
		category: 'ユーティリティ',
	},
	{
		id: 'base64',
		name: 'Base64変換',
		description: 'テキスト・ファイルのBase64エンコード/デコード',
		href: '/base64',
		icon: '🔐',
		category: 'ユーティリティ',
	},
	{
		id: 'regex-tester',
		name: '正規表現テスター',
		description: '正規表現のリアルタイムテスト・マッチ確認・置換',
		href: '/regex-tester',
		icon: '✨',
		category: '開発ツール',
	},
	{
		id: 'sql-formatter',
		name: 'SQL整形・フォーマッター',
		description: 'SQLの整形・圧縮。MySQL/PostgreSQL等の方言対応',
		href: '/sql-formatter',
		icon: '💾',
		category: '開発ツール',
	},
	{
		id: 'dummy-data',
		name: 'ダミーデータ生成',
		description: '日本語の氏名・電話番号等のダミーデータを一括生成',
		href: '/dummy-data',
		icon: '🎲',
		category: '生成ツール',
	},
	{
		id: 'masking',
		name: '個人情報マスキング',
		description: 'メール・電話番号・カード番号等を自動検出してマスキング',
		href: '/masking',
		icon: '🛡️',
		category: 'データ処理',
	},
	{
		id: 'csv-editor',
		name: 'CSVビューア/エディタ',
		description: 'CSV/TSVをテーブル形式で閲覧・編集・加工',
		href: '/csv-editor',
		icon: '📊',
		category: 'データ処理',
	},
	{
		id: 'unicode-converter',
		name: 'ユニコード変換',
		description: 'テキストとユニコードエスケープシーケンスを相互変換',
		href: '/unicode-converter',
		icon: '🔣',
		category: 'テキスト変換',
	},
	{
		id: 'csv-fixer',
		name: 'CSV文字化け修復',
		description:
			'CSVのShift_JIS文字化けをブラウザで即座に修復。自動検出・BOM付与対応。',
		href: '/csv-fixer',
		icon: '📝',
		category: 'データ処理',
	},
	{
		id: 'phone-formatter',
		name: '電話番号フォーマッタ',
		description:
			'日本の電話番号をE.164・国際表記・国内表記に即変換。CSV一括変換対応。',
		href: '/phone-formatter',
		icon: '📞',
		category: 'データ処理',
	},
];

export default function SearchModal() {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [activeIndex, setActiveIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	const filteredTools = query
		? TOOLS.filter((tool) =>
				(tool.name + tool.description + tool.category)
					.toLowerCase()
					.includes(query.toLowerCase()),
			)
		: TOOLS;

	// Search trigger & Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				setIsOpen((prev) => !prev);
			}
			if (e.key === 'Escape' && isOpen) {
				e.preventDefault();
				setIsOpen(false);
			}
		};

		const handleOpenSearch = () => setIsOpen(true);

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('open-search', handleOpenSearch);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('open-search', handleOpenSearch);
		};
	}, [isOpen]);

	// Reset state and focus input when opened
	useEffect(() => {
		if (isOpen) {
			setQuery('');
			setActiveIndex(0);
			setTimeout(() => {
				inputRef.current?.focus();
			}, 0);
		}
	}, [isOpen]);

	// Handle keyboard navigation within the modal
	useEffect(() => {
		if (!isOpen) return;

		const handleModalKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				setActiveIndex((prev) => (prev + 1) % filteredTools.length);
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				setActiveIndex(
					(prev) => (prev - 1 + filteredTools.length) % filteredTools.length,
				);
			} else if (e.key === 'Enter' && filteredTools.length > 0) {
				e.preventDefault();
				window.location.href = filteredTools[activeIndex]?.href || '/';
			}
		};

		window.addEventListener('keydown', handleModalKeyDown);
		return () => window.removeEventListener('keydown', handleModalKeyDown);
	}, [isOpen, filteredTools, activeIndex]);

	// Handle background click
	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			setIsOpen(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-background/80 backdrop-blur-sm"
			onClick={handleBackdropClick}
		>
			<div className="relative w-full max-w-xl mx-4 overflow-hidden bg-card border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
				<div className="flex items-center px-4 py-3 border-b border-border">
					<Search className="w-5 h-5 text-muted-foreground mr-3" />
					<input
						ref={inputRef}
						className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
						placeholder="ツールを検索... (Enterで移動)"
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							setActiveIndex(0);
						}}
					/>
					<kbd className="hidden sm:inline-block rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground font-mono">
						ESC
					</kbd>
				</div>
				<div className="max-h-[60vh] overflow-y-auto p-2">
					{filteredTools.length === 0 ? (
						<div className="p-4 text-center text-sm text-muted-foreground">
							一致するツールが見つかりません。
						</div>
					) : (
						<div className="flex flex-col gap-1">
							{filteredTools.map((tool, index) => (
								<a
									key={tool.id}
									href={tool.href}
									className={`flex flex-col gap-1 px-4 py-3 rounded-lg transition-colors ${
										index === activeIndex
											? 'bg-primary/10 text-foreground'
											: 'hover:bg-muted text-muted-foreground hover:text-foreground'
									}`}
									onMouseEnter={() => setActiveIndex(index)}
									onClick={() => setIsOpen(false)}
								>
									<div className="flex items-center gap-3">
										<span
											className="text-xl"
											aria-hidden="true"
											dangerouslySetInnerHTML={{ __html: tool.icon }}
										></span>
										<div className="flex flex-col">
											<span
												className={`font-medium ${index === activeIndex ? 'text-primary' : 'text-foreground'}`}
											>
												{tool.name}
											</span>
											<span className="text-xs opacity-80">
												{tool.description}
											</span>
										</div>
									</div>
								</a>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
