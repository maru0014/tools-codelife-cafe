import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const updateTheme = () => {
			setIsDark(document.documentElement.classList.contains('dark'));
		};

		// Init
		updateTheme();

		// Observe html class changes
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.attributeName === 'class') {
					updateTheme();
				}
			}
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		});

		return () => observer.disconnect();
	}, []);
	const toggle = () => {
		const next = !isDark;
		setIsDark(next);
		document.documentElement.classList.toggle('dark', next);
		localStorage.setItem('theme', next ? 'dark' : 'light');
	};

	return (
		<button
			onClick={toggle}
			className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted transition-colors"
			aria-label={isDark ? 'ライトモードに切替' : 'ダークモードに切替'}
		>
			{isDark ? (
				<Sun className="h-4 w-4 text-yellow-400" />
			) : (
				<Moon className="h-4 w-4 text-muted-foreground" />
			)}
		</button>
	);
}
