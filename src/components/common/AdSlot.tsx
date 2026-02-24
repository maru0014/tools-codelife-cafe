import React, { useEffect } from 'react';

interface AdSlotProps {
	slotId: string;
	format?: 'auto' | 'rectangle' | 'horizontal';
	className?: string;
	style?: React.CSSProperties;
}

declare global {
	interface Window {
		adsbygoogle: any[];
	}
}

export default function AdSlot({ slotId, format = 'auto', className = '', style }: AdSlotProps) {
	const adsenseId = import.meta.env.PUBLIC_ADSENSE_ID;

	useEffect(() => {
		if (adsenseId && typeof window !== 'undefined') {
			try {
				(window.adsbygoogle = window.adsbygoogle || []).push({});
			} catch (e) {
				console.error('AdSense error:', e);
			}
		}
	}, [adsenseId]);

	if (!adsenseId) {
		// 開発環境かつAdSense ID未設定の場合はプレースホルダーを表示（確認用）
		if (import.meta.env.DEV) {
			return (
				<div
					className={`flex items-center justify-center bg-muted/30 border border-dashed border-border rounded-lg text-sm text-muted-foreground ${className}`}
					style={{ minHeight: format === 'horizontal' ? '90px' : '250px', ...style }}
				>
					AdSense Placeholder ({format})
				</div>
			);
		}
		return null;
	}

	return (
		<div className={`overflow-hidden ${className}`}>
			<ins
				className="adsbygoogle"
				style={{ display: 'block', ...style }}
				data-ad-client={adsenseId}
				data-ad-slot={slotId}
				data-ad-format={format}
				data-full-width-responsive="true"
			/>
		</div>
	);
}
