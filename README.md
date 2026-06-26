# 灯台アプリ

灯台情報を扱うためのバックエンドAPIプロジェクトです。まずはFastAPIでAPIとDBを固め、将来的にフロントエンドを追加していく前提です。

## 技術スタック

- FastAPI
- SQLAlchemy 2 async ORM
- Alembic migration
- PostgreSQL
- Pytest
- Ruff

## ローカル開発

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

DB migrationを実行します。

```powershell
alembic upgrade head
```

「のぼれる灯台16」のサンプルデータを投入します。

```powershell
python -m scripts.seed_lighthouses
```

APIを起動します。

```powershell
uvicorn app.main:app --reload
```

起動後に確認するURLです。

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- OpenAPI JSON: http://localhost:8000/openapi.json

灯台APIの確認例です。

```powershell
Invoke-RestMethod "http://localhost:8000/api/v1/lighthouses"
Invoke-RestMethod "http://localhost:8000/api/v1/lighthouses?prefecture=千葉県"
Invoke-RestMethod "http://localhost:8000/api/v1/lighthouses?is_visitable=true"
Invoke-RestMethod "http://localhost:8000/api/v1/lighthouses?q=犬吠埼"
Invoke-RestMethod "http://localhost:8000/api/v1/lighthouses/slug/inubosaki"
```

## よく使うコマンド

```powershell
cd backend
pytest
ruff check .
alembic revision --autogenerate -m "変更内容の説明"
alembic upgrade head
```
