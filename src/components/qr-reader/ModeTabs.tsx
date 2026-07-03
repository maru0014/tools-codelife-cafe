import { Camera, ImageIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type ScanMode = 'camera' | 'image';

interface ModeTabsProps {
	mode: ScanMode;
	onModeChange: (mode: ScanMode) => void;
}

export default function ModeTabs({ mode, onModeChange }: ModeTabsProps) {
	return (
		<Tabs value={mode} onValueChange={(v) => onModeChange(v as ScanMode)}>
			<TabsList>
				<TabsTrigger value="camera" className="gap-1.5">
					<Camera className="h-4 w-4" aria-hidden="true" />
					カメラで読み取り
				</TabsTrigger>
				<TabsTrigger value="image" className="gap-1.5">
					<ImageIcon className="h-4 w-4" aria-hidden="true" />
					画像から読み取り
				</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}
