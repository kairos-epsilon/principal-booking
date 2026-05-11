# Principal Nail Salon — 予約管理システム

Next.js 16 (App Router) + Prisma 7 + PostgreSQL + NextAuth.js によるネイルサロン予約管理 Web アプリ。

## 技術スタック

| カテゴリ | 採用技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) / TypeScript / Tailwind CSS v4 |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| DB (本番) | Vercel Postgres / Railway / Supabase (PostgreSQL) |
| 認証 | NextAuth.js v4 (JWT + CredentialsProvider) |
| 決済 | Stripe |
| メール | Resend / Nodemailer |

---

## ローカル開発

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成し、各値を設定します。

```bash
cp .env.example .env.local
```

| 変数名 | 説明 |
|---|---|
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` で生成したランダム文字列 |
| `NEXTAUTH_URL` | ローカル: `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL 接続文字列（下記参照） |
| `STRIPE_SECRET_KEY` | Stripe シークレットキー（`sk_test_...`） |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 公開キー（`pk_test_...`） |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook シークレット（`whsec_...`） |
| `RESEND_API_KEY` | Resend API キー（`re_...`） |

> **PostgreSQL の準備**
> 以下のいずれかを使用できます（いずれも無料枠あり）。
> - [Railway](https://railway.app/) — DB 作成後に接続文字列をコピー
> - [Supabase](https://supabase.com/) — Project Settings → Database → Connection string
> - [Neon](https://neon.tech/) — サーバーレス PostgreSQL
> - ローカル Docker: `docker run -e POSTGRES_PASSWORD=password -p 5432:5432 postgres`

### 3. データベースのセットアップ

```bash
# マイグレーション実行
npx prisma migrate dev --name init

# 初期データ投入（スタッフ4名・メニュー10件・管理者アカウント）
npm run seed
```

### 4. 開発サーバー起動

```bash
npm run dev
# → http://localhost:3000
```

#### テストアカウント

| ロール | メール | パスワード |
|---|---|---|
| オーナー（管理者） | admin@principal.jp | admin1234 |
| 一般ユーザー | test@example.com | test1234 |

---

## Vercel へのデプロイ

### 1. GitHub リポジトリを作成して push

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/<your-org>/<repo>.git
git push -u origin main
```

### 2. Vercel でプロジェクトをインポート

[vercel.com/new](https://vercel.com/new) でリポジトリをインポートします。
Framework Preset は **Next.js** を選択（自動検出されます）。

### 3. 環境変数を設定

Vercel ダッシュボード → **Settings → Environment Variables** に以下を追加：

| 変数名 | 備考 |
|---|---|
| `DATABASE_URL` | Vercel Postgres または Railway の接続文字列 |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` の出力 |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `STRIPE_SECRET_KEY` | Stripe 本番シークレットキー |
| `STRIPE_PUBLISHABLE_KEY` | Stripe 本番公開キー |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 同上（`NEXT_PUBLIC_` プレフィックス付き） |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook シークレット |
| `RESEND_API_KEY` | Resend API キー |

#### Vercel Postgres を使う場合

Vercel ダッシュボード → **Storage → Create Database → Postgres** で DB を作成すると、
`DATABASE_URL` などの環境変数がプロジェクトに自動連携されます。

### 4. デプロイ後のマイグレーション

初回デプロイ後、ローカルから本番 DB にマイグレーションを実行します。

```bash
# Vercel CLI でローカルに本番環境変数を取得
npx vercel env pull .env.production.local

# マイグレーション実行
DATABASE_URL="<本番のDATABASE_URL>" npx prisma migrate deploy

# 初期データ投入（初回のみ）
DATABASE_URL="<本番のDATABASE_URL>" npm run seed
```

### 5. Stripe Webhook の設定

Stripe ダッシュボード → **Developers → Webhooks → エンドポイントを追加**

- URL: `https://your-app.vercel.app/api/stripe/webhook`
- リッスンするイベント: `payment_intent.succeeded`
- 生成されたシークレットを `STRIPE_WEBHOOK_SECRET` に設定

---

## ページ一覧

| パス | 説明 | 認証 |
|---|---|---|
| `/` | トップページ（メニュー・スタッフ紹介） | 不要 |
| `/auth` | ログイン / 新規登録 | 不要 |
| `/booking` | 予約フロー（5ステップ） | 必要 |
| `/mypage` | 予約履歴・キャンセル | 必要 |
| `/admin` | 管理ダッシュボード | STAFF / OWNER |
| `/admin/bookings` | 予約管理（日付フィルタ・ステータス変更） | STAFF / OWNER |
| `/admin/customers` | 顧客管理（検索） | STAFF / OWNER |
| `/admin/staff` | スタッフ管理（編集） | OWNER |
| `/admin/sales` | 売上集計（月別・スタッフ別） | STAFF / OWNER |

## ディレクトリ構成

```
principal-booking/
├── app/
│   ├── page.tsx              # トップページ
│   ├── auth/page.tsx         # ログイン / 新規登録
│   ├── booking/page.tsx      # 予約フロー
│   ├── mypage/page.tsx       # マイページ
│   └── admin/               # 管理画面（要認証）
├── lib/
│   ├── prisma.ts             # Prisma クライアント
│   └── auth.ts               # NextAuth 設定
├── prisma/
│   ├── schema.prisma         # DB スキーマ
│   ├── migrations/           # マイグレーション
│   └── seed.ts               # 初期データ
├── types/
│   └── next-auth.d.ts        # NextAuth 型拡張
├── .env.example              # 環境変数テンプレート
└── vercel.json               # Vercel ビルド設定
```
