import { ExternalLink } from 'lucide-react';
import CopyButton from '@/components/common/CopyButton';
import { Badge } from '@/components/ui/badge';
import { isOpenableUrl, type ScanResult } from '@/lib/tools/qr-reader';

interface ResultsListProps {
	results: ScanResult[];
}

const FORMAT_LABEL: Record<ScanResult['format'], string> = {
	url: 'URL',
	vcard: '連絡先',
	wifi: 'Wi-Fi',
	text: 'テキスト',
	other: 'その他',
};

function formatSourceLabel(source: ScanResult['source']): string {
	if (source === 'camera') return 'カメラ';
	return source.image;
}

function formatDateTime(iso: string): string {
	try {
		return new Date(iso).toLocaleString('ja-JP');
	} catch {
		return iso;
	}
}

export default function ResultsList({ results }: ResultsListProps) {
	if (results.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
				読み取った結果はまだありません。
			</div>
		);
	}

	return (
		<ul
			className="space-y-2"
			aria-live="polite"
			aria-label="QRコード読み取り結果一覧"
		>
			{results.map((r) => (
				<li
					key={r.id}
					className="rounded-xl border border-border bg-card p-3 sm:p-4"
				>
					<div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs text-muted-foreground">
						<span>{formatDateTime(r.scannedAt)}</span>
						<Badge variant="secondary" className="text-[11px]">
							{FORMAT_LABEL[r.format]}
						</Badge>
						<span>{formatSourceLabel(r.source)}</span>
						{r.duplicate && (
							<Badge
								variant="outline"
								className="text-[11px] border-amber-500/50 text-amber-600 dark:text-amber-400"
							>
								重複
							</Badge>
						)}
					</div>
					{/* URLも含め常にプレーンテキスト表示（自動リンク化しない） */}
					<p className="break-all text-sm font-mono text-foreground mb-2 whitespace-pre-wrap">
						{r.rawValue}
					</p>
					<div className="flex flex-wrap gap-2">
						<CopyButton text={r.rawValue} label="コピー" />
						{isOpenableUrl(r.rawValue) && (
							<a
								href={r.rawValue}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm shadow-xs hover:bg-accent hover:text-accent-foreground transition-colors"
							>
								<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
								開く
							</a>
						)}
					</div>
				</li>
			))}
		</ul>
	);
}
