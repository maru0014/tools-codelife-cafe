# AGENTS.md — CODE:LIFE Tools

## プロジェクト概要

`tools.codelife.cafe` — 完全クライアントサイド処理のWebツール集。
すべてのデータ処理はブラウザ内で完結し、サーバーへのデータ送信は一切行わない。

## 技術スタック

- **フレームワーク:** Astro（静的サイト生成）
- **UIコンポーネント:** React（Astro Islands, `client:load`）+ shadcn/ui
- **スタイリング:** Tailwind CSS v4（CSS-first設定、`@theme inline` で定義）
- **アイコン:** Lucide Icons
- **言語:** TypeScript（strict mode）
- **ページ遷移:** Astro View Transition API

## ディレクトリ構成

```
src/
├── components/
│   ├── ui/              # shadcn/ui コンポーネント（自動生成、手動編集しない）
│   ├── layout/          # Header, Footer, Navigation, SafetyBadge
│   ├── tools/           # 各ツールのReact UIコンポーネント
│   └── common/          # CopyButton, ThemeToggle, ToolCard, ToolLayout
├── layouts/
│   └── BaseLayout.astro # 全ページ共通レイアウト（SEO, OG, View Transitions）
├── pages/
│   ├── index.astro      # トップページ（Bento Grid）
│   ├── [tool-name].astro # 各ツールのAstroページ（直下に配置）
│   ├── privacy.astro
│   └── about.astro
├── lib/
│   ├── tools/           # ツールのビジネスロジック（純粋関数）
│   └── utils.ts         # shadcn/ui ユーティリティ（cn関数）
└── styles/
    └── global.css       # Tailwind CSS v4 設定、カラートークン、アニメーション
```

## 絶対に守るべきルール

1. **サーバーサイド処理を使わない** — APIコール、サーバー送信、外部通信は一切禁止（静的アセット配信を除く）
2. **日本語ファースト** — UI、エラーメッセージ、プレースホルダーすべて日本語
3. **ロジックとUIを分離する** — `src/lib/tools/` に純粋関数、`src/components/tools/` にReactコンポーネント
4. **新ツールは3ファイルで完結** — ロジック(`lib`) + コンポーネント(`component`) + ページ(`page`)

## 命名規約・コーディング規約

- **ファイル名（ページ・ロジック）:** kebab-case（例：`json-formatter.ts`, `json-formatter.astro`）
- **ファイル名（Reactコンポーネント）:** PascalCase（例：`JsonFormatter.tsx`）
- **コンポーネント名:** PascalCase（例：`export function JsonFormatter()`）
- **関数・変数:** camelCase（例：`formatJson`, `inputText`）
- **定数:** UPPER_SNAKE_CASE（例：`MAX_INPUT_LENGTH`）
- **型・インターフェース:** PascalCase（例：`type FormatOptions`）
- **インポートパス:** `@/` エイリアスを使用（例：`import { cn } from '@/lib/utils'`）
- **Linter:** Biome（`npx biome check`）。CI でも実行される
- **インデント:** タブ（Biome デフォルト）

## デザインシステム

- **カラー:** CSS変数で定義（`--primary`, `--accent`, `--safety` など）。`global.css` の `:root` と `.dark` を参照
- **フォント:** `Inter`（UI）、`Noto Sans JP`（日本語）、`JetBrains Mono`（コード）
- **ダークモード:** `.dark` クラスで切替。`localStorage` に保存
- **コンポーネント追加:** `npx shadcn@latest add [component]` を使用

## デプロイ

GitHub Actions（`.github/workflows/deploy.yml`）で `main` ブランチへのpush時に自動デプロイ。
Cloudflare Pages にデプロイされる。Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`。

## エージェントのタスク完了条件 (DoD)
- **Implementation Plan (実装計画)** が作成され、ユーザーの承認済みであること（新ツール作成・大幅改修時）
- 変更ファイルが必要なスコープ内に収まっていること
- **Walkthrough（実行やプレビューのスクリーンショット/録画）**、またはローカルE2Eテスト結果が提出されていること
