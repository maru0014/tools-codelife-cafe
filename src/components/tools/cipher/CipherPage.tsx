import { useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	type CipherAlgorithm,
	type CipherDirection,
	caesarCipher,
	morseDecode,
	morseEncode,
	reverseString,
	rot13,
} from '@/lib/cipher';
import { AlgorithmInfo } from './AlgorithmInfo';
import { InputPanel } from './InputPanel';
import { OutputPanel } from './OutputPanel';

export function CipherPage() {
	const [activeTab, setActiveTab] = useState<CipherAlgorithm>('caesar');
	const [input, setInput] = useState('');

	// Caesar specific state
	const [caesarShift, setCaesarShift] = useState(3);
	const [caesarDirection, setCaesarDirection] =
		useState<CipherDirection>('encode');

	// Morse specific state
	const [morseDirection, setMorseDirection] =
		useState<CipherDirection>('encode');

	const handleTabChange = (value: string) => {
		setActiveTab(value as CipherAlgorithm);
		setInput('');
		// Options are not reset per the prompt to keep things simple, or we can reset them:
		setCaesarShift(3);
		setCaesarDirection('encode');
		setMorseDirection('encode');
	};

	const output = useMemo(() => {
		if (!input) return '';

		try {
			switch (activeTab) {
				case 'caesar':
					return caesarCipher(input, {
						shift: caesarShift,
						direction: caesarDirection,
					}).output;
				case 'rot13':
					return rot13(input).output;
				case 'reverse':
					return reverseString(input).output;
				case 'morse':
					return morseDirection === 'encode'
						? morseEncode(input).output
						: morseDecode(input).output;
				default:
					return '';
			}
		} catch (err) {
			console.error(err);
			return 'エラーが発生しました';
		}
	}, [input, activeTab, caesarShift, caesarDirection, morseDirection]);

	return (
		<div className="space-y-6">
			<Tabs
				defaultValue="caesar"
				value={activeTab}
				onValueChange={handleTabChange}
				className="w-full"
			>
				<div className="overflow-x-auto pb-2">
					<TabsList className="w-full justify-start md:w-auto h-12">
						<TabsTrigger value="caesar" className="text-base px-6 py-2">
							シーザー暗号
						</TabsTrigger>
						<TabsTrigger value="rot13" className="text-base px-6 py-2">
							ROT13
						</TabsTrigger>
						<TabsTrigger value="reverse" className="text-base px-6 py-2">
							文字列反転
						</TabsTrigger>
						<TabsTrigger value="morse" className="text-base px-6 py-2">
							モールス信号
						</TabsTrigger>
					</TabsList>
				</div>

				{/* We'll inject Caesar controls here later */}
				{activeTab === 'caesar' && (
					<div className="my-4 p-4 border rounded-md text-sm text-muted-foreground">
						{/* Step 3 Placeholder */}
						ここにシーザー暗号用の操作盤が入ります（ステップ3で実装）
					</div>
				)}

				{/* We'll also need a direction toggle for Morse */}
				{activeTab === 'morse' && (
					<div className="my-4">
						<div className="flex bg-muted p-1 rounded-md w-fit">
							<button
								type="button"
								className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-colors ${morseDirection === 'encode' ? 'bg-background shadow-sm' : 'hover:bg-muted-foreground/10'}`}
								onClick={() => setMorseDirection('encode')}
							>
								エンコード（暗号化）
							</button>
							<button
								type="button"
								className={`px-4 py-1.5 rounded-sm text-sm font-medium transition-colors ${morseDirection === 'decode' ? 'bg-background shadow-sm' : 'hover:bg-muted-foreground/10'}`}
								onClick={() => setMorseDirection('decode')}
							>
								デコード（復号）
							</button>
						</div>
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
					<InputPanel
						algorithm={activeTab}
						value={input}
						onChange={setInput}
						onClear={() => setInput('')}
					/>
					<OutputPanel value={output} />
				</div>

				{/* Step 3 Brute Force Placeholder */}
				{activeTab === 'caesar' && (
					<div className="mt-4">
						{/* Brute force panel placeholder logger */}
					</div>
				)}
			</Tabs>

			<AlgorithmInfo algorithm={activeTab} />
		</div>
	);
}
