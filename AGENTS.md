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
│   ├── tools/           # 各ツールのAstroページ
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

## 新しいツールの追加方法

1. `src/lib/tools/[tool-name].ts` — ビジネスロジックを純粋関数として実装
2. `src/components/tools/[ToolName].tsx` — React UIコンポーネントを作成
3. `src/pages/tools/[tool-name].astro` — `ToolLayout.astro` でラップするAstroページを作成
4. `src/pages/index.astro` に `ToolCard` を追加

## デザインシステム

- **カラー:** CSS変数で定義（`--primary`, `--accent`, `--safety` など）。`global.css` の `:root` と `.dark` を参照
- **フォント:** `Inter`（UI）、`Noto Sans JP`（日本語）、`JetBrains Mono`（コード）
- **ダークモード:** `.dark` クラスで切替。`localStorage` に保存
- **コンポーネント追加:** `npx shadcn@latest add [component]` を使用

## ビルド・開発

```bash
npm run dev      # 開発サーバー（http://localhost:4321）
npm run build    # 静的ビルド（dist/）
npm run preview  # ビルド結果プレビュー
```

## デプロイ

GitHub Actions（`.github/workflows/deploy.yml`）で `main` ブランチへのpush時に自動デプロイ。
Cloudflare Pages にデプロイされる。Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`。
