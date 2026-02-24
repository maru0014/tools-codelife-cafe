# CODE:LIFE Tools

**仕事で安心して使える、完全クライアントサイド処理のWebツール集。**

すべてのデータ処理はお使いのブラウザ内で完結。サーバーへのデータ送信は一切ありません。

🔗 **[https://tools.codelife.cafe](https://tools.codelife.cafe)**

## 📦 収録ツール（12種）

### テキスト処理

| ツール | 説明 |
|--------|------|
| [全角⇔半角変換](/zenkaku-hankaku) | カタカナ・英数字・記号の全角⇔半角一括変換 |
| [文字数カウント](/char-count) | 文字数・バイト数（UTF-8/Shift-JIS）・行数をリアルタイムカウント |
| [テキスト差分](/text-diff) | 2つのテキストの差分を並列・インライン表示 |

### データ処理

| ツール | 説明 |
|--------|------|
| [JSON整形](/json-formatter) | JSONの整形・圧縮・バリデーション |
| [CSVビューア/エディタ](/csv-editor) | CSVをテーブル形式で閲覧・編集・エクスポート |
| [ダミーデータ生成](/dummy-data) | 日本語の氏名・住所・電話番号等の一括生成（JSON/CSV/TSV） |

### ユーティリティ

| ツール | 説明 |
|--------|------|
| [QRコード生成](/qr-generator) | テキスト・URLからQRコードを生成しPNG/SVGダウンロード |
| [Base64エンコード/デコード](/base64) | テキスト・ファイルのBase64変換、Data URI出力対応 |
| [和暦⇔西暦変換](/wareki-converter) | 和暦（令和・平成等）と西暦のリアルタイム相互変換 |

### 開発者向け

| ツール | 説明 |
|--------|------|
| [正規表現チェッカー](/regex-tester) | リアルタイムマッチング・置換・キャプチャグループ表示 |
| [SQLフォーマッター](/sql-formatter) | SQL文の整形（MySQL, PostgreSQL等の方言対応） |
| [個人情報マスキング](/masking) | メール・電話番号・カード番号等を自動検出してマスキング |

## 🛡️ セキュリティ

- **完全クライアントサイド処理** — データが外部サーバーに送信されることはありません
- **オープンソース** — コードはすべて公開されており、処理内容を誰でも確認できます

## 🏗️ 技術スタック

- **フレームワーク:** [Astro](https://astro.build/)（静的サイト生成）
- **UIコンポーネント:** React（Astro Islands） + [shadcn/ui](https://ui.shadcn.com/)
- **スタイリング:** Tailwind CSS v4
- **アイコン:** Lucide Icons
- **テスト:** Playwright（E2E）
- **ホスティング:** Cloudflare Pages
- **CI/CD:** GitHub Actions

## 🧞 コマンド

| コマンド | 説明 |
|----------|------|
| `npm install` | 依存パッケージをインストール |
| `npm run dev` | 開発サーバーを起動（`localhost:4321`） |
| `npm run build` | 本番用に静的ビルド（`dist/`） |
| `npm run preview` | ビルド結果をローカルプレビュー |
| `npx playwright test --headed` | E2Eテストを実行（ブラウザ表示あり） |

## 📄 ライセンス

MIT
