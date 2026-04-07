import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { CipherAlgorithm, CipherDirection } from '@/lib/cipher';

interface InputPanelProps {
	value: string;
	onChange: (value: string) => void;
	algorithm: CipherAlgorithm;
	morseDirection?: CipherDirection;
}

const PLACEHOLDERS: Record<string, string> = {
	caesar: '「こんにちは」や「Hello World」を入力...',
	rot13: '「Hello World」を入力...',
	reverse: '「テキストを反転します」を入力...',
	'morse-encode': '「SOS」や「Hello」を入力...',
	'morse-decode': '「... --- ...」を入力...',
};

export default function InputPanel({
	value,
	onChange,
	algorithm,
	morseDirection = 'encode',
}: InputPanelProps) {
	const placeholderKey =
		algorithm === 'morse' ? `morse-${morseDirection}` : algorithm;
	const placeholder = PLACEHOLDERS[placeholderKey] ?? '入力してください...';

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium text-muted-foreground">入力</span>
				{value.length > 0 && (
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => onChange('')}
						aria-label="クリア"
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>
			<Textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="font-mono min-h-[200px] resize-y"
				aria-label="入力テキスト"
			/>
			<div className="flex justify-end">
				<span className="text-xs text-muted-foreground">
					{value.length} 文字
				</span>
			</div>
		</div>
	);
}
