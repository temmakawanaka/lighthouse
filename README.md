# 灯台アプリ

現地へ行くほどコレクションが増える、日本の灯台GPSスタンプラリーです。「日本の灯台50選」全基と、50選外の「のぼれる灯台」2基を合わせた52基を収録し、ピン地図・現在地検索・半径300mのGPSチェックイン・スタンプ帳を提供します。「行きたい」、訪問日とメモ、旅程、スタンプは会員登録なしで端末に保存できます。現在地の緯度・経度そのものは保存しません。OpenStreetMapの地図表示時は、表示範囲のタイルを同サービスへ要求します。

通常はアプリ内の検証済みカタログだけで動作し、サーバーやデータベースを必要としません。既存のFastAPIバックエンドへ接続する構成も維持しています。

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

別のターミナルを開き、依存関係を準備します。

```powershell
cd frontend
npm install
```

開発サーバーを起動します。

```powershell
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

既定では同梱カタログを使います。バックエンドへ接続するときだけ `.env.local` に次を設定します。

```dotenv
LIGHTHOUSE_DATA_SOURCE=api
LIGHTHOUSE_API_BASE_URL=http://localhost:8000
```

この2つの値は、API版のビルド時と起動時の両方に設定してください。

## 静的サイトとして公開

```powershell
cd frontend
npm run test:static
npm run preview:static
```

`test:static` は52基の詳細ページ、アセット、404応答、情報確認日を検証します。静的出力は `frontend/out` に生成されます。ルートで `npm run build` を実行すると、ホスティング用の `out` へまとめます。

## 画面

- `/`: 灯台一覧、検索、都道府県・参観可否による絞り込み、並び替え、ページング
- `/map/`: 日本地図、都道府県別一覧、端末内で計算する現在地からの距離順
- `/trip/`: 最大5基の訪問順、直線距離の目安、Google Mapsドライブルート、共有URL
- `/my-lighthouses/`: 「行きたい」、訪問日・メモ、記録と旅程のバックアップ・復元
- `/lighthouses/[slug]`: 灯台の歴史、諸元、参観情報、所在地、情報源

検索条件はURLへ保存されるため、再読み込みやブラウザの戻る操作でも状態を復元できます。
旅程の共有URLには灯台名・順序・予定日だけを含め、訪問メモは含めません。実写真は詳細用と一覧用のWebPへ変換して同梱しています。

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
npm run test:static
npm run build
npm run test:http-status
npm run test:e2e
npm run audit:production
npm run check:official
```

データ更新方針と確認記録は `docs/data-review-2026-09-09.md`、静的ホスティング構成は `docs/static-hosting.md`、写真と地図の帰属は `docs/image-credits.md` を参照してください。公式参観ページはGitHub Actionsが毎日変更候補を確認し、差分があればIssueを作成します（カタログの自動変更はしません）。

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
