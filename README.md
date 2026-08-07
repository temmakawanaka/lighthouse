# 灯台アプリ

日本各地の灯台を検索し、歴史・諸元・参観情報を確認できるWebアプリです。FastAPIのバックエンドと、Next.jsのフロントエンドで構成しています。

## 技術スタック

### バックエンド

- FastAPI
- SQLAlchemy 2 async ORM
- Alembic migration
- PostgreSQL
- Pytest
- Ruff

### フロントエンド

- Next.js（App Router）
- React
- TypeScript
- Vitest / Testing Library
- ESLint

## ローカル開発

### 1. バックエンド

PostgreSQLを起動します。

```powershell
docker compose up -d db
```

バックエンド用の仮想環境を作成します。

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
Copy-Item .env.example .env
```

DB migrationを実行し、「のぼれる灯台16」のサンプルデータを投入します。

```powershell
alembic upgrade head
python -m scripts.seed_lighthouses
```

APIを起動します。

```powershell
uvicorn app.main:app --reload
```

バックエンドの確認先です。

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- OpenAPI JSON: http://localhost:8000/openapi.json

### 2. フロントエンド

別のターミナルを開き、依存関係と環境変数を準備します。

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
```

開発サーバーを起動します。

```powershell
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

フロントエンドは `LIGHTHOUSE_API_BASE_URL` で接続先APIを切り替えます。未設定時は `http://localhost:8000` を使用します。

## 画面

- `/`: 灯台一覧、検索、都道府県・参観可否による絞り込み、並び替え、ページング
- `/lighthouses/[slug]`: 灯台の歴史、諸元、参観情報、所在地、情報源

検索条件はURLへ保存されるため、再読み込みやブラウザの戻る操作でも状態を復元できます。

## APIの確認例

```powershell
Invoke-RestMethod "http://localhost:8000/api/v1/lighthouses"
Invoke-RestMethod "http://localhost:8000/api/v1/lighthouses?prefecture=千葉県"
Invoke-RestMethod "http://localhost:8000/api/v1/lighthouses?is_visitable=true"
Invoke-RestMethod "http://localhost:8000/api/v1/lighthouses?q=犬吠埼"
Invoke-RestMethod "http://localhost:8000/api/v1/lighthouses?limit=12&offset=0&sort_by=name&sort_order=asc"
Invoke-RestMethod "http://localhost:8000/api/v1/lighthouses/slug/inubosaki"
```

一覧API `GET /api/v1/lighthouses` は、ページングに必要な情報を含む形式で返します。

```json
{
  "items": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "name": "犬吠埼灯台",
      "slug": "inubosaki",
      "prefecture": "千葉県"
    }
  ],
  "total": 16,
  "limit": 12,
  "offset": 0,
  "has_more": true,
  "sort_by": "prefecture",
  "sort_order": "asc"
}
```

## 検証コマンド

バックエンド:

```powershell
cd backend
pytest
ruff check .
```

フロントエンド:

```powershell
cd frontend
npm run lint
npm run typecheck
npm test
npm run build
npm run test:http-status
npm run test:e2e
npm run audit:production
```

初回のE2Eテスト前に、Chromiumをインストールします。

```powershell
cd frontend
npx playwright install chromium
```

DBモデルを変更する場合は、Alembic migrationを作成して適用します。

```powershell
cd backend
alembic revision --autogenerate -m "変更内容の説明"
alembic upgrade head
```
