import type { CipherAlgorithm } from '@/lib/cipher';

const ALGORITHM_INFO: Record<CipherAlgorithm, { title: string; body: string }> = {
	caesar: {
		title: 'シーザー暗号について',
		body: '各文字を指定した数だけずらして暗号化する古典的な暗号方式。英字（A-Z）に加え、ひらがな・カタカナにも対応しています。紀元前1世紀のジュリアス・シーザーが使用したことに由来し、換字式暗号の最も基本的な形のひとつです。シフト数をブルートフォースで全パターン試すことで解読もできます。',
	},
	rot13: {
		title: 'ROT13について',
		body: 'シーザー暗号のシフト数を13に固定した方式。英字のみ対応しています。アルファベットが26文字なので、2回適用すると元に戻る特性があります。ネタバレ防止や、掲示板・フォーラムでのスポイラー隠しなどに利用されることがあります。',
	},
	reverse: {
		title: '文字列反転について',
		body: 'テキストの文字順を逆にするシンプルな変換です。暗号としては非常に簡易ですが、プログラミングの練習問題として頻出します。このツールは絵文字（🎉）やサロゲートペア、結合文字（が = か + ゙）などを正しく扱うため、Intl.Segmenter を使用したグラフェムクラスタ単位での反転に対応しています。',
	},
	morse: {
		title: 'モールス信号について',
		body: '文字を短点（.）と長点（-）の組み合わせで表現する符号化方式です。国際モールス符号（ITU）に準拠しており、英字・数字・主要記号に対応しています。単語間は「/」で区切られます。学習・CTF・謎解きなど幅広い用途で使われます。',
	},
}

interface AlgorithmInfoProps {
	algorithm: CipherAlgorithm;
}

export default function AlgorithmInfo({ algorithm }: AlgorithmInfoProps) {
	const info = ALGORITHM_INFO[algorithm];

	return (
		<details className="group rounded-xl border border-border p-4">
			<summary className="cursor-pointer text-sm font-semibold flex items-center gap-2 list-none">
				📖 {info.title}
				<span className="ml-auto text-muted-foreground transition-transform group-open:rotate-180">
					▼
				</span>
			</summary>
			<p className="mt-4 text-sm text-muted-foreground leading-relaxed">
				{info.body}
			</p>
		</details>
	);
}
