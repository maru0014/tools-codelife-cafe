import { Lock, Unlock } from 'lucide-react';
import type { CipherDirection } from '@/lib/cipher';

interface DirectionToggleProps {
	direction: CipherDirection;
	onChange: (direction: CipherDirection) => void;
}

export function DirectionToggle({ direction, onChange }: DirectionToggleProps) {
	return (
		<div className="flex bg-muted p-1 rounded-md w-full sm:w-fit">
			<button
				type="button"
				className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-colors ${direction === 'encode' ? 'bg-background shadow-sm' : 'hover:bg-muted-foreground/10 text-muted-foreground'}`}
				onClick={() => onChange('encode')}
			>
				<Lock className="h-4 w-4" />
				エンコード（暗号化）
			</button>
			<button
				type="button"
				className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-colors ${direction === 'decode' ? 'bg-background shadow-sm' : 'hover:bg-muted-foreground/10 text-muted-foreground'}`}
				onClick={() => onChange('decode')}
			>
				<Unlock className="h-4 w-4" />
				デコード（復号）
			</button>
		</div>
	);
}
