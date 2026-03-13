---
description: 新しいWebツールをプロジェクトに追加する（3ファイル構成）
---

新しいツールを追加してください。引数として `$ARGUMENTS` が渡されます（例：`/add-tool URLエンコーダー`）。

## 手順

### 1. 実装計画の作成（ユーザー承認必須）

以下の内容を含む実装計画を提示し、ユーザーの承認を得てから実装を開始してください：

- **ツール名**（日本語・英語）
- **slug**（URLパス、例：`url-encoder`）
- **カテゴリ**（テキスト変換 / テキスト解析 / 開発ツール / 生成ツール / ユーティリティ / データ処理）
- **カテゴリカラー**（`border-l-primary` / `border-l-accent` / `border-l-chart-1` ～ `border-l-chart-4`）
- **アイコン**（絵文字1文字）
- **主な機能**（箇条書き3〜5項目）
- **作成ファイル**（下記3ファイル）

### 2. 実装（承認後）

以下の3ファイルを作成してください：

#### ファイル1: `src/lib/tools/{slug}.ts`
- ツールのビジネスロジックのみ（純粋関数）
- UIに依存しない
- エラーメッセージは日本語

#### ファイル2: `src/components/tools/{ComponentName}.tsx`
- React コンポーネント（`client:load` 想定）
- shadcn/ui コンポーネントを使用（`@/components/ui/...`）
- Lucide アイコンを使用
- 日本語UIファースト（ラベル・プレースホルダー・エラーメッセージ）
- ロジックは `@/lib/tools/{slug}` からインポート
- `CopyButton`（`@/components/common/CopyButton`）を出力部分に配置

#### ファイル3: `src/pages/{slug}.astro`
- `ToolLayout` を使用（title・description・path を指定）
- `<ComponentName client:load />` を配置
- `slot="usage"` に使い方・ユースケース説明（`<details>` + 箇条書き）を記述

### 3. index.astro への追記

`src/pages/index.astro` のBento Grid に `<ToolCard>` を追加し、ツール数カウント（`15` 等の数字）を更新してください。

```astro
<ToolCard
  title="{日本語ツール名}"
  description="{説明文（40〜60文字程度）}"
  href="/{slug}"
  icon="{絵文字}"
  category="{カテゴリ}"
  categoryColor="{border-l-カラー変数}"
/>
```

### 4. ナビゲーション導線の追加

`src/components/layout/Navigation.astro` の `<ul>` 内に、ツールへのリンクを追加してください。

```astro
<li><a href="/{slug}" class="text-sm text-muted-foreground hover:text-foreground transition-colors">{日本語ツール名}</a></li>
```

### 5. 検索モーダルへの登録

`src/components/common/SearchModal.tsx` の `TOOLS` 配列にエントリを追加してください。

```typescript
{ id: '{slug}', name: '{日本語ツール名}', description: '{説明文}', href: '/{slug}', icon: '{絵文字}', category: '{カテゴリ}' },
```

### 6. E2Eテストの作成

`tests/e2e/{slug}.spec.ts` にPlaywrightテストを作成してください。既存テスト（例：`tests/e2e/base64.spec.ts`）を参考にし、以下を含めてください：

- ページの正常表示（タイトル・SafetyBadge）
- 主要機能の動作確認（入力→出力）
- `tests/e2e/fixtures/base.ts` の共通フィクスチャを使用

### 7. README更新

`README.md` のツール一覧に新しいツールを追加してください。

### 8. 完了報告

実装後、以下をユーザーに提示してください：

- 作成・編集したファイル一覧（リンク付き）
- `npm run build` の実行結果（型エラーがないこと）
- ローカル確認用コマンド（`npm run dev` → アクセスURL）
