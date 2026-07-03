import { Info } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AutosaveToggle from '@/components/qr-reader/AutosaveToggle';
import CameraScanner from '@/components/qr-reader/CameraScanner';
import ExportBar from '@/components/qr-reader/ExportBar';
import ImageUploader from '@/components/qr-reader/ImageUploader';
import ModeTabs, { type ScanMode } from '@/components/qr-reader/ModeTabs';
import ResultsList from '@/components/qr-reader/ResultsList';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	addResult,
	buildCsv,
	clearResults,
	downloadCsv,
	loadAutosaveSetting,
	loadResults,
	type ScanResult,
	saveAutosaveSetting,
	saveResults,
	terminateWorker,
} from '@/lib/tools/qr-reader';

export default function QrReader() {
	const [mode, setMode] = useState<ScanMode>('camera');
	const [results, setResults] = useState<ScanResult[]>([]);
	const [autosave, setAutosave] = useState(false);
	const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
	const pendingRestoreRef = useRef<ScanResult[] | null>(null);

	// --- 初回マウント: autosave 設定を読み込み、有効かつ残存データがあれば復元確認 ---
	useEffect(() => {
		const savedAutosave = loadAutosaveSetting();
		setAutosave(savedAutosave);
		if (savedAutosave) {
			const stored = loadResults();
			if (stored && stored.length > 0) {
				pendingRestoreRef.current = stored;
				setRestoreDialogOpen(true);
			}
		}
	}, []);

	// --- Worker の完全終了（ページ離脱・アンマウント時） ---
	useEffect(() => {
		return () => terminateWorker();
	}, []);

	const handleAddValue = (rawValue: string, source: ScanResult['source']) => {
		setResults((prev) => {
			const next = addResult(prev, rawValue, source);
			if (autosave) saveResults(next);
			return next;
		});
	};

	const handleCameraDetected = (value: string) => {
		handleAddValue(value, 'camera');
	};

	const handleImageDecoded = (fileName: string, values: string[]) => {
		for (const value of values) {
			handleAddValue(value, { image: fileName });
		}
	};

	const handleAutosaveChange = (enabled: boolean) => {
		setAutosave(enabled);
		saveAutosaveSetting(enabled);
		if (enabled) {
			saveResults(results);
		} else {
			clearResults();
		}
	};

	const handleExportCsv = () => {
		const blob = buildCsv(results);
		downloadCsv(blob);
	};

	const handleClearAll = () => {
		setResults([]);
		clearResults();
	};

	const handleConfirmRestore = () => {
		if (pendingRestoreRef.current) {
			setResults(pendingRestoreRef.current);
		}
		pendingRestoreRef.current = null;
		setRestoreDialogOpen(false);
	};

	const handleDismissRestore = () => {
		pendingRestoreRef.current = null;
		clearResults();
		setRestoreDialogOpen(false);
	};

	return (
		<div className="space-y-6">
			{/* プライバシー通知 */}
			<div className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
				<Info className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
				<div className="space-y-1">
					<p>
						ℹ️
						このツールは完全にブラウザ上で動作します。カメラ映像や画像はサーバーに送信されません。
					</p>
					<p>
						自動保存をONにすると、読み取り結果がこの端末のブラウザ内に平文で保存されます。共有端末では注意してください。
					</p>
				</div>
			</div>

			<ModeTabs mode={mode} onModeChange={setMode} />

			{mode === 'camera' ? (
				<CameraScanner
					key="camera"
					onDetected={handleCameraDetected}
					onSwitchToImageMode={() => setMode('image')}
				/>
			) : (
				<ImageUploader onDecoded={handleImageDecoded} />
			)}

			<AutosaveToggle enabled={autosave} onChange={handleAutosaveChange} />

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-semibold">
						読み取り結果（{results.length}件）
					</h2>
					<ExportBar
						resultCount={results.length}
						onExportCsv={handleExportCsv}
						onClearAll={handleClearAll}
					/>
				</div>
				<ResultsList results={results} />
			</div>

			{/* 自動保存済みデータの復元確認 */}
			<Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>前回の読み取り結果を復元しますか？</DialogTitle>
						<DialogDescription>
							自動保存された読み取り結果がこの端末に残っています。復元すると一覧に表示されます。
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={handleDismissRestore}>
							復元せず削除する
						</Button>
						<Button onClick={handleConfirmRestore}>復元する</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
