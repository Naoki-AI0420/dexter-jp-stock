# 日本株版 Dexter — タスク分解
> 最終更新: 2026-04-04（棚卸し実施）
> 60ファイル / 3,201行（src/）

## Phase 1: MVP（5日）

### 1.1 プロジェクト初期化
- [x] Next.js 15 プロジェクト作成（App Router, TypeScript, TailwindCSS）
- [x] shadcn/ui セットアップ
- [x] Prisma + PostgreSQL セットアップ（DBスキーマ作成）— 9モデル定義済み
- [x] Redis セットアップ（キャッシュ用）— ioredis導入済み
- [x] 環境変数テンプレート（.env.example）
- [x] ESLint + Prettier 設定

### 1.2 Dexter Agent Core 移植
- [x] Dexterのエージェントループ（agent.ts）を移植 — 133行
- [x] プロンプト（prompts.ts）を日本語に最適化 — 49行
- [x] LLMクライアント（model/llm.ts）セットアップ（Claude + OpenAI対応）
- [x] ツールレジストリ（tools/registry.ts）を日本株ツール用に再構成 — 66行
- [ ] スクラッチパッド（分析ログ）機能の移植 — 未実装
- [x] コンテキスト圧縮（compact.ts）の移植 — 8行（基本版）

### 1.3 J-Quants APIアダプター
- [x] APIクライアント実装（認証、エラーハンドリング、キャッシュ）— 43行
- [x] getJPStockPrice — 株価スナップショット — 87行
- [x] getJPStockPrices — 期間株価（日足/週足/月足）— stock-price.ts内
- [x] getJPFinancials — 財務諸表（決算短信: PL/BS/CF）— 53行
- [x] getJPCompanyInfo — 企業情報・銘柄一覧 — 49行
- [x] getJPEarningsCalendar — 決算カレンダー — 16行
- [x] screenJPStocks — 条件スクリーニング（PER/PBR/配当利回り等）— 32行
- [x] compareJPStocks — 銘柄比較（メタツール）— 31行

### 1.4 EDINET APIアダプター（基本）
- [x] APIクライアント実装（認証、エラーハンドリング）— 43行
- [x] getEdinetFilings — 提出書類一覧 — 23行
- [x] readEdinetFiling — XBRL取得→テキスト変換（基本版）— 212行（セクション分割含む）
- [ ] 会計基準名寄せ（JP GAAP / IFRS マッピング）— 未実装

### 1.5 Web UI
- [x] チャット画面（chat-panel, chat-input, chat-message）— 194行
- [x] SSEストリーミング（思考過程 + ツール実行 + 回答をリアルタイム表示）
- [x] thinking-indicator（AIが考え中の表示）— 8行
- [x] 分析結果のリッチ表示（テーブル、数値ハイライト）— financial-table 24行
- [x] 株価チャート表示（Recharts）— stock-chart 39行
- [ ] レスポンシブ対応（モバイルファースト）— 最低限のみ（sm:/md:が少数）
- [ ] ダークモード対応 — 未実装（tailwind dark: 未使用）
- [x] 銘柄検索オートコンプリート — stock-search 60行

### 1.6 API Routes
- [x] POST /api/chat — チャットエンドポイント（SSE）
- [x] GET /api/search — 銘柄検索
- [x] エラーハンドリング + レート制限 — rate-limit.ts 10行

## Phase 2: 認証・課金・LP（5日）

### 2.1 認証
- [x] NextAuth.js セットアップ — PrismaAdapter使用
- [x] メール+パスワード認証 — Credentials provider + bcryptjs
- [x] Google OAuth — Google provider設定済み
- [x] ログイン/登録ページUI — login/register page.tsx
- [x] セッション管理 — JWT strategy + middleware.ts

### 2.2 Stripe課金
- [x] Stripe連携（既存パターン流用）— lib/stripe.ts 28行
- [x] Checkout Session作成 — api/stripe/checkout
- [x] Webhook受信（payment_intent.succeeded等）— api/stripe/webhook
- [x] プラン管理（Free/Pro/Premium）— プラン定義あり
- [x] 利用回数カウント + 制限エンフォース — Usage model + dashboard
- [x] プラン変更UI — settings/billing 153行
- [x] 請求履歴表示 — Stripe Customer Portal経由

### 2.3 LP（ランディングページ）
- [x] ヒーローセクション（コンセプト + デモ動画/GIF）— 294行のLP
- [x] 課題提起セクション（個人投資家の5つの悩み）
- [x] 機能紹介セクション（使用シーン × 5）
- [x] ChatGPTとの比較セクション
- [x] 料金プランセクション
- [x] FAQ
- [x] CTA（無料で試す）
- [x] 免責事項・利用規約・プライバシーポリシー — 免責自動付与

### 2.4 ダッシュボード
- [x] 分析履歴一覧 — history/page.tsx 99行
- [x] 利用状況表示（今月の残り回数）— dashboard内
- [ ] アカウント設定 — settings/billing のみ（プロフィール編集なし）

## Phase 3: 拡張・デプロイ（3日）

### 3.1 EDINET深堀り
- [x] 有価証券報告書の全文解析（セクション分割）— SECTION_ELEMENTS定義済み
- [x] リスク情報の自動抽出 — RISK_SENTENCE_PATTERNS実装済み
- [ ] 経営方針・事業戦略の要約 — 未確認（strategy section extraction要確認）

### 3.2 追加機能
- [x] PDF出力（分析結果のレポート化）— api/export/pdf
- [x] ウォッチリスト（お気に入り銘柄）— api/watchlist + watchlist-section 127行
- [x] 決算カレンダー表示（ウォッチリスト銘柄の決算日）— api/calendar
- [x] 分析結果の共有リンク生成 — api/share + share/[id]/page.tsx

### 3.3 デプロイ
- [x] Dockerfile作成
- [x] docker-compose.yml作成（app + postgres + redis）
- [ ] nginx リバースプロキシ設定 — ファイルなし
- [ ] SSL設定（Let's Encrypt）
- [ ] VPSデプロイ + 動作確認
- [ ] ドメイン設定（未確定）

---

## サマリー（2026-04-04 棚卸し結果）

| Phase | 総タスク | 完了 | 未完了 | 進捗率 |
|---|---|---|---|---|
| Phase 1 | 28 | 23 | 5 | 82% |
| Phase 2 | 18 | 17 | 1 | 94% |
| Phase 3 | 10 | 6 | 4 | 60% |
| **合計** | **56** | **46** | **10** | **82%** |

### 未完了タスク一覧
1. スクラッチパッド（分析ログ）機能
2. 会計基準名寄せ（JP GAAP / IFRS マッピング）
3. レスポンシブ対応（モバイルファースト）— 強化が必要
4. ダークモード対応
5. アカウント設定ページ
6. 経営方針・事業戦略の要約
7. nginx リバースプロキシ設定
8. SSL設定（Let's Encrypt）
9. VPSデプロイ + 動作確認
10. ドメイン設定
