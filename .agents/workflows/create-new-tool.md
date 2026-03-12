---
description: Code:Life Cafe 用の新しいツールを追加する手順
---
# 新しいツールの追加ワークフロー

このワークフローは、`tools.codelife.cafe` に新しいツールを追加する際の手順です。

## 1. 事前準備 (Implementation Plan)
**コードを書き始める前に、必ず `Implementation Plan`（実装計画）を作成し、ユーザーに提案して承認を得てください。**
計画には、ツール名、機能概要、実装する純粋関数の仕様、作成するReactコンポーネントとAstroページの構成を含めてください。

## 2. 実装手順
計画が承認されたら、以下の順序で実装を進めてください。

1. **ロジック実装:** `src/lib/tools/[tool-name].ts` にビジネスロジックを純粋関数として実装します。
2. **UI実装:** `src/components/tools/[ToolName].tsx` にReact UIコンポーネントを作成します。
3. **ページ作成:** `src/pages/[tool-name].astro` を作成し、`ToolLayout.astro` でラップします。（`src/pages/` 直下に配置）
4. **トップページ導線:** `src/pages/index.astro` に `ToolCard` を追加します（Bento Grid）。
5. **ナビゲーション導線:** `src/components/layout/Navigation.astro` にリンクを追加します。
6. **検索モーダル連携:** `src/components/common/SearchModal.tsx` の `TOOLS` 配列にエントリを追加します。
7. **E2Eテスト:** `tests/e2e/[tool-name].spec.ts` にE2Eテストを作成します。
8. **ドキュメント更新:** `README.md` のツール一覧を更新します。
