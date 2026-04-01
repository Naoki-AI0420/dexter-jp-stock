# 日本株版 Dexter — 設計書
> 最終更新: 2026-04-01

## 1. アーキテクチャ概要

```
┌─────────────────────────────────────────────────┐
│  Frontend (Next.js 15)                          │
│  ├── Chat UI (メイン画面)                        │
│  ├── Auth (NextAuth.js)                          │
│  ├── Dashboard (ウォッチリスト/履歴)               │
│  └── LP (ランディングページ)                      │
└──────────────┬──────────────────────────────────┘
               │ API Routes / Server Actions
┌──────────────▼──────────────────────────────────┐
│  Backend (Bun + Next.js API Routes)              │
│  ├── Agent Core (Dexter fork)                    │
│  │   ├── Planning Agent                          │
│  │   ├── Execution Agent                         │
│  │   ├── Validation Agent                        │
│  │   └── Response Agent                          │
│  ├── Tool Registry                               │
│  │   ├── J-Quants Tools (株価/財務/企業情報)       │
│  │   ├── EDINET Tools (有報/四半期報告)            │
│  │   ├── Web Search Tools (ニュース)              │
│  │   └── Analysis Tools (比較/スクリーニング)      │
│  ├── Auth Middleware                              │
│  ├── Rate Limiter                                │
│  └── Usage Tracker (プラン制限)                   │
└──────┬────────────┬─────────────────────────────┘
       │            │
┌──────▼───┐  ┌────▼──────────────────────┐
│ PostgreSQL│  │ External APIs              │
│ ├─ users  │  │ ├─ J-Quants API v2 (JPX)  │
│ ├─ sessions│ │ ├─ EDINET API v2 (金融庁)  │
│ ├─ chats  │  │ ├─ LLM (Claude/GPT)       │
│ └─ usage  │  │ └─ Web Search (Exa/Tavily) │
└──────────┘  └────────────────────────────┘
       │
┌──────▼───┐
│  Redis    │
│ ├─ cache  │ (API応答キャッシュ)
│ └─ rate   │ (レートリミット)
└──────────┘
```

## 2. ディレクトリ構成

```
dexter-jp-stock/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # 認証ページ群
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/        # ログイン後の画面
│   │   │   ├── chat/           # メインチャット画面
│   │   │   ├── history/        # 過去の分析履歴
│   │   │   └── settings/       # アカウント設定
│   │   ├── api/                # API Routes
│   │   │   ├── auth/           # NextAuth
│   │   │   ├── chat/           # チャットAPI（SSE）
│   │   │   └── webhooks/       # Stripe Webhook
│   │   ├── layout.tsx
│   │   └── page.tsx            # LP
│   ├── agent/                  # Dexter Agent Core (fork)
│   │   ├── agent.ts            # エージェントループ
│   │   ├── prompts.ts          # システムプロンプト（日本語）
│   │   ├── compact.ts          # コンテキスト圧縮
│   │   └── types.ts
│   ├── tools/                  # ツール群
│   │   ├── jquants/            # J-Quants APIアダプター
│   │   │   ├── api.ts          # API クライアント（認証/キャッシュ）
│   │   │   ├── stock-price.ts  # 株価取得
│   │   │   ├── financials.ts   # 財務データ取得
│   │   │   ├── company.ts      # 企業情報・銘柄一覧
│   │   │   ├── calendar.ts     # 決算カレンダー
│   │   │   └── index.ts
│   │   ├── edinet/             # EDINET APIアダプター
│   │   │   ├── api.ts          # EDINET APIクライアント
│   │   │   ├── filings.ts      # 書類一覧取得
│   │   │   ├── read-filing.ts  # XBRL解析→テキスト変換
│   │   │   └── index.ts
│   │   ├── search/             # Web検索
│   │   ├── analysis/           # 分析ツール
│   │   │   ├── compare.ts      # 銘柄比較
│   │   │   ├── screen.ts       # スクリーニング
│   │   │   └── valuation.ts    # バリュエーション判定
│   │   ├── registry.ts         # ツール登録
│   │   └── types.ts
│   ├── components/             # React UI コンポーネント
│   │   ├── chat/
│   │   │   ├── chat-input.tsx
│   │   │   ├── chat-message.tsx
│   │   │   ├── chat-panel.tsx
│   │   │   └── thinking-indicator.tsx
│   │   ├── analysis/
│   │   │   ├── financial-table.tsx
│   │   │   ├── stock-chart.tsx
│   │   │   └── comparison-card.tsx
│   │   ├── ui/                 # shadcn/ui
│   │   └── layout/
│   ├── lib/                    # ユーティリティ
│   │   ├── auth.ts
│   │   ├── db.ts               # Prisma client
│   │   ├── stripe.ts
│   │   ├── redis.ts
│   │   └── rate-limit.ts
│   └── model/                  # LLM接続
│       └── llm.ts
├── prisma/
│   └── schema.prisma           # DB スキーマ
├── public/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 3. データモデル（Prisma）

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String?
  image         String?
  plan          Plan      @default(FREE)
  stripeId      String?   @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  chats         Chat[]
  usage         Usage[]
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  sessionToken String   @unique
  expires      DateTime
}

model Chat {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  title     String?
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id        String   @id @default(cuid())
  chatId    String
  chat      Chat     @relation(fields: [chatId], references: [id])
  role      Role
  content   String   @db.Text
  metadata  Json?    // ツール呼び出し結果、チャート設定等
  createdAt DateTime @default(now())
}

model Usage {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  date      DateTime @db.Date
  queries   Int      @default(0)
  tokens    Int      @default(0)
  @@unique([userId, date])
}

enum Plan {
  FREE
  PRO
  PREMIUM
}

enum Role {
  USER
  ASSISTANT
  SYSTEM
  TOOL
}
```

## 4. J-Quants APIアダプター設計

### 認証フロー
```
1. APIキーをヘッダーに付与して各エンドポイントを呼ぶ
2. レスポンスはRedisにキャッシュ（株価: 5分、財務: 24h）
```

### 主要エンドポイント（V2）

| エンドポイント | 用途 | キャッシュ |
|---|---|---|
| GET /v2/equities/bars/daily | 日足株価 | 翌営業日まで |
| GET /v2/equities/info | 銘柄一覧・企業情報 | 24h |
| GET /v2/equities/statements | 財務諸表（決算短信） | 24h |
| GET /v2/equities/calendar | 決算カレンダー | 24h |
| GET /v2/markets/indices | 日経225/TOPIX等 | 5min |
| GET /v2/equities/bars/minute | 分足（Light+） | 1min |

### ツール定義

```typescript
// J-Quants用ツール（Dexterのfinance toolsを置き換え）
const jquantsTools = [
  getJPStockPrice,       // 株価スナップショット
  getJPStockPrices,      // 期間株価
  getJPFinancials,       // 財務諸表（PL/BS/CF）
  getJPCompanyInfo,      // 企業情報
  getJPEarningsCalendar, // 決算カレンダー
  screenJPStocks,        // 条件スクリーニング
  compareJPStocks,       // 銘柄比較
];
```

## 5. EDINET APIアダプター設計

### 認証
- APIキー（金融庁に申請して取得）

### フロー
```
1. /api/v2/documents.json?date=YYYY-MM-DD で提出書類一覧を取得
2. docIDで書類を特定
3. /api/v2/documents/{docID}?type=1 でXBRLをダウンロード
4. XBRLをパース → テキスト抽出
5. LLMに渡して分析
```

### XBRL解析の課題と対策
- **会計基準の違い**: JP GAAP / IFRS / US GAAPで項目名が異なる
- **対策**: edinetdb（名寄せ済みAPI）を活用 or 独自マッピングテーブル
- **企業独自拡張タグ**: element_idが企業固有
- **対策**: LLMにコンテキストとして渡し、意味を推論させる

## 6. エージェント プロンプト設計（日本語）

### システムプロンプト骨子
```
あなたは日本株の財務分析エージェントです。
個人投資家の質問に対して、データに基づいた正確な分析を提供します。

## 利用可能なデータ
- J-Quants API: 東証全銘柄の株価・財務データ（JPX公式）
- EDINET: 有価証券報告書・四半期報告書（金融庁公式）
- ウェブ検索: 最新ニュース・アナリストレポート

## 分析の原則
1. 必ずデータを取得してから回答する（推測で答えない）
2. 数字には出典を明記する
3. 「買い」「売り」の断定的表現は避け、「〜の観点からは割安/割高」のように表現する
4. リスク要因を必ず併記する
5. 分析の限界を正直に伝える

## 回答フォーマット
- 結論を先に述べる
- 根拠を箇条書きで示す
- 重要な数字はハイライトする
- 比較はテーブルで示す
```

## 7. API設計

### POST /api/chat
チャットエンドポイント（SSE ストリーミング）

**Request:**
```json
{
  "chatId": "string (optional, 新規作成時はnull)",
  "message": "トヨタの今期決算どうだった？"
}
```

**Response (SSE):**
```
event: thinking
data: {"step": "計画中: トヨタの最新決算データを取得します"}

event: tool_start
data: {"tool": "getJPFinancials", "args": {"code": "7203"}}

event: tool_end
data: {"tool": "getJPFinancials", "summary": "2025年度通期 売上高45.1兆円..."}

event: delta
data: {"content": "## トヨタ（7203）2025年度通期決算\n\n"}

event: delta
data: {"content": "### 結論\n営業利益は前期比..."}

event: done
data: {"chatId": "xxx", "messageId": "yyy"}
```

## 8. 認証・課金設計

### プラン構成（料金未確定）
| プラン | 分析回数/月 | EDINET分析 | PDF出力 | 料金 |
|---|---|---|---|---|
| Free | 5回 | ❌ | ❌ | ¥0 |
| Pro | 100回 | ✅ | ✅ | 未確定 |
| Premium | 無制限 | ✅ | ✅ | 未確定 |

### Stripe連携
- Checkout Session → 決済完了 → Webhook → プラン更新
- サブスクリプション（月額自動課金）
- 既存パターン（ezbookkeeping/sendportal-jp）を流用

## 9. デプロイ構成

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
      - JQUANTS_API_KEY=...
      - EDINET_API_KEY=...
      - OPENAI_API_KEY=...
      - STRIPE_SECRET_KEY=...
    depends_on:
      - postgres
      - redis
  postgres:
    image: postgres:16
    volumes: ["pgdata:/var/lib/postgresql/data"]
  redis:
    image: redis:7-alpine
    volumes: ["redisdata:/data"]
```

## 10. ChatGPTとの差別化（LP/マーケティング用）

| 項目 | ChatGPT | 日本株版Dexter |
|---|---|---|
| データの鮮度 | 学習データまで（数ヶ月前） | リアルタイム（JPX公式API） |
| 日本株の財務 | 一般的な知識のみ | 全銘柄の最新決算データ |
| 有価証券報告書 | 読めない | EDINET連携で全文分析 |
| スクリーニング | できない | 条件指定で銘柄抽出 |
| 根拠の明示 | 「〜と思われます」 | 具体的な数字+出典URL |
| 分析の深さ | 表面的 | マルチステップ自律分析 |
