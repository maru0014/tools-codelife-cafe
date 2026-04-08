import { useMemo } from 'react';
import { caesarBruteForce } from '@/lib/cipher';

interface BruteForcePanelProps {
	input: string;
	currentShift: number;
	onShiftSelect: (shift: number) => void;
}

export default function BruteForcePanel({
	input,
	currentShift,
	onShiftSelect,
}: BruteForcePanelProps) {
	const results = useMemo(() => caesarBruteForce(input), [input]);

	return (
		<details className="group rounded-xl border border-border">
			<summary className="cursor-pointer p-4 text-sm font-semibold flex items-center gap-2 list-none">
				🔓 ブルートフォース（全パターン表示）
				<span className="ml-auto text-muted-foreground transition-transform group-open:rotate-180">
					▼
				</span>
			</summary>
			<div className="px-4 pb-4">
				{results.length === 0 ? (
					<p className="text-sm text-muted-foreground py-2">
						テキストを入力すると全パターンが表示されます
					</p>
				) : (
					<ul className="overflow-y-auto max-h-[400px] rounded-md border border-border">
						{results.map(({ shift, output }) => (
							<li
								key={shift}
								className="border-b border-border last:border-b-0"
							>
								<button
									type="button"
									onClick={() => onShiftSelect(shift)}
									className={`w-full text-left px-3 py-2 text-sm font-mono flex gap-2 transition-colors hover:bg-muted ${
										shift === currentShift
											? 'bg-primary/10 text-primary font-medium'
											: ''
									}`}
									aria-label={`シフト ${shift}: ${output.slice(0, 100)}`}
								>
									<span className="shrink-0 text-muted-foreground w-16">
										シフト {shift}:
									</span>
									<span className="truncate">
										{output.length > 100
											? `${output.slice(0, 100)}...`
											: output}
									</span>
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
		</details>
	);
}
