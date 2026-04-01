# 日本株版 Dexter — タスク分解
> 最終更新: 2026-04-01

## Phase 1: MVP（5日）

### 1.1 プロジェクト初期化
- [ ] Next.js 15 プロジェクト作成（App Router, TypeScript, TailwindCSS）
- [ ] shadcn/ui セットアップ
- [ ] Prisma + PostgreSQL セットアップ（DBスキーマ作成）
- [ ] Redis セットアップ（キャッシュ用）
- [ ] 環境変数テンプレート（.env.example）
- [ ] ESLint + Prettier 設定

### 1.2 Dexter Agent Core 移植
- [ ] Dexterのエージェントループ（agent.ts）を移植
- [ ] プロンプト（prompts.ts）を日本語に最適化
- [ ] LLMクライアント（model/llm.ts）セットアップ（Claude + OpenAI対応）
- [ ] ツールレジストリ（tools/registry.ts）を日本株ツール用に再構成
- [ ] スクラッチパッド（分析ログ）機能の移植
- [ ] コンテキスト圧縮（compact.ts）の移植

### 1.3 J-Quants APIアダプター
- [ ] APIクライアント実装（認証、エラーハンドリング、キャッシュ）
- [ ] getJPStockPrice — 株価スナップショット
- [ ] getJPStockPrices — 期間株価（日足/週足/月足）
- [ ] getJPFinancials — 財務諸表（決算短信: PL/BS/CF）
- [ ] getJPCompanyInfo — 企業情報・銘柄一覧
- [ ] getJPEarningsCalendar — 決算カレンダー
- [ ] screenJPStocks — 条件スクリーニング（PER/PBR/配当利回り等）
- [ ] compareJPStocks — 銘柄比較（メタツール）

### 1.4 EDINET APIアダプター（基本）
- [ ] APIクライアント実装（認証、エラーハンドリング）
- [ ] getEdinetFilings — 提出書類一覧
- [ ] readEdinetFiling — XBRL取得→テキスト変換（基本版）
- [ ] 会計基準名寄せ（JP GAAP / IFRS マッピング）

### 1.5 Web UI
- [ ] チャット画面（chat-panel, chat-input, chat-message）
- [ ] SSEストリーミング（思考過程 + ツール実行 + 回答をリアルタイム表示）
- [ ] thinking-indicator（AIが考え中の表示）
- [ ] 分析結果のリッチ表示（テーブル、数値ハイライト）
- [ ] 株価チャート表示（Recharts）
- [ ] レスポンシブ対応（モバイルファースト）
- [ ] ダークモード対応
- [ ] 銘柄検索オートコンプリート

### 1.6 API Routes
- [ ] POST /api/chat — チャットエンドポイント（SSE）
- [ ] GET /api/search — 銘柄検索
- [ ] エラーハンドリング + レート制限

## Phase 2: 認証・課金・LP（5日）

### 2.1 認証
- [ ] NextAuth.js セットアップ
- [ ] メール+パスワード認証
- [ ] Google OAuth
- [ ] ログイン/登録ページUI
- [ ] セッション管理

### 2.2 Stripe課金
- [ ] Stripe連携（既存パターン流用）
- [ ] Checkout Session作成
- [ ] Webhook受信（payment_intent.succeeded等）
- [ ] プラン管理（Free/Pro/Premium）
- [ ] 利用回数カウント + 制限エンフォース
- [ ] プラン変更UI
- [ ] 請求履歴表示

### 2.3 LP（ランディングページ）
- [ ] ヒーローセクション（コンセプト + デモ動画/GIF）
- [ ] 課題提起セクション（個人投資家の5つの悩み）
- [ ] 機能紹介セクション（使用シーン × 5）
- [ ] ChatGPTとの比較セクション
- [ ] 料金プランセクション
- [ ] FAQ
- [ ] CTA（無料で試す）
- [ ] 免責事項・利用規約・プライバシーポリシー

### 2.4 ダッシュボード
- [ ] 分析履歴一覧
- [ ] 利用状況表示（今月の残り回数）
- [ ] アカウント設定

## Phase 3: 拡張・デプロイ（3日）

### 3.1 EDINET深堀り
- [ ] 有価証券報告書の全文解析（セクション分割）
- [ ] リスク情報の自動抽出
- [ ] 経営方針・事業戦略の要約

### 3.2 追加機能
- [ ] PDF出力（分析結果のレポート化）
- [ ] ウォッチリスト（お気に入り銘柄）
- [ ] 決算カレンダー表示（ウォッチリスト銘柄の決算日）
- [ ] 分析結果の共有リンク生成

### 3.3 デプロイ
- [ ] Dockerfile作成
- [ ] docker-compose.yml作成
- [ ] nginx リバースプロキシ設定
- [ ] SSL設定（Let's Encrypt）
- [ ] VPSデプロイ + 動作確認
- [ ] ドメイン設定（未確定）
