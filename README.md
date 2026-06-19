# News Picker: Next.js → React + Rails 移行計画

## Context

News Pickerは、ユーザーが登録したキーワード(Interest)に基づきTavily APIでニュースを収集し、Google AIで要約・フィルタリングしてパーソナライズされたニュースを表示するWebアプリ。現在Next.js 15で構築されているが、フロントエンドをReact (Vite) + TanStack Query、バックエンドをRails APIに分離・再構築する。

## 決定事項

| 項目 | 現在 | 移行後 |
|------|------|--------|
| フロントエンド | Next.js 15 | React 19 + Vite + TypeScript |
| バックエンド | Next.js API Routes + Server Actions | Rails 7 API-only |
| DB | PostgreSQL (Neon) + Prisma | PostgreSQL + ActiveRecord |
| 認証 | Clerk | Devise |
| 状態管理 | Jotai | TanStack Query |
| ルーティング | Next.js App Router | React Router v7 |
| UI | shadcn/ui + Tailwind CSS 4 | shadcn/ui + Tailwind CSS 4 (継続) |
| バックグラウンド処理 | n8n外部ワークフロー | Sidekiq + Redis |
| ニュースAPI | Tavily (n8n経由) | Tavily (Rails直接) |
| AI処理 | Google AI (n8n経由) | Google AI (Rails直接) |
| HTTPクライアント(FE) | N/A (Server Components) | fetch API |
| デプロイ | N/A | AWS (ECS + S3/CloudFront) |
| リポジトリ | 単一Next.jsプロジェクト | モノレポ (frontend/ + backend/) |

---

## モノレポ構成

```
News-Picker/
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui (現在のsrc/components/ui/を移植)
│   │   │   ├── layout/          # Header, Sidebar, Footer
│   │   │   ├── dashboard/       # NewsCard, NewsList, NewsPane
│   │   │   ├── interest/        # InterestList, CreateInterest, EditInterest, DeleteInterest
│   │   │   ├── detail/          # NewsDetailCard
│   │   │   ├── auth/            # LoginForm, SignUpForm, AuthGuard
│   │   │   └── landing/         # LandingPageContent
│   │   ├── hooks/               # TanStack Query カスタムフック
│   │   │   ├── useAuth.ts
│   │   │   ├── useNews.ts
│   │   │   ├── useInterests.ts
│   │   │   └── useUser.ts
│   │   ├── lib/
│   │   │   ├── api.ts           # fetch ラッパー + トークン管理
│   │   │   └── utils.ts         # cn() ユーティリティ
│   │   ├── types/
│   │   │   └── index.ts         # 型定義
│   │   ├── routes/
│   │   │   └── index.tsx        # React Router v7 ルート定義
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx   # 認証コンテキスト
│   │   ├── utils/
│   │   │   └── formatDate.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css            # Tailwind globals
│   ├── components.json          # shadcn/ui設定
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                     # Rails API
│   ├── app/
│   │   ├── models/
│   │   │   ├── user.rb
│   │   │   ├── interest.rb
│   │   │   └── news.rb
│   │   ├── controllers/
│   │   │   └── api/
│   │   │       └── v1/
│   │   │           ├── auth/
│   │   │           │   ├── registrations_controller.rb
│   │   │           │   └── sessions_controller.rb
│   │   │           ├── interests_controller.rb
│   │   │           ├── news_controller.rb
│   │   │           └── users_controller.rb
│   │   ├── serializers/
│   │   │   ├── user_serializer.rb
│   │   │   ├── interest_serializer.rb
│   │   │   └── news_serializer.rb
│   │   ├── services/
│   │   │   ├── tavily_service.rb       # Tavily API呼び出し
│   │   │   └── ai_summary_service.rb   # Google AI要約
│   │   └── jobs/
│   │       └── fetch_news_job.rb       # Sidekiq: Interest→Tavily→AI→DB
│   ├── config/
│   │   ├── routes.rb
│   │   ├── initializers/
│   │   │   ├── cors.rb
│   │   │   ├── devise.rb
│   │   │   └── sidekiq.rb
│   │   └── sidekiq.yml
│   ├── db/
│   │   ├── migrate/
│   │   └── schema.rb
│   ├── Gemfile
│   └── ...
└── README.md
```

---

## Phase 1: Rails バックエンド構築

### 1-1. Rails プロジェクト初期化

```bash
cd News-Picker/
rails new backend --api --database=postgresql --skip-test
```

### 1-2. 主要Gem

```ruby
# Gemfile
gem 'devise'
gem 'rack-cors'
gem 'jsonapi-serializer'    # JSON整形
gem 'sidekiq'               # バックグラウンドジョブ
gem 'sidekiq-scheduler'     # 定期実行
gem 'faraday'               # HTTP client (Tavily, Google AI)
gem 'redis'
```

### 1-3. ActiveRecord モデル

現在のPrismaスキーマから移行:

```ruby
# User
class User < ApplicationRecord
  devise :database_authenticatable, :registerable, :validatable

  has_many :interests, foreign_key: :user_id, dependent: :destroy
  has_many :news, foreign_key: :user_id, dependent: :destroy

  validates :display_name, presence: true
end

# Interest
class Interest < ApplicationRecord
  belongs_to :user
  validates :keyword, presence: true, length: { maximum: 20 }
end

# News
class News < ApplicationRecord
  belongs_to :user
  validates :title, :url, presence: true
end
```

**マイグレーション:**

```ruby
# users
create_table :users do |t|
  t.string :display_name, null: false
  t.string :profile_image
  # devise が email, encrypted_password 等を追加
  t.timestamps
end

# interests
create_table :interests do |t|
  t.references :user, null: false, foreign_key: true
  t.string :keyword, null: false
  t.timestamps
end

# news
create_table :news do |t|
  t.references :user, null: false, foreign_key: true
  t.string :title, null: false
  t.text :text         # AI要約テキスト
  t.string :url, null: false
  t.string :tag        # 対応するInterestキーワード
  t.datetime :published_at
  t.timestamps
end
```

### 1-4. API エンドポイント

```ruby
# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Devise認証エンドポイント
      post 'auth/sign_up', to: 'auth/registrations#create'
      post 'auth/sign_in', to: 'auth/sessions#create'
      delete 'auth/sign_out', to: 'auth/sessions#destroy'

      resources :interests, only: [:index, :create, :update, :destroy]
      resources :news, only: [:index, :show]
      resource :user, only: [:show, :update]  # 自分のプロフィール
    end
  end
end
```

**エンドポイント一覧:**

| メソッド | パス | 説明 | 現在の対応 |
|----------|------|------|------------|
| POST | /api/v1/auth/sign_up | ユーザー登録 | Clerk sign-up |
| POST | /api/v1/auth/sign_in | ログイン | Clerk sign-in |
| DELETE | /api/v1/auth/sign_out | ログアウト | Clerk |
| GET | /api/v1/user | 自分の情報取得 | useAuth/useUser |
| GET | /api/v1/interests | Interest一覧 | fetchInterests() |
| POST | /api/v1/interests | Interest作成 | postInterestAction() |
| PATCH | /api/v1/interests/:id | Interest更新 | updateInterestAction() |
| DELETE | /api/v1/interests/:id | Interest削除 | deleteInterestAction() |
| GET | /api/v1/news | ニュース一覧 | fetchUserNews() |
| GET | /api/v1/news/:id | ニュース詳細 | currentNewsAtom |

### 1-5. CORS 設定

```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:5173'  # Vite dev server
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

### 1-6. バックグラウンドジョブ (Sidekiq)

n8nワークフローをRailsに内包:

```ruby
# app/jobs/fetch_news_job.rb
class FetchNewsJob < ApplicationJob
  queue_as :default

  def perform(interest_id)
    interest = Interest.find(interest_id)
    # 1. Tavily APIでニュース検索
    articles = TavilyService.search(interest.keyword)
    # 2. Google AIで要約・フィルタリング
    summarized = AiSummaryService.summarize(articles, interest.keyword)
    # 3. DBに保存
    summarized.each do |article|
      interest.user.news.create!(
        title: article[:title],
        text: article[:summary],
        url: article[:url],
        tag: interest.keyword,
        published_at: article[:published_at]
      )
    end
  end
end

# app/services/tavily_service.rb
class TavilyService
  ENDPOINT = 'https://api.tavily.com/search'

  def self.search(query)
    conn = Faraday.new(url: ENDPOINT)
    response = conn.post do |req|
      req.headers['Content-Type'] = 'application/json'
      req.body = {
        api_key: ENV['TAVILY_API_KEY'],
        query: query,
        search_depth: 'basic',
        include_answer: false,
        max_results: 10
      }.to_json
    end
    JSON.parse(response.body)['results']
  end
end

# app/services/ai_summary_service.rb
class AiSummaryService
  def self.summarize(articles, keyword)
    # Google Generative AI APIを使用
    # Faradayで https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent を呼び出す
  end
end
```

**Interest作成時にジョブをキック:**

```ruby
# app/controllers/api/v1/interests_controller.rb
def create
  interest = current_user.interests.build(interest_params)
  if interest.save
    FetchNewsJob.perform_later(interest.id)  # 非同期でニュース取得開始
    render json: InterestSerializer.new(interest), status: :created
  else
    render json: { errors: interest.errors }, status: :unprocessable_entity
  end
end
```

---

## Phase 2: React フロントエンド構築

### 2-1. Vite プロジェクト初期化

```bash
cd News-Picker/
npm create vite@latest frontend -- --template react-ts
```

### 2-2. 主要パッケージ

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.0.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.64.0",
    "@hookform/resolvers": "^5.0.0",
    "zod": "^4.0.0",
    "jotai": "^2.15.0",
    "react-day-picker": "^9.0.0",
    "sonner": "^2.0.0",
    "lucide-react": "^0.544.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^3.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-label": "^1.0.0",
    "@radix-ui/react-separator": "^1.0.0",
    "@radix-ui/react-slot": "^1.0.0",
    "@radix-ui/react-tooltip": "^1.0.0",
    "class-variance-authority": "^0.7.0"
  }
}
```

**注意:**
- **axiosは使わない** → ネイティブの `fetch` API を使用
- Jotaiは純粋なUI状態（selectedDate, selectedInterest等）のために残す。サーバーデータはTanStack Queryに移行。

### 2-3. API クライアント（fetch API ベース）

```typescript
// src/lib/api.ts
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth-token');
  if (!token) return {};
  return { 'Authorization': `Bearer ${token}` };
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

### 2-4. React Router v7 ルート定義

```typescript
// src/routes/index.tsx
import { createBrowserRouter } from 'react-router';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/sign-in',
    element: <SignInPage />,
  },
  {
    path: '/sign-up',
    element: <SignUpPage />,
  },
  {
    // 認証が必要なルート
    element: <AuthGuard />,
    children: [
      {
        element: <DashboardLayout />,  // Sidebar + Header
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
        ],
      },
      {
        path: '/news/:newsId',
        element: <NewsDetailPage />,
      },
    ],
  },
]);
```

### 2-5. TanStack Query カスタムフック

```typescript
// src/hooks/useNews.ts
export const useNews = (filters?: { date?: string; tag?: string }) => {
  return useQuery({
    queryKey: ['news', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.date) params.set('date', filters.date);
      if (filters?.tag) params.set('tag', filters.tag);
      return api<NewsItem[]>(`/news?${params}`);
    },
  });
};

// src/hooks/useInterests.ts
export const useInterests = () => {
  return useQuery({
    queryKey: ['interests'],
    queryFn: () => api<Interest[]>('/interests'),
  });
};

export const useCreateInterest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keyword: string) =>
      api('/interests', { method: 'POST', body: JSON.stringify({ keyword }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interests'] }),
  });
};

export const useUpdateInterest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, keyword }: { id: number; keyword: string }) =>
      api(`/interests/${id}`, { method: 'PATCH', body: JSON.stringify({ keyword }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interests'] }),
  });
};

export const useDeleteInterest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api(`/interests/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interests'] }),
  });
};

// src/hooks/useAuth.ts
export const useSignIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api('/auth/sign_in', { method: 'POST', body: JSON.stringify({ email, password }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['currentUser'] }),
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api<User>('/user'),
    retry: false,
  });
};
```

### 2-6. 認証コンテキスト

```typescript
// src/contexts/AuthContext.tsx
// useCurrentUser() の結果をContextで共有
// AuthGuard コンポーネントで未認証時にリダイレクト
// ログイン/ログアウトでlocalStorageのトークンを管理
```

### 2-7. Jotai 残存用途（UIローカル状態のみ）

```typescript
// src/store/index.ts
export const selectedDateAtom = atom<Date | undefined>(undefined);
export const selectedInterestAtom = atom<string | undefined>(undefined);
// currentNewsAtom は不要 → React Router v7のパラメータ + useQuery で取得
```

---

## Phase 3: コンポーネント移行

### 移行対象マッピング

| 現在のファイル | 移行先 | 変更点 |
|--------------|--------|--------|
| `src/components/ui/*` | `frontend/src/components/ui/*` | そのまま移植。`next/image` → `<img>`, `next/link` → React Router `<Link>` |
| `LandingPageContent.tsx` | `frontend/src/components/landing/` | `next/image` → `<img>`, `next/link` → `<Link>` |
| `Header.tsx` | `frontend/src/components/layout/Header.tsx` | Clerk UserButton → 自作UserMenu |
| `SidebarPane.tsx` | `frontend/src/components/layout/Sidebar.tsx` | 構造はそのまま |
| `CalendarComponent.tsx` | `frontend/src/components/dashboard/Calendar.tsx` | そのまま (react-day-picker) |
| `Interest CRUD系` | `frontend/src/components/interest/` | Server Actions → useMutation |
| `NewsList/NewsCard` | `frontend/src/components/dashboard/` | Server Component → useQuery |
| `NewsDetailCard` | `frontend/src/components/detail/` | Jotai atom → useQuery + router params |
| `AuthAvatar/GuestLogin` | `frontend/src/components/auth/` | Clerk → Devise認証フォーム |

### 主要な変更パターン

1. **`"use client"` ディレクティブ**: 全て削除（Vite Reactでは不要）
2. **`next/image`** → `<img>` タグ（または別の画像最適化ライブラリ）
3. **`next/link`** → React Router `<Link>`
4. **`next/navigation`** (useRouter, useSearchParams) → React Router hooks (useNavigate, useSearchParams)
5. **Server Actions** → TanStack Query useMutation + fetch API
6. **Server Components (async)** → useQuery + Loading/Error状態
7. **`revalidatePath()`** → `queryClient.invalidateQueries()`
8. **Clerk hooks** (useAuth, useUser) → 自作AuthContext + useCurrentUser

---

## Phase 4: ニュースフィルタリングの移行

現在クライアントサイドフィルタリング（Jotai atom + `filteringNews.ts`）を使用。

**推奨:** Rails APIのクエリパラメータでフィルタリング（`GET /news?date=2024-01-01&tag=technology`）。
- DB側でフィルタする方がパフォーマンスが良い
- データ量が増えても対応可能
- TanStack Queryのキャッシュキーにフィルタを含めるだけで実装が簡潔

```ruby
# app/controllers/api/v1/news_controller.rb
def index
  news = current_user.news.order(published_at: :desc)
  news = news.where('DATE(published_at) = ?', params[:date]) if params[:date]
  news = news.where(tag: params[:tag]) if params[:tag]
  render json: NewsSerializer.new(news)
end
```

---

## Phase 5: 実装順序

### Step 1: プロジェクト基盤 (1-2日)
- [ ] モノレポ構造を作成 (`frontend/`, `backend/`)
- [ ] Rails API-onlyアプリの初期化
- [ ] Vite + React + TypeScript プロジェクトの初期化
- [ ] Tailwind CSS + shadcn/ui のセットアップ（`frontend/`）
- [ ] shadcn/uiコンポーネントの移植

### Step 2: 認証 (1-2日)
- [ ] Devise のセットアップ
- [ ] User モデル + マイグレーション
- [ ] 認証API（登録・ログイン・ログアウト）
- [ ] CORS設定
- [ ] フロントエンド: fetch APIラッパー + AuthContext
- [ ] フロントエンド: ログイン/サインアップページ + AuthGuard

### Step 3: Interest CRUD (1日)
- [ ] Interest モデル + マイグレーション
- [ ] InterestsController (index, create, update, destroy)
- [ ] フロントエンド: useInterests, useCreateInterest, useUpdateInterest, useDeleteInterest フック
- [ ] フロントエンド: Interest UI (CreateInterest, EditInterest, DeleteInterest ダイアログ)

### Step 4: ニュースデータとダッシュボード (1-2日)
- [ ] News モデル + マイグレーション
- [ ] NewsController (index, show) + フィルタリング
- [ ] フロントエンド: useNews フック
- [ ] フロントエンド: DashboardLayout (Sidebar + Header)
- [ ] フロントエンド: NewsList, NewsCard, CalendarComponent
- [ ] フロントエンド: NewsDetailPage

### Step 5: バックグラウンドジョブ (1-2日)
- [ ] Redis + Sidekiq セットアップ
- [ ] TavilyService (Tavily API呼び出し)
- [ ] AiSummaryService (Google AI呼び出し)
- [ ] FetchNewsJob (Interest作成時にキック)
- [ ] sidekiq-scheduler設定（定期的なニュース更新、必要に応じて）

### Step 6: ランディングページ + 仕上げ (1日)
- [ ] ランディングページの移植
- [ ] ルーティングの全体テスト
- [ ] エラーハンドリングの統一
- [ ] レスポンシブ確認

### Step 7: インフラ (CDK) (1-2日)
- [ ] CDKプロジェクト初期化（`infra/`）
- [ ] VPCスタック（パブリック/プライベートサブネット）
- [ ] データベーススタック（RDS db.t3.micro + ElastiCache）
- [ ] バックエンドスタック（ECS Fargate + ALB）
- [ ] フロントエンドスタック（S3 + CloudFront）
- [ ] backend/Dockerfile 作成
- [ ] `cdk deploy` で全体デプロイ検証
- [ ] `cdk destroy` でクリーンアップ確認

---

## 環境変数

### backend/.env
```
DATABASE_URL=postgresql://...
TAVILY_API_KEY=...
GOOGLE_AI_API_KEY=...
REDIS_URL=redis://localhost:6379
DEVISE_SECRET_KEY=...
```

### frontend/.env
```
VITE_API_URL=http://localhost:3000/api/v1
```

---

## AWS デプロイ構成（検証用・CDK管理）

検証用途のため、`cdk deploy` / `cdk destroy` でリソースを簡単に作成・削除できる構成。
CDKはTypeScriptで記述。カスタムドメイン(Route 53)は不要。

```
     ┌─────────────────┐      ┌─────────────────┐
     │  CloudFront     │      │  ALB            │
     │  (React SPA)    │      │  (API)          │
     └────────┬────────┘      └────────┬────────┘
              │                        │
     ┌────────▼────────┐      ┌────────▼────────┐
     │  S3 Bucket      │      │  ECS Fargate    │
     │  (静的ファイル)  │      │  (Rails API)    │
     └─────────────────┘      │  (Sidekiq)      │
                              └────────┬────────┘
                                       │
                         ┌─────────────┼─────────────┐
                         │                           │
                ┌────────▼────────┐         ┌────────▼────────┐
                │  RDS PostgreSQL │         │  ElastiCache     │
                │  (db.t3.micro)  │         │  (Redis)         │
                └─────────────────┘         └─────────────────┘
```

### リソース構成
- **S3 + CloudFront**: React SPAの静的ホスティング。CloudFrontのデフォルトドメインを使用
- **ECS Fargate**: Rails API (Webタスク) + Sidekiq (ワーカータスク) を別サービスで
- **ALB**: APIへのルーティング + ヘルスチェック。ALBのデフォルトDNS名を使用
- **RDS**: PostgreSQL db.t3.micro（シングルAZ、検証用で十分）
- **ElastiCache**: Redis（Sidekiqキューバックエンド）。cache.t3.micro

### モノレポにCDKを追加

```
News-Picker/
├── frontend/
├── backend/
└── infra/                       # CDK (TypeScript)
    ├── bin/
    │   └── infra.ts             # CDKエントリポイント
    ├── lib/
    │   ├── vpc-stack.ts         # VPC + サブネット
    │   ├── database-stack.ts    # RDS + ElastiCache
    │   ├── backend-stack.ts     # ECS Fargate (Rails + Sidekiq) + ALB
    │   └── frontend-stack.ts    # S3 + CloudFront
    ├── cdk.json
    ├── tsconfig.json
    └── package.json
```

### 追加で必要なファイル
- `backend/Dockerfile` - Rails API用
- `backend/docker-compose.yml` - ローカル開発用（PostgreSQL + Redis）
- `infra/` - CDKプロジェクト一式

---

## 検証方法

1. **認証テスト**: サインアップ → ログイン → 認証済みAPI呼び出し → ログアウト
2. **Interest CRUD**: 作成 → 一覧表示 → 編集 → 削除。作成時にバックグラウンドジョブが起動することを確認
3. **ニュース表示**: ダッシュボードでニュース一覧表示 → 日付フィルタ → Interestフィルタ → 詳細画面遷移
4. **バックグラウンドジョブ**: Sidekiq UIでジョブ実行確認。Tavily→AI要約→DB保存の全フロー
5. **レスポンシブ**: モバイル/デスクトップでサイドバーの動作確認
6. **Rails テスト**: `bundle exec rspec` (モデル・コントローラーテスト)
7. **フロントエンドテスト**: `npm run build` (TypeScript型チェック + ビルド確認)

---

## ハンズオンガイド

ステップバイステップの詳細ハンズオンは [docs/migration-guide/index.html](docs/migration-guide/index.html) を参照。

- **Rails**: 中級者向け。全ステップで「なぜこのコードが必要か」を詳細に解説
- **React**: 上級者向け。難所・移行パターンのポイントのみ
- **AWS (CDK)**: 中級者向け。フルステップバイステップ解説
