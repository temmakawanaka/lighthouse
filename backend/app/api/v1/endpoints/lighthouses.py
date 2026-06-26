from decimal import Decimal
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.lighthouse import LighthouseCreate, LighthouseRead, LighthouseUpdate
from app.services import lighthouses as lighthouse_service

router = APIRouter(prefix="/lighthouses", tags=["灯台"])
SessionDep = Annotated[AsyncSession, Depends(get_session)]
LimitQuery = Annotated[int, Query(ge=1, le=100)]
OffsetQuery = Annotated[int, Query(ge=0)]
SearchQuery = Annotated[str | None, Query(min_length=1, max_length=120)]
PrefectureQuery = Annotated[str | None, Query(min_length=1, max_length=40)]
MunicipalityQuery = Annotated[str | None, Query(min_length=1, max_length=80)]
LatitudeQuery = Annotated[Decimal | None, Query(ge=-90, le=90)]
LongitudeQuery = Annotated[Decimal | None, Query(ge=-180, le=180)]


def validate_map_bounds(
    *,
    north: Decimal | None,
    south: Decimal | None,
    east: Decimal | None,
    west: Decimal | None,
) -> None:
    bounds = (north, south, east, west)
    if any(value is not None for value in bounds) and any(value is None for value in bounds):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="地図範囲検索には north, south, east, west をすべて指定してください。",
        )

    if north is None or south is None or east is None or west is None:
        return

    if south > north:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="south は north 以下で指定してください。",
        )

    if west > east:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="west は east 以下で指定してください。",
        )


@router.get("", response_model=list[LighthouseRead])
async def list_lighthouses(
    session: SessionDep,
    limit: LimitQuery = 50,
    offset: OffsetQuery = 0,
    q: SearchQuery = None,
    prefecture: PrefectureQuery = None,
    municipality: MunicipalityQuery = None,
    is_visitable: bool | None = None,
    north: LatitudeQuery = None,
    south: LatitudeQuery = None,
    east: LongitudeQuery = None,
    west: LongitudeQuery = None,
) -> list[LighthouseRead]:
    validate_map_bounds(north=north, south=south, east=east, west=west)
    return list(
        await lighthouse_service.list_lighthouses(
            session,
            limit=limit,
            offset=offset,
            q=q,
            prefecture=prefecture,
            municipality=municipality,
            is_visitable=is_visitable,
            north=north,
            south=south,
            east=east,
            west=west,
        )
    )


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
            detail="指定された灯台slugはすでに存在します。",
        ) from exc


@router.get("/slug/{slug}", response_model=LighthouseRead)
async def get_lighthouse_by_slug(
    slug: str,
    session: SessionDep,
) -> LighthouseRead:
    lighthouse = await lighthouse_service.get_lighthouse_by_slug(session, slug)
    if lighthouse is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="灯台が見つかりません。")
    return lighthouse


@router.get("/{lighthouse_id}", response_model=LighthouseRead)
async def get_lighthouse(
    lighthouse_id: UUID,
    session: SessionDep,
) -> LighthouseRead:
    lighthouse = await lighthouse_service.get_lighthouse(session, lighthouse_id)
    if lighthouse is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="灯台が見つかりません。")
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
            detail="指定された灯台slugはすでに存在します。",
        ) from exc

    if lighthouse is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="灯台が見つかりません。")
    return lighthouse


@router.delete("/{lighthouse_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lighthouse(
    lighthouse_id: UUID,
    session: SessionDep,
) -> None:
    deleted = await lighthouse_service.delete_lighthouse(session, lighthouse_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="灯台が見つかりません。")
