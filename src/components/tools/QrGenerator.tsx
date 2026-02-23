import { useState, useEffect, useCallback } from 'react';
import {
	generateQRDataUrl,
	generateQRSvg,
	downloadDataUrl,
	downloadSvg,
	defaultOptions,
	type QROptions,
	type ErrorCorrectionLevel,
	type QRSize,
} from '@/lib/tools/qr-generator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Download, ImageIcon } from 'lucide-react';

export default function QrGenerator() {
	const [text, setText] = useState('');
	const [options, setOptions] = useState<QROptions>(defaultOptions);
	const [qrDataUrl, setQrDataUrl] = useState('');
	const [qrSvg, setQrSvg] = useState('');

	// Real-time QR generation
	useEffect(() => {
		if (!text.trim()) {
			setQrDataUrl('');
			setQrSvg('');
			return;
		}

		const timer = setTimeout(async () => {
			try {
				const [dataUrl, svg] = await Promise.all([
					generateQRDataUrl(text, options),
					generateQRSvg(text, options),
				]);
				setQrDataUrl(dataUrl);
				setQrSvg(svg);
			} catch {
				// ignore
			}
		}, 150);

		return () => clearTimeout(timer);
	}, [text, options]);

	const handleDownloadPng = useCallback(() => {
		if (qrDataUrl) downloadDataUrl(qrDataUrl, 'qrcode.png');
	}, [qrDataUrl]);

	const handleDownloadSvg = useCallback(() => {
		if (qrSvg) downloadSvg(qrSvg, 'qrcode.svg');
	}, [qrSvg]);

	return (
		<div className="space-y-6">
			{/* Input */}
			<div>
				<Label className="text-sm font-medium mb-2 block">URLまたはテキスト</Label>
				<Input
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="https://tools.codelife.cafe"
					className="rounded-xl focus:ring-2 focus:ring-primary"
				/>
			</div>

			{/* Preview */}
			<Card className="rounded-xl">
				<CardContent className="flex flex-col items-center justify-center p-8">
					{qrDataUrl ? (
						<img
							src={qrDataUrl}
							alt="QRコード"
							className="max-w-full rounded-lg shimmer"
							style={{ width: options.size, height: options.size }}
						/>
					) : (
						<div className="flex flex-col items-center justify-center text-muted-foreground py-12">
							<ImageIcon className="h-16 w-16 mb-4 opacity-30" />
							<p className="text-sm">テキストを入力するとQRコードが表示されます</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Options */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<Label className="text-sm mb-2 block">サイズ</Label>
					<Select
						value={String(options.size)}
						onValueChange={(v) => setOptions((prev) => ({ ...prev, size: Number(v) as QRSize }))}
					>
						<SelectTrigger className="rounded-xl">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="200">S (200px)</SelectItem>
							<SelectItem value="400">M (400px)</SelectItem>
							<SelectItem value="600">L (600px)</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label className="text-sm mb-2 block">エラー訂正レベル</Label>
					<Select
						value={options.errorCorrection}
						onValueChange={(v) => setOptions((prev) => ({ ...prev, errorCorrection: v as ErrorCorrectionLevel }))}
					>
						<SelectTrigger className="rounded-xl">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="L">L（低）</SelectItem>
							<SelectItem value="M">M（中）</SelectItem>
							<SelectItem value="Q">Q（中高）</SelectItem>
							<SelectItem value="H">H（高）</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label className="text-sm mb-2 block">前景色</Label>
					<div className="flex items-center gap-2">
						<input
							type="color"
							value={options.foregroundColor}
							onChange={(e) => setOptions((prev) => ({ ...prev, foregroundColor: e.target.value }))}
							className="h-10 w-10 rounded border border-border cursor-pointer"
						/>
						<Input
							value={options.foregroundColor}
							onChange={(e) => setOptions((prev) => ({ ...prev, foregroundColor: e.target.value }))}
							className="rounded-xl"
						/>
					</div>
				</div>
				<div>
					<Label className="text-sm mb-2 block">背景色</Label>
					<div className="flex items-center gap-2">
						<input
							type="color"
							value={options.backgroundColor}
							onChange={(e) => setOptions((prev) => ({ ...prev, backgroundColor: e.target.value }))}
							className="h-10 w-10 rounded border border-border cursor-pointer"
						/>
						<Input
							value={options.backgroundColor}
							onChange={(e) => setOptions((prev) => ({ ...prev, backgroundColor: e.target.value }))}
							className="rounded-xl"
						/>
					</div>
				</div>
			</div>

			{/* Download Buttons */}
			<div className="flex gap-3">
				<Button onClick={handleDownloadPng} disabled={!qrDataUrl} className="rounded-xl">
					<Download className="h-4 w-4 mr-1" />
					PNG ダウンロード
				</Button>
				<Button onClick={handleDownloadSvg} disabled={!qrSvg} variant="outline" className="rounded-xl">
					<Download className="h-4 w-4 mr-1" />
					SVG ダウンロード
				</Button>
			</div>
		</div>
	);
}
