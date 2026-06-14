# Lighthouse

Backend-first API project for the Lighthouse app.

## Stack

- FastAPI
- SQLAlchemy 2 async ORM
- Alembic migrations
- PostgreSQL
- Pytest
- Ruff

## Local Development

Start PostgreSQL:

```powershell
docker compose up -d db
```

Create a backend environment:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
Copy-Item .env.example .env
```

Run migrations:

```powershell
alembic upgrade head
```

Seed sample lighthouse data:

```powershell
python -m scripts.seed_lighthouses
```

Start the API:

```powershell
uvicorn app.main:app --reload
```

Open:

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- OpenAPI JSON: http://localhost:8000/openapi.json

## Useful Commands

```powershell
cd backend
pytest
ruff check .
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```
