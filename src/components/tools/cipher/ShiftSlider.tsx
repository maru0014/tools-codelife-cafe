import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface ShiftSliderProps {
	value: number;
	onChange: (value: number) => void;
	maxShift: number;
}

export default function ShiftSlider({
	value,
	onChange,
	maxShift,
}: ShiftSliderProps) {
	// Clamp if max decreases
	useEffect(() => {
		if (value > maxShift) {
			onChange(maxShift);
		}
	}, [maxShift, value, onChange]);

	const clamped = Math.min(Math.max(value, 1), maxShift);

	return (
		<div className="flex items-center gap-3 flex-1 min-w-0">
			<span className="text-sm font-medium whitespace-nowrap shrink-0">
				シフト数: {clamped}
			</span>
			<Slider
				min={1}
				max={maxShift}
				step={1}
				value={[clamped]}
				onValueChange={([v]) => onChange(v)}
				className="flex-1"
				aria-label="シフト数"
			/>
			<Input
				type="number"
				min={1}
				max={maxShift}
				value={clamped}
				onChange={(e) => {
					const n = Number.parseInt(e.target.value, 10);
					if (!Number.isNaN(n)) {
						onChange(Math.min(Math.max(n, 1), maxShift));
					}
				}}
				className="w-16 text-center shrink-0"
				aria-label="シフト数入力"
			/>
		</div>
	);
}
