import CopyButton from '@/components/common/CopyButton';
import { Textarea } from '@/components/ui/textarea';

interface OutputPanelProps {
	value: string;
}

export default function OutputPanel({ value }: OutputPanelProps) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium text-muted-foreground">出力</span>
				<CopyButton text={value} />
			</div>
			<Textarea
				value={value}
				readOnly
				placeholder="変換結果がここに表示されます"
				className="font-mono min-h-[200px] resize-y bg-muted/30"
				aria-label="出力テキスト"
			/>
			<div className="flex justify-end">
				<span className="text-xs text-muted-foreground">
					{value.length} 文字
				</span>
			</div>
		</div>
	);
}
