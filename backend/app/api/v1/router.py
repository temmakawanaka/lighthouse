from fastapi import APIRouter

from app.api.v1.endpoints import health, lighthouses

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(lighthouses.router)

