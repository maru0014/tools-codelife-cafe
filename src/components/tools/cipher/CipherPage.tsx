import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CipherAlgorithm, CipherDirection } from '@/lib/cipher';
import {
	caesarCipher,
	getMaxShift,
	morseDecode,
	morseEncode,
	reverseString,
	rot13,
} from '@/lib/cipher';
import AlgorithmInfo from './AlgorithmInfo';
import BruteForcePanel from './BruteForcePanel';
import DirectionToggle from './DirectionToggle';
import InputPanel from './InputPanel';
import OutputPanel from './OutputPanel';
import ShiftSlider from './ShiftSlider';

export default function CipherPage() {
	const [activeTab, setActiveTab] = useState<CipherAlgorithm>('caesar');
	const [input, setInput] = useState('');
	const [shift, setShift] = useState(3);
	const [caesarDirection, setCaesarDirection] =
		useState<CipherDirection>('encode');
	const [morseDirection, setMorseDirection] =
		useState<CipherDirection>('encode');

	const maxShift = useMemo(() => getMaxShift(input), [input]);

	const output = useMemo(() => {
		if (!input) return '';
		switch (activeTab) {
			case 'caesar':
				return caesarCipher(input, { shift, direction: caesarDirection })
					.output;
			case 'rot13':
				return rot13(input).output;
			case 'reverse':
				return reverseString(input).output;
			case 'morse':
				return morseDirection === 'encode'
					? morseEncode(input).output
					: morseDecode(input).output;
		}
	}, [input, activeTab, shift, caesarDirection, morseDirection]);

	function handleTabChange(value: string) {
		setActiveTab(value as CipherAlgorithm);
		setInput('');
		setCaesarDirection('encode');
		setMorseDirection('encode');
		setShift(3);
	}

	return (
		<div className="space-y-4">
			<Tabs value={activeTab} onValueChange={handleTabChange}>
				<TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1">
					<TabsTrigger value="caesar">シーザー暗号</TabsTrigger>
					<TabsTrigger value="rot13">ROT13</TabsTrigger>
					<TabsTrigger value="reverse">文字列反転</TabsTrigger>
					<TabsTrigger value="morse">モールス信号</TabsTrigger>
				</TabsList>

				{/* Caesar-specific controls */}
				<TabsContent value="caesar" className="mt-4 space-y-4">
					<div className="flex flex-wrap gap-3 items-center p-3 rounded-lg bg-muted/30 border border-border">
						<DirectionToggle
							value={caesarDirection}
							onChange={setCaesarDirection}
						/>
						<ShiftSlider
							value={shift}
							onChange={setShift}
							maxShift={maxShift}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<InputPanel value={input} onChange={setInput} algorithm="caesar" />
						<OutputPanel value={output} />
					</div>

					<BruteForcePanel
						input={input}
						currentShift={shift}
						onShiftSelect={setShift}
					/>

					<AlgorithmInfo algorithm="caesar" />
				</TabsContent>

				{/* ROT13 */}
				<TabsContent value="rot13" className="mt-4 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<InputPanel value={input} onChange={setInput} algorithm="rot13" />
						<OutputPanel value={output} />
					</div>
					<AlgorithmInfo algorithm="rot13" />
				</TabsContent>

				{/* String reversal */}
				<TabsContent value="reverse" className="mt-4 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<InputPanel value={input} onChange={setInput} algorithm="reverse" />
						<OutputPanel value={output} />
					</div>
					<AlgorithmInfo algorithm="reverse" />
				</TabsContent>

				{/* Morse code */}
				<TabsContent value="morse" className="mt-4 space-y-4">
					<div className="flex flex-wrap gap-3 items-center p-3 rounded-lg bg-muted/30 border border-border">
						<DirectionToggle
							value={morseDirection}
							onChange={setMorseDirection}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<InputPanel
							value={input}
							onChange={setInput}
							algorithm="morse"
							morseDirection={morseDirection}
						/>
						<OutputPanel value={output} />
					</div>

					<AlgorithmInfo algorithm="morse" />
				</TabsContent>
			</Tabs>
		</div>
	);
}
