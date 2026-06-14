from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.lighthouse import LighthouseCreate, LighthouseRead, LighthouseUpdate
from app.services import lighthouses as lighthouse_service

router = APIRouter(prefix="/lighthouses", tags=["lighthouses"])
SessionDep = Annotated[AsyncSession, Depends(get_session)]
LimitQuery = Annotated[int, Query(ge=1, le=100)]
OffsetQuery = Annotated[int, Query(ge=0)]


@router.get("", response_model=list[LighthouseRead])
async def list_lighthouses(
    session: SessionDep,
    limit: LimitQuery = 50,
    offset: OffsetQuery = 0,
) -> list[LighthouseRead]:
    return list(await lighthouse_service.list_lighthouses(session, limit=limit, offset=offset))


@router.post("", response_model=LighthouseRead, status_code=status.HTTP_201_CREATED)
async def create_lighthouse(
    payload: LighthouseCreate,
    session: SessionDep,
) -> LighthouseRead:
    try:
        return await lighthouse_service.create_lighthouse(session, payload)
    except lighthouse_service.LighthouseConflict as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Lighthouse slug already exists.",
        ) from exc


@router.get("/{lighthouse_id}", response_model=LighthouseRead)
async def get_lighthouse(
    lighthouse_id: UUID,
    session: SessionDep,
) -> LighthouseRead:
    lighthouse = await lighthouse_service.get_lighthouse(session, lighthouse_id)
    if lighthouse is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lighthouse not found.")
    return lighthouse


@router.patch("/{lighthouse_id}", response_model=LighthouseRead)
async def update_lighthouse(
    lighthouse_id: UUID,
    payload: LighthouseUpdate,
    session: SessionDep,
) -> LighthouseRead:
    try:
        lighthouse = await lighthouse_service.update_lighthouse(session, lighthouse_id, payload)
    except lighthouse_service.LighthouseConflict as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Lighthouse slug already exists.",
        ) from exc

    if lighthouse is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lighthouse not found.")
    return lighthouse


@router.delete("/{lighthouse_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lighthouse(
    lighthouse_id: UUID,
    session: SessionDep,
) -> None:
    deleted = await lighthouse_service.delete_lighthouse(session, lighthouse_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lighthouse not found.")
