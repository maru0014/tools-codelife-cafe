/**
 * 変換結果カードコンポーネント
 * 有効な電話番号の全フォーマットを表示する
 */
import { Globe, Hash, Phone, Smartphone } from 'lucide-react';
import CopyButton from '@/components/common/CopyButton';
import { getNumberTypeLabel } from '@/lib/phone-formatter/classify';
import type { ParseResult } from '@/lib/phone-formatter/types';

interface ResultCardProps {
	result: ParseResult | null;
}

const numberTypeIcons = {
	fixed: <Phone className="h-4 w-4" />,
	mobile: <Smartphone className="h-4 w-4" />,
	ip_phone: <Globe className="h-4 w-4" />,
	toll_free: <Hash className="h-4 w-4" />,
	premium: <Hash className="h-4 w-4" />,
	pager: <Hash className="h-4 w-4" />,
	unknown: <Phone className="h-4 w-4" />,
};

export default function ResultCard({ result }: ResultCardProps) {
	if (!result?.valid || !result.formats) return null;

	const { formats, numberType, regionName } = result;

	const typeLabel = getNumberTypeLabel(numberType);
	const typeWithRegion = regionName
		? `${typeLabel}（${regionName}）`
		: typeLabel;

	const formatRows = [
		{ label: 'E.164', value: formats.e164, ariaLabel: 'E.164形式をコピー' },
		{
			label: '国際表記',
			value: formats.international,
			ariaLabel: '国際表記をコピー',
		},
		{
			label: '国内表記',
			value: formats.national,
			ariaLabel: '国内表記をコピー',
		},
		{
			label: 'RFC 3966',
			value: formats.rfc3966,
			ariaLabel: 'RFC3966形式をコピー',
		},
	];

	return (
		<div
			className="mt-4 rounded-xl border border-border bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
			aria-live="polite"
			aria-label="変換結果"
		>
			{/* 番号種別バッジ */}
			<div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
				<span className="text-primary">{numberTypeIcons[numberType]}</span>
				<span className="text-sm font-medium">{typeWithRegion}</span>
			</div>

			{/* フォーマット一覧 */}
			<div className="divide-y divide-border">
				{formatRows.map((row) => (
					<div
						key={row.label}
						className="flex items-center justify-between px-4 py-3 gap-4 group hover:bg-muted/20 transition-colors"
					>
						<div className="min-w-0 flex-1">
							<p className="text-xs text-muted-foreground mb-0.5">
								{row.label}
							</p>
							<p
								className="font-mono text-sm font-medium truncate"
								title={row.value}
							>
								{row.value}
							</p>
						</div>
						<CopyButton
							text={row.value}
							label="コピー"
							aria-label={row.ariaLabel}
							variant="ghost"
							size="sm"
							className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
						/>
					</div>
				))}
			</div>
		</div>
	);
}
