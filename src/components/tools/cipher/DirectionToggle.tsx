import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CipherDirection } from '@/lib/cipher';

interface DirectionToggleProps {
	value: CipherDirection;
	onChange: (value: CipherDirection) => void;
}

export default function DirectionToggle({
	value,
	onChange,
}: DirectionToggleProps) {
	return (
		<div
			className="flex rounded-md border border-border overflow-hidden shrink-0"
			role="group"
			aria-label="変換方向"
		>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => onChange('encode')}
				className={`rounded-none border-0 gap-1.5 ${
					value === 'encode'
						? 'bg-primary text-primary-foreground hover:bg-primary/90'
						: 'hover:bg-muted'
				}`}
				aria-pressed={value === 'encode'}
			>
				<Lock className="h-3.5 w-3.5" />
				エンコード（暗号化）
			</Button>
			<div className="w-px bg-border" />
			<Button
				variant="ghost"
				size="sm"
				onClick={() => onChange('decode')}
				className={`rounded-none border-0 gap-1.5 ${
					value === 'decode'
						? 'bg-primary text-primary-foreground hover:bg-primary/90'
						: 'hover:bg-muted'
				}`}
				aria-pressed={value === 'decode'}
			>
				<Unlock className="h-3.5 w-3.5" />
				デコード（復号）
			</Button>
		</div>
	);
}
