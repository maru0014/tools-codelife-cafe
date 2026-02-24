import { useState, useMemo } from 'react';
import { maskText, type MaskTarget, type MaskChar, type MaskStrength } from '@/lib/tools/masking';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CopyButton from '@/components/common/CopyButton';
import { Trash2, Download, ShieldAlert } from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

const TARGET_TYPES: { id: MaskTarget, label: string }[] = [
	{ id: 'email', label: 'メールアドレス' },
	{ id: 'phone', label: '電話番号' },
	{ id: 'zipcode', label: '郵便番号' },
	{ id: 'card', label: 'カード番号' },
	{ id: 'mynumber', label: 'マイナンバー' },
	{ id: 'name', label: '氏名 (簡易)' },
];

export default function Masking() {
	const [text, setText] = useState('');
	const [targets, setTargets] = useState<Set<MaskTarget>>(new Set(['email', 'phone', 'card', 'mynumber']));
	const [maskChar, setMaskChar] = useState<MaskChar>('*');
	const [strength, setStrength] = useState<MaskStrength>('partial');

	const { maskedText, counts } = useMemo(() => {
		if (!text) return { maskedText: '', counts: { email: 0, phone: 0, zipcode: 0, card: 0, mynumber: 0, name: 0 } };
		return maskText(text, { targets, maskChar, strength });
	}, [text, targets, maskChar, strength]);

	const totalMasked = Object.values(counts).reduce((a, b) => a + b, 0);

	const toggleTarget = (id: MaskTarget) => {
		setTargets(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const handleDownload = () => {
		if (!maskedText) return;
		const blob = new Blob([maskedText], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'masked-text.txt';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<div className="space-y-6">
			{/* Options */}
			<div className="bg-muted/30 p-4 rounded-xl border space-y-4">
				<div className="flex flex-wrap items-center gap-6">
					<div>
						<Label className="text-xs mb-1 block text-muted-foreground">マスク文字</Label>
						<Select value={maskChar} onValueChange={(v) => setMaskChar(v as MaskChar)}>
							<SelectTrigger className="w-[100px] h-8 rounded-lg bg-background">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="*">*(アスタリスク)</SelectItem>
								<SelectItem value="●">●(黒丸)</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label className="text-xs mb-1 block text-muted-foreground">強度</Label>
						<Select value={strength} onValueChange={(v) => setStrength(v as MaskStrength)}>
							<SelectTrigger className="w-[140px] h-8 rounded-lg bg-background">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="partial">部分マスク (一部残す)</SelectItem>
								<SelectItem value="full">完全マスク</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div>
					<Label className="text-xs mb-2 block text-muted-foreground">自動検出対象</Label>
					<div className="flex flex-wrap gap-3">
						{TARGET_TYPES.map(t => (
							<div key={t.id} className="flex items-center gap-1.5">
								<Checkbox
									id={`target-${t.id}`}
									checked={targets.has(t.id)}
									onCheckedChange={() => toggleTarget(t.id)}
								/>
								<Label htmlFor={`target-${t.id}`} className="text-sm cursor-pointer whitespace-nowrap">
									{t.label} <Badge variant="secondary" className="ml-1 px-1 h-4 text-[10px]">{counts[t.id]}</Badge>
								</Label>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Input */}
				<div>
					<div className="flex items-center justify-between mb-2">
						<Label className="text-sm font-medium">元のテキスト</Label>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setText('')}
							disabled={!text}
							className="h-8 text-muted-foreground hover:text-foreground"
						>
							<Trash2 className="h-4 w-4 mr-1" /> クリア
						</Button>
					</div>
					<Textarea
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="山田太郎 (yamada@example.com) 090-1234-5678"
						className="min-h-[300px] font-mono-tool text-sm leading-5 rounded-xl focus:ring-2 focus:ring-primary"
						spellCheck={false}
					/>
				</div>

				{/* Output */}
				<div>
					<div className="flex items-center justify-between mb-2">
						<Label className="text-sm font-medium flex items-center gap-2">
							マスキング後
							{totalMasked > 0 && <span className="text-xs text-green-600 font-normal">({totalMasked}箇所マスク済)</span>}
						</Label>
						<div className="flex items-center gap-2">
							{maskedText && (
								<Button variant="outline" size="sm" onClick={handleDownload} className="h-8">
									<Download className="h-4 w-4 mr-1" /> 保存
								</Button>
							)}
							<CopyButton text={maskedText} />
						</div>
					</div>
					<Textarea
						value={maskedText}
						readOnly
						className={`min-h-[300px] font-mono-tool text-sm leading-5 rounded-xl bg-card border shadow-sm ${maskedText ? 'shimmer' : ''
							}`}
						spellCheck={false}
					/>
				</div>
			</div>
		</div>
	);
}
