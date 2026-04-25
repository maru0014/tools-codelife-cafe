# オフラインバッジ改善 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ヘッダー右上のオフラインバッジを状態対応の動的コンポーネントに置き換え、PWAインストールの必要性とオフライン動作状態をユーザーに正確に伝える。

**Architecture:** 静的テキスト `<span>` を React コンポーネント `OfflineBadge.tsx` に置き換える。`navigator.onLine` と `display-mode: standalone` メディアクエリで3状態を判定し、`online`/`offline` イベントでリアルタイム更新する。インストール案内は既存の Popover コンポーネント（SafetyBadge.tsx と同パターン）で実装する。

**Tech Stack:** Astro, React, TypeScript, lucide-react (WifiOff, Download), shadcn/ui Popover, Tailwind CSS

---

## ファイル構成

| 操作 | パス | 内容 |
|------|------|------|
| 新規作成 | `src/components/layout/OfflineBadge.tsx` | 3状態バッジコンポーネント |
| 修正 | `src/components/layout/Header.astro:32-35` | 静的 `<span>` を `<OfflineBadge client:load />` に置き換え |

---

### Task 1: OfflineBadge.tsx を作成する

**Files:**
- Create: `src/components/layout/OfflineBadge.tsx`

- [ ] **Step 1: ファイルを作成する**

`src/components/layout/OfflineBadge.tsx` を以下の内容で作成する：

```tsx
import { Download, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

type BadgeState = 'offline' | 'installed' | 'uninstalled';

function getBadgeState(): BadgeState {
	if (typeof window === 'undefined') return 'uninstalled';
	if (!navigator.onLine) return 'offline';
	if (window.matchMedia('(display-mode: standalone)').matches) return 'installed';
	return 'uninstalled';
}

export default function OfflineBadge() {
	const [state, setState] = useState<BadgeState>('uninstalled');
	const [open, setOpen] = useState(false);

	useEffect(() => {
		setState(getBadgeState());

		const handleOnline = () => setState(getBadgeState());
		const handleOffline = () => setState('offline');

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	if (state === 'offline') {
		return (
			<span className="hidden lg:flex items-center gap-1.5 text-xs text-amber-400 font-medium">
				<WifiOff className="h-3.5 w-3.5" />
				オフラインモードで動作中
			</span>
		);
	}

	if (state === 'installed') {
		return (
			<span className="hidden lg:flex items-center gap-1.5 text-xs text-safety font-medium">
				<span className="inline-block h-2 w-2 rounded-full bg-safety pulse-dot" />
				オフライン対応済み
			</span>
		);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground font-medium hover:text-foreground transition-colors"
					aria-label="PWAインストール手順を表示"
				>
					<Download className="h-3.5 w-3.5" />
					オフラインモードを有効化
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-80" align="end">
				<div className="space-y-3">
					<h4 className="font-semibold text-sm">
						📲 PWAをインストールしてオフライン対応
					</h4>
					<p className="text-sm text-muted-foreground leading-relaxed">
						PWAとしてインストールすると、ネット接続なしでもツールを使えます。
					</p>
					<div className="rounded-md bg-muted p-3 text-xs text-muted-foreground space-y-1.5">
						<p>🍎 <strong>iOS/Safari:</strong> 共有 → ホーム画面に追加</p>
						<p>🤖 <strong>Android/Chrome:</strong> メニュー → アプリをインストール</p>
						<p>🖥️ <strong>PC/Chrome:</strong> アドレスバー右の ＋ をクリック</p>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
```

- [ ] **Step 2: TypeScript の型チェックを通す**

```bash
cd d:/tools-codelife-cafe && npx tsc --noEmit
```

エラーがあれば修正する。`BadgeState` 型の typo や import パスのミスが出やすい。

- [ ] **Step 3: コミット**

```bash
git add src/components/layout/OfflineBadge.tsx
git commit -m "feat(ui): add OfflineBadge component with 3 states"
```

---

### Task 2: Header.astro を更新する

**Files:**
- Modify: `src/components/layout/Header.astro:1-4`（import 追加）
- Modify: `src/components/layout/Header.astro:32-35`（静的 `<span>` を置き換え）

- [ ] **Step 1: Header.astro の import セクションを更新する**

`src/components/layout/Header.astro` の冒頭 frontmatter を以下に変更する：

```astro
---
import ThemeToggle from '../common/ThemeToggle.tsx';
import SearchModal from '../common/SearchModal.tsx';
import OfflineBadge from './OfflineBadge.tsx';
---
```

- [ ] **Step 2: 静的バッジを OfflineBadge に置き換える**

`src/components/layout/Header.astro` の 32〜35 行目（Right: Theme toggle セクション内）を変更する：

変更前：
```astro
    <div class="flex items-center gap-3">
      <span class="hidden lg:flex items-center gap-1.5 text-xs text-safety font-medium">
        <span class="inline-block h-2 w-2 rounded-full bg-safety pulse-dot"></span>
        オフライン対応
      </span>
      <ThemeToggle client:load />
    </div>
```

変更後：
```astro
    <div class="flex items-center gap-3">
      <OfflineBadge client:load />
      <ThemeToggle client:load />
    </div>
```

- [ ] **Step 3: ビルドを通す**

```bash
cd d:/tools-codelife-cafe && npm run build
```

エラーなく完了することを確認する。

- [ ] **Step 4: コミット**

```bash
git add src/components/layout/Header.astro
git commit -m "feat(ui): replace static offline badge with dynamic OfflineBadge"
```

---

### Task 3: 動作確認

- [ ] **Step 1: 開発サーバーを起動する**

```bash
cd d:/tools-codelife-cafe && npm run dev
```

`http://localhost:4321` で確認する。

- [ ] **Step 2: 状態①を確認する（通常ブラウザ・オンライン）**

ブラウザで `http://localhost:4321` を開く。ヘッダー右上に：
- ↓ アイコン + 「オフラインモードを有効化」がグレーで表示される
- クリックするとポップオーバーが開き、iOS/Android/PC の手順が表示される

- [ ] **Step 3: 状態③を確認する（オフライン）**

Chrome 開発者ツール → Network タブ → 「No throttling」を「Offline」に変更する。
ヘッダー右上が：
- WifiOff アイコン + 「オフラインモードで動作中」がアンバー色で表示される
- Network を「Online」に戻すと状態①に戻る

- [ ] **Step 4: 状態②を確認する（PWAインストール済み）**

Chrome で `http://localhost:4321` を開き、アドレスバー右の ＋ アイコンからインストールする。
インストール後、スタンドアロンウィンドウで：
- パルスドット + 「オフライン対応済み」が緑で表示される

