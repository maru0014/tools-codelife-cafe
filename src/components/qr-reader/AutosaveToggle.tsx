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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface AutosaveToggleProps {
	enabled: boolean;
	onChange: (enabled: boolean) => void;
}

/**
 * 自動保存トグル。
 * - 初回ON時: Wi-Fiパスワードや個人情報が平文でlocalStorageに保存される旨の同意ダイアログを表示
 * - ON→OFF時: 保存済みデータを削除する確認ダイアログを表示
 */
export default function AutosaveToggle({
	enabled,
	onChange,
}: AutosaveToggleProps) {
	const [consentOpen, setConsentOpen] = useState(false);
	const [disableConfirmOpen, setDisableConfirmOpen] = useState(false);

	const handleToggle = (checked: boolean) => {
		if (checked) {
			setConsentOpen(true);
			return;
		}
		setDisableConfirmOpen(true);
	};

	return (
		<>
			<div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4">
				<div className="space-y-1">
					<Label
						htmlFor="autosave-switch"
						className="text-sm font-medium cursor-pointer"
					>
						読み取り結果を自動保存
					</Label>
					<p className="text-xs text-muted-foreground leading-relaxed">
						ONにすると、読み取った結果をこの端末のブラウザ（localStorage）に保存し、次回アクセス時に復元できます。
						サーバーへの送信は行われません。
					</p>
				</div>
				<Switch
					id="autosave-switch"
					checked={enabled}
					onCheckedChange={handleToggle}
				/>
			</div>

			{/* 初回ON同意ダイアログ */}
			<Dialog open={consentOpen} onOpenChange={setConsentOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>自動保存を有効にしますか？</DialogTitle>
						<DialogDescription asChild>
							<div className="space-y-2 text-left">
								<p>
									読み取ったQRコードの内容（Wi-FiのパスワードやURL、氏名などの個人情報を含む場合があります）が、
									<strong className="text-foreground">
										暗号化されずに平文のままこの端末のブラウザ（localStorage）に保存
									</strong>
									されます。
								</p>
								<p>
									他人と共有しているパソコンやタブレットなど、共有端末では有効にしないことを推奨します。
								</p>
							</div>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setConsentOpen(false)}>
							キャンセル
						</Button>
						<Button
							onClick={() => {
								setConsentOpen(false);
								onChange(true);
							}}
						>
							同意して有効にする
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* OFF確認ダイアログ */}
			<Dialog open={disableConfirmOpen} onOpenChange={setDisableConfirmOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>自動保存を無効にしますか？</DialogTitle>
						<DialogDescription>
							自動保存を無効にすると、保存済みの読み取り結果は端末から削除されます（この画面に表示中の一覧はそのまま残ります）。
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDisableConfirmOpen(false)}
						>
							キャンセル
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								setDisableConfirmOpen(false);
								onChange(false);
							}}
						>
							無効にして削除する
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
