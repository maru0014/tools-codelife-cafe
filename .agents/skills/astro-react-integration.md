---
name: Astro/React Integration Gotchas
description: Astroのページ内でReactコンポーネントを使用する際の、特有のトラブルや回避策（特にE2Eテスト時）をまとめたナレッジベース
---

# Astro / React Integration Skill

このファイルには、Astroフレームワーク内でReactコンポーネントをアイランドアーキテクチャ (`client:load` 等) で扱う際に発生しがちな問題とその解決策をまとめています。主にDOMのハイドレーションタイミングやAstro ViewTransitions APIに関するノウハウです。

## 1. Astro ViewTransitions と Reactからの動的ダウンロード

**問題:**
Reactコンポーネント内で、計算結果などをファイルとしてダウンロードさせるために、動的に `<a>` タグを生成して `a.click()` を呼び出すことがあります。
しかし、AstroのViewTransitions APIが有効な環境では、この `<a>` タグのクリックをViewTransitionsルーターが「ページ遷移」と誤認し、テストがクラッシュしたり、意図しない挙動になることがあります。

**回避策:**
動的生成する `<a>` タグには、Astroルーターのインターセプトを防ぐために必ず `data-astro-reload="true"` 属性を付与してください。

```typescript
// Reactコンポーネント内でのダウンロード処理の例
const downloadFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  
  // 重要: Astro ViewTransitionsの誤認を防ぐ
  a.dataset.astroReload = 'true'; 
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
```

## 2. ハイドレーションとDOMのタイミング (Flaky Test対策)

**問題:**
Playwright等のE2Eテストでは、ページの初期読み込み直後に要素（例: `input[type="file"]`）を探しに行きます。
しかし、Reactコンポーネントがクライアントサイドでハイドレーション（`client:load` 等）される場合、JavaScriptの実行タイミングによってはDOMツリーへのマウントが完了しておらず、要素が見つからずにテストがタイムアウト（Flaky）するケースがあります。

**回避策:**
対象となるUI要素が、クライアントサイドでのマウント後に確実に表示されるように `useEffect` (mounted ステートなど) を用いて制御し、サーバーサイドレンダリング(SSR)時点とクライアントサイドでの状態の差異（Hydration Mismatch）を防ぎつつ、E2Eテスト側でも要素が表示されるまで確実に待機する設計にしてください。

```tsx
// Reactコンポーネント側の実装例
import { useState, useEffect } from 'react';

export function FileUploader() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // ハイドレーション前（あるいはプレースホルダー）
    return <div className="animate-pulse h-10 w-full bg-muted rounded-md" />;
  }

  // ハイドレーション後に実際の要素を描画
  return <input type="file" /* ... */ />;
}
```

E2Eテスト側（Playwright）での待機:

```typescript
// テストコード側
// selectorが確実にDOM上に現れ、操作可能(attach/visible)になるのを待ってから処理する
const fileInput = page.locator('input[type="file"]');
await fileInput.waitFor({ state: 'attached' });
await fileInput.setInputFiles('...');
```
