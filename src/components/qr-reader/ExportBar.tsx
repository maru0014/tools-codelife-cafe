import { Download, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface ExportBarProps {
	resultCount: number;
	onExportCsv: () => void;
	onClearAll: () => void;
}

export default function ExportBar({
	resultCount,
	onExportCsv,
	onClearAll,
}: ExportBarProps) {
	const [confirmOpen, setConfirmOpen] = useState(false);
	const disabled = resultCount === 0;

	return (
		<>
			<div className="flex flex-wrap gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={disabled}
					onClick={onExportCsv}
					className="gap-1.5"
				>
					<Download className="h-4 w-4" aria-hidden="true" />
					CSVエクスポート
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={disabled}
					onClick={() => setConfirmOpen(true)}
					className="gap-1.5 text-destructive hover:text-destructive"
				>
					<Trash2 className="h-4 w-4" aria-hidden="true" />
					全クリア
				</Button>
			</div>

			<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>すべての読み取り結果を削除しますか？</DialogTitle>
						<DialogDescription>
							{resultCount}
							件の読み取り結果が一覧・保存データの両方から削除されます。この操作は取り消せません。
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setConfirmOpen(false)}>
							キャンセル
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								setConfirmOpen(false);
								onClearAll();
							}}
						>
							削除する
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
