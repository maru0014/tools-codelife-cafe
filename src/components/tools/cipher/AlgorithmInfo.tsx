import { ChevronDown, Info } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { CipherAlgorithm } from '@/lib/cipher';

interface AlgorithmInfoProps {
	algorithm: CipherAlgorithm;
}

const infoContent: Record<CipherAlgorithm, string> = {
	caesar:
		'各文字を指定した数だけずらして暗号化する古典的な暗号方式。英字（A-Z）に加え、ひらがな・カタカナにも対応。紀元前1世紀のジュリアス・シーザーが使用したことに由来。',
	rot13:
		'シーザー暗号のシフト数を13に固定した方式。英字のみ対応。2回適用すると元に戻る特性がある。ネタバレ防止などに利用される。',
	reverse:
		'テキストの文字順を逆にする。暗号としては簡易だが、プログラミングの練習問題として頻出。絵文字やサロゲートペアにも対応。',
	morse:
		'文字を短点（・）と長点（−）の組み合わせで表現する符号化方式。国際モールス符号に準拠。英字・数字・主要記号に対応。',
};

export function AlgorithmInfo({ algorithm }: AlgorithmInfoProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
			className="w-full rounded-md border bg-card p-4 shadow-sm"
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Info className="h-5 w-5 text-primary" />
					<h3 className="font-medium">このアルゴリズムについて</h3>
				</div>
				<CollapsibleTrigger asChild>
					<Button variant="ghost" size="sm" className="w-9 p-0">
						<ChevronDown
							className={`h-4 w-4 transition-transform duration-200 ${
								isOpen ? 'rotate-180' : ''
							}`}
						/>
						<span className="sr-only">Toggle info</span>
					</Button>
				</CollapsibleTrigger>
			</div>
			<CollapsibleContent className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed animate-in slide-in-from-top-2 fade-in-0">
				{infoContent[algorithm]}
			</CollapsibleContent>
		</Collapsible>
	);
}
