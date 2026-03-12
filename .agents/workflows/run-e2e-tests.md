---
description: Code:Life Cafe の E2Eテストを実行・デバッグする手順
---
# E2Eテスト実行・デバッグワークフロー

このワークフローは、Playwrightを使用したE2Eテストの実行とトラブルシューティング手順です。

## テストの構成

- **テストファイル配置:** `tests/e2e/`
- **共通フィクスチャ:** `tests/e2e/fixtures/base.ts` (広告ブロック、`createToolPage` ヘルパーなど)
- **ページヘルパー:** `tests/e2e/helpers/tool-page.ts` (`ToolPage` クラス: goto, expectSafetyBadgeなど)
- **自動実行 (CI):** PR作成時に `.github/workflows/e2e.yml` で自動実行されます (chromium + mobile-chrome)。

## 実行コマンド

### ■ ローカルで実行 (推奨)
Windows環境等でファイアウォールにブロックされたり、動作を目視確認したい場合は `--headed` モードを使用してください。

```bash
npx playwright test --project=chromium --headed
```

### ■ 詳細表示で実行
どのテストが実行されているか、どこで失敗したかを確認しやすいリスト形式で表示します。

```bash
npx playwright test --project=chromium --headed --reporter=list
```

## トラブルシューティング

CIでテストが落ちた場合や、ローカルでテストが不安定（Flaky）な場合は、以下の手順で原因特定を進めてください。

1. **ローカルで `--headed` 実行:** ブラウザの動きを目視し、意図した要素が表示されているか、クリックできているかを確認します。
2. **タイムアウトの確認:** 要素の読み込みが遅い場合や、処理に時間がかかっている場合は、テスト側の待機ロジック (`waitForSelector` など) を見直します。
3. **特有の挙動の確認:** `astro-react-integration` スキル（`.agents/skills/astro-react-integration.md`）を参照し、AstroのViewTransitionやReactのHydration起因の問題でないか確認します。
