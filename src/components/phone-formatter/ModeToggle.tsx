/**
 * モード切り替えコンポーネント（単一入力 / 一括入力）
 * アニメーション付きセグメントコントロール
 */
import { useEffect, useRef } from 'react';

interface ModeToggleProps {
	mode: 'single' | 'bulk';
	onModeChange: (mode: 'single' | 'bulk') => void;
}

const STORAGE_KEY = 'phone-formatter-mode';

export default function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
	const singleRef = useRef<HTMLButtonElement>(null);
	const bulkRef = useRef<HTMLButtonElement>(null);
	const indicatorRef = useRef<HTMLDivElement>(null);

	// インジケーターのアニメーション
	useEffect(() => {
		const activeBtn = mode === 'single' ? singleRef.current : bulkRef.current;
		const indicator = indicatorRef.current;
		if (!activeBtn || !indicator) return;

		indicator.style.left = `${activeBtn.offsetLeft}px`;
		indicator.style.width = `${activeBtn.offsetWidth}px`;
	}, [mode]);

	const handleChange = (newMode: 'single' | 'bulk') => {
		onModeChange(newMode);
		localStorage.setItem(STORAGE_KEY, newMode);
	};

	return (
		<div
			role="tablist"
			aria-label="入力モード切り替え"
			className="relative flex items-center bg-muted rounded-lg p-1 w-fit"
		>
			{/* スライドインジケーター */}
			<div
				ref={indicatorRef}
				aria-hidden="true"
				className="absolute top-1 h-[calc(100%-8px)] bg-background rounded-md shadow-sm transition-all duration-200 ease-in-out"
			/>
			<button
				ref={singleRef}
				role="tab"
				aria-selected={mode === 'single'}
				onClick={() => handleChange('single')}
				className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
					mode === 'single'
						? 'text-foreground'
						: 'text-muted-foreground hover:text-foreground'
				}`}
			>
				単一入力
			</button>
			<button
				ref={bulkRef}
				role="tab"
				aria-selected={mode === 'bulk'}
				onClick={() => handleChange('bulk')}
				className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
					mode === 'bulk'
						? 'text-foreground'
						: 'text-muted-foreground hover:text-foreground'
				}`}
			>
				一括入力
			</button>
		</div>
	);
}
