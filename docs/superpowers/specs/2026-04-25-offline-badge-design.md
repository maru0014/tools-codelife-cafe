# オフラインバッジ改善 設計ドキュメント

## Context

現在のヘッダー右上の「オフライン対応」バッジは静的テキストで、以下の問題がある：
- PWAをインストールしないとオフライン動作できないのに、その旨が伝わらない
- 実際にオフラインで動作中かどうかが分からない

これを状態対応の動的コンポーネントに置き換え、ユーザーに正確な状態を伝える。

## 設計

### コンポーネント

`src/components/layout/OfflineBadge.tsx` を新規作成し、`Header.astro` の静的 `<span>` と置き換える。

### 3つの状態

| 状態 | 条件 | 表示テキスト | 色 | アイコン |
|------|------|------------|-----|---------|
| オフライン動作中 | `navigator.onLine === false` | オフラインモードで動作中 | アンバー (`text-amber-400`) | WifiOff |
| PWA済み・オンライン | `display-mode: standalone` かつ `onLine === true` | オフライン対応済み | 緑 (`text-safety`) | パルスドット |
| 未インストール・オンライン | それ以外 | オフラインモードを有効化 | グレー (`text-muted-foreground`) | Download |

オフライン状態は他の2つより優先して表示する。

### 状態検出

```typescript
// PWAインストール済み判定
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

// オフライン状態はリアルタイムに反応
window.addEventListener('online', handler);
window.addEventListener('offline', handler);
```

### インストール案内ポップオーバー（状態①クリック時）

`SafetyBadge.tsx` と同じ Popover コンポーネントを使用。内容：

- タイトル: 「PWAをインストールしてオフライン対応」
- 説明文: 「PWAとしてインストールすると、ネット接続なしでもツールを使えます。」
- 手順（静的テキスト）:
  - 🍎 iOS/Safari: 共有 → ホーム画面に追加
  - 🤖 Android/Chrome: メニュー → アプリをインストール
  - 🖥️ PC/Chrome: アドレスバー右の ＋ をクリック

状態②③はクリック不要（テキスト表示のみ）。

## 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `src/components/layout/OfflineBadge.tsx` | 新規作成（メインコンポーネント） |
| `src/components/layout/Header.astro` | 静的 `<span>` を `<OfflineBadge client:load />` に置き換え |

## 検証

1. ブラウザの開発者ツール → ネットワーク → "オフライン" で状態③に切り替わることを確認
2. 通常ブラウザで状態①が表示されることを確認
3. PWAインストール後（または `display-mode: standalone` で起動）で状態②が表示されることを確認
4. 状態①クリックでポップオーバーが開き、手順が表示されることを確認
5. `npm run build` が通ることを確認
