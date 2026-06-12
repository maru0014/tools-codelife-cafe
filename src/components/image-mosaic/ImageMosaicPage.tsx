// ImageMosaicPage — 画像モザイク・ぼかしツールのオーケストレータ
// 状態: 読み込みフェーズ / マスク領域（undo/redo履歴付き） / 選択 / モード / 強度

import { ImagePlus, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { ExportBar } from '@/components/common/ExportBar';
import { ImageDropzone } from '@/components/common/ImageDropzone';
import { useHistoryState } from '@/components/common/useHistoryState';
import { Button } from '@/components/ui/button';
import {
	createId,
	DOWNSCALE_EDGE,
	downscaleImage,
	loadImageFile,
	needsDownscale,
	validateImageFile,
} from '@/lib/tools/image-common';
import {
	BLUR_RADIUS,
	DEFAULT_EMOJI_STAMP,
	type MaskMode,
	type MaskRegion,
	type MaskShape,
	MOSAIC_BLOCK,
	type Rect,
	renderMasked,
} from '@/lib/tools/image-mosaic';
import { CanvasEditor } from './CanvasEditor';
import { MaskToolbar } from './MaskToolbar';

type Phase =
	| { kind: 'empty' }
	| { kind: 'confirmDownscale'; image: HTMLImageElement; fileName: string }
	| {
			kind: 'editing';
			source: HTMLImageElement | HTMLCanvasElement;
			fileName: string;
	  };

export default function ImageMosaicPage() {
	const [phase, setPhase] = useState<Phase>({ kind: 'empty' });
	const [error, setError] = useState<string | null>(null);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [mode, setMode] = useState<MaskMode>('mosaic');
	const [shape, setShape] = useState<MaskShape>('rect');
	const [emoji, setEmoji] = useState(DEFAULT_EMOJI_STAMP);
	const [stampImage, setStampImage] = useState<HTMLImageElement | null>(null);
	const [stampImageName, setStampImageName] = useState<string | null>(null);
	const [strengths, setStrengths] = useState<Record<'mosaic' | 'blur', number>>(
		{
			mosaic: MOSAIC_BLOCK.default,
			blur: BLUR_RADIUS.default,
		},
	);
	const regions = useHistoryState<MaskRegion[]>([]);

	const startEditing = useCallback(
		(source: HTMLImageElement | HTMLCanvasElement, fileName: string) => {
			setPhase({ kind: 'editing', source, fileName });
			setSelectedId(null);
			regions.reset([]);
		},
		[regions],
	);

	const handleFile = useCallback(
		async (file: File) => {
			setError(null);
			const validation = validateImageFile(file);
			if (!validation.ok) {
				setError(validation.message);
				return;
			}
			try {
				const image = await loadImageFile(file);
				if (needsDownscale(image)) {
					setPhase({ kind: 'confirmDownscale', image, fileName: file.name });
					return;
				}
				startEditing(image, file.name);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : '画像の読み込みに失敗しました',
				);
			}
		},
		[startEditing],
	);

	const selectedRegion =
		selectedId !== null
			? (regions.state.find((r) => r.id === selectedId) ?? null)
			: null;

	// ツールバーに表示する設定（領域選択中はその領域の値）
	const activeMode = selectedRegion?.mode ?? mode;
	const activeShape = selectedRegion?.shape ?? shape;
	const activeStrength =
		activeMode === 'mosaic' || activeMode === 'blur'
			? (selectedRegion?.strength ?? strengths[activeMode])
			: strengths.mosaic;
	const activeEmoji = selectedRegion?.emoji ?? emoji;
	const activeStampImageName = selectedRegion?.stampImageName ?? stampImageName;

	const handleAddRegion = useCallback(
		(rect: Rect) => {
			if (mode === 'image' && !stampImage) {
				setError(
					'画像スタンプを使うには、先に任意画像ファイルを選択してください',
				);
				return;
			}
			const region: MaskRegion = {
				id: createId(),
				rect,
				mode,
				shape,
				strength:
					mode === 'mosaic' || mode === 'blur'
						? strengths[mode]
						: strengths.mosaic,
				emoji: mode === 'emoji' ? emoji : undefined,
				stampImage: mode === 'image' ? (stampImage ?? undefined) : undefined,
				stampImageName:
					mode === 'image' ? (stampImageName ?? undefined) : undefined,
			};
			regions.set([...regions.state, region]);
		},
		[mode, stampImage, shape, strengths, emoji, stampImageName, regions],
	);

	const handleDeleteRegion = useCallback(
		(id: string) => {
			regions.set(regions.state.filter((r) => r.id !== id));
			setSelectedId((current) => (current === id ? null : current));
		},
		[regions],
	);

	const handleModeChange = useCallback(
		(next: MaskMode) => {
			if (selectedRegion) {
				const range = next === 'blur' ? BLUR_RADIUS : MOSAIC_BLOCK;
				const strength =
					next === 'mosaic' || next === 'blur'
						? Math.min(range.max, Math.max(range.min, selectedRegion.strength))
						: selectedRegion.strength;
				regions.set(
					regions.state.map((r) =>
						r.id === selectedRegion.id
							? {
									...r,
									mode: next,
									strength,
									emoji: next === 'emoji' ? activeEmoji : r.emoji,
									stampImage:
										next === 'image'
											? (stampImage ?? r.stampImage)
											: r.stampImage,
									stampImageName:
										next === 'image'
											? (stampImageName ?? r.stampImageName)
											: r.stampImageName,
								}
							: r,
					),
				);
			}
			setMode(next);
		},
		[selectedRegion, regions, activeEmoji, stampImage, stampImageName],
	);

	const handleShapeChange = useCallback(
		(next: MaskShape) => {
			if (selectedRegion) {
				regions.set(
					regions.state.map((r) =>
						r.id === selectedRegion.id ? { ...r, shape: next } : r,
					),
				);
			}
			setShape(next);
		},
		[selectedRegion, regions],
	);

	const handleEmojiChange = useCallback(
		(next: string) => {
			setEmoji(next);
			if (selectedRegion) {
				regions.set(
					regions.state.map((r) =>
						r.id === selectedRegion.id ? { ...r, emoji: next } : r,
					),
				);
			}
		},
		[selectedRegion, regions],
	);

	const handleStampImageChange = useCallback(
		async (file: File) => {
			setError(null);
			const validation = validateImageFile(file);
			if (!validation.ok) {
				setError(validation.message);
				return;
			}
			try {
				const image = await loadImageFile(file);
				setStampImage(image);
				setStampImageName(file.name);
				if (selectedRegion) {
					regions.set(
						regions.state.map((r) =>
							r.id === selectedRegion.id
								? {
										...r,
										mode: 'image',
										stampImage: image,
										stampImageName: file.name,
									}
								: r,
						),
					);
				}
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: '画像スタンプの読み込みに失敗しました',
				);
			}
		},
		[selectedRegion, regions],
	);

	const handleStrengthChange = useCallback(
		(value: number, commit: boolean) => {
			if (selectedRegion) {
				const next = regions.state.map((r) =>
					r.id === selectedRegion.id ? { ...r, strength: value } : r,
				);
				if (commit) {
					regions.set(next);
				} else {
					regions.setTransient(next);
				}
			} else if (activeMode === 'mosaic' || activeMode === 'blur') {
				setStrengths((s) => ({ ...s, [activeMode]: value }));
			}
		},
		[selectedRegion, regions, activeMode],
	);

	const handleReset = useCallback(() => {
		regions.reset([]);
		setSelectedId(null);
	}, [regions]);

	const handleClear = useCallback(() => {
		setPhase({ kind: 'empty' });
		setError(null);
		regions.reset([]);
		setSelectedId(null);
		setStampImage(null);
		setStampImageName(null);
	}, [regions]);

	return (
		<div className="space-y-4">
			{error && (
				<div
					className="flex items-center gap-2 rounded-xl border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive"
					role="alert"
				>
					<X className="h-4 w-4 shrink-0" />
					<span>{error}</span>
					<Button
						variant="ghost"
						size="sm"
						className="ml-auto"
						onClick={() => setError(null)}
					>
						閉じる
					</Button>
				</div>
			)}

			{phase.kind === 'empty' && <ImageDropzone onFileAccepted={handleFile} />}

			{phase.kind === 'confirmDownscale' && (
				<div className="space-y-4 rounded-xl border border-border p-6">
					<p className="text-sm">
						画像サイズが大きいため（{phase.image.naturalWidth}×
						{phase.image.naturalHeight}px）、快適に編集できるよう長辺を
						{DOWNSCALE_EDGE}pxに縮小して読み込みます。
					</p>
					<div className="flex gap-3">
						<Button
							onClick={() =>
								startEditing(downscaleImage(phase.image), phase.fileName)
							}
						>
							縮小して読み込む
						</Button>
						<Button variant="outline" onClick={handleClear}>
							キャンセル
						</Button>
					</div>
				</div>
			)}

			{phase.kind === 'editing' && (
				<>
					<MaskToolbar
						mode={activeMode}
						strength={activeStrength}
						shape={activeShape}
						emoji={activeEmoji}
						stampImageName={activeStampImageName}
						onModeChange={handleModeChange}
						onShapeChange={handleShapeChange}
						onEmojiChange={handleEmojiChange}
						onStampImageChange={handleStampImageChange}
						onStrengthChange={handleStrengthChange}
						canUndo={regions.canUndo}
						canRedo={regions.canRedo}
						onUndo={regions.undo}
						onRedo={regions.redo}
						onReset={handleReset}
						editingRegion={selectedRegion !== null}
					/>
					<p className="text-xs text-muted-foreground">
						キャンバス上をドラッグして、モザイク・ぼかし範囲またはスタンプ配置範囲を選択してください。モザイク・ぼかしは四角形/円形を切り替えられます。領域をクリックすると選択でき、Deleteキーまたは✕ボタンで削除できます。
					</p>
					<div className="text-center">
						<CanvasEditor
							source={phase.source}
							regions={regions.state}
							selectedId={selectedId}
							onAddRegion={handleAddRegion}
							onSelectRegion={setSelectedId}
							onDeleteRegion={handleDeleteRegion}
							drawingMode={activeMode}
							drawingShape={activeShape}
						/>
					</div>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<Button variant="outline" size="sm" onClick={handleClear}>
							<ImagePlus className="h-4 w-4" />
							別の画像を選ぶ
						</Button>
					</div>
					<ExportBar
						getCanvas={() => renderMasked(phase.source, regions.state)}
						baseName={phase.fileName}
					/>
				</>
			)}
		</div>
	);
}
