from collections.abc import Sequence
from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID

from sqlalchemy import Select, UnaryExpression, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lighthouse import Lighthouse
from app.schemas.lighthouse import (
    LighthouseCreate,
    LighthouseSortField,
    LighthouseUpdate,
    SortOrder,
)


class LighthouseConflict(Exception):
    pass


@dataclass(slots=True)
class LighthouseListResult:
    items: Sequence[Lighthouse]
    total: int


def build_lighthouse_filters(
    *,
    q: str | None = None,
    prefecture: str | None = None,
    municipality: str | None = None,
    is_visitable: bool | None = None,
    north: Decimal | None = None,
    south: Decimal | None = None,
    east: Decimal | None = None,
    west: Decimal | None = None,
) -> list[object]:
    filters: list[object] = []

    if q:
        pattern = f"%{q}%"
        filters.append(
            or_(
                Lighthouse.name.ilike(pattern),
                Lighthouse.name_kana.ilike(pattern),
                Lighthouse.english_name.ilike(pattern),
                Lighthouse.description.ilike(pattern),
                Lighthouse.area_name.ilike(pattern),
                Lighthouse.prefecture.ilike(pattern),
                Lighthouse.municipality.ilike(pattern),
            )
        )

    if prefecture:
        filters.append(Lighthouse.prefecture == prefecture)

    if municipality:
        filters.append(Lighthouse.municipality == municipality)

    if is_visitable is not None:
        filters.append(Lighthouse.is_visitable.is_(is_visitable))

    if None not in (north, south, east, west):
        filters.extend(
            [
                Lighthouse.latitude <= north,
                Lighthouse.latitude >= south,
                Lighthouse.longitude <= east,
                Lighthouse.longitude >= west,
            ]
        )

    return filters


def build_lighthouse_sort_expressions(
    *,
    sort_by: LighthouseSortField,
    sort_order: SortOrder,
) -> tuple[UnaryExpression[object], ...]:
    is_desc = sort_order == SortOrder.DESC

    if sort_by == LighthouseSortField.NAME:
        columns = (Lighthouse.name,)
    elif sort_by == LighthouseSortField.FIRST_LIT_DATE:
        columns = (Lighthouse.first_lit_date, Lighthouse.name)
    elif sort_by == LighthouseSortField.CREATED_AT:
        columns = (Lighthouse.created_at, Lighthouse.name)
    else:
        columns = (Lighthouse.prefecture, Lighthouse.municipality, Lighthouse.name)

    if is_desc:
        return tuple(column.desc() for column in columns)

    return tuple(column.asc() for column in columns)


def build_lighthouse_list_statement(
    *,
    limit: int,
    offset: int,
    q: str | None = None,
    prefecture: str | None = None,
    municipality: str | None = None,
    is_visitable: bool | None = None,
    north: Decimal | None = None,
    south: Decimal | None = None,
    east: Decimal | None = None,
    west: Decimal | None = None,
    sort_by: LighthouseSortField = LighthouseSortField.PREFECTURE,
    sort_order: SortOrder = SortOrder.ASC,
) -> Select[tuple[Lighthouse]]:
    filters = build_lighthouse_filters(
        q=q,
        prefecture=prefecture,
        municipality=municipality,
        is_visitable=is_visitable,
        north=north,
        south=south,
        east=east,
        west=west,
    )
    order_by = build_lighthouse_sort_expressions(sort_by=sort_by, sort_order=sort_order)

    return select(Lighthouse).where(*filters).order_by(*order_by).limit(limit).offset(offset)


def build_lighthouse_count_statement(
    *,
    q: str | None = None,
    prefecture: str | None = None,
    municipality: str | None = None,
    is_visitable: bool | None = None,
    north: Decimal | None = None,
    south: Decimal | None = None,
    east: Decimal | None = None,
    west: Decimal | None = None,
) -> Select[tuple[int]]:
    filters = build_lighthouse_filters(
        q=q,
        prefecture=prefecture,
        municipality=municipality,
        is_visitable=is_visitable,
        north=north,
        south=south,
        east=east,
        west=west,
    )

    return select(func.count()).select_from(Lighthouse).where(*filters)


async def list_lighthouses(
    session: AsyncSession,
    *,
    limit: int,
    offset: int,
    q: str | None = None,
    prefecture: str | None = None,
    municipality: str | None = None,
    is_visitable: bool | None = None,
    north: Decimal | None = None,
    south: Decimal | None = None,
    east: Decimal | None = None,
    west: Decimal | None = None,
    sort_by: LighthouseSortField = LighthouseSortField.PREFECTURE,
    sort_order: SortOrder = SortOrder.ASC,
) -> LighthouseListResult:
    items_result = await session.execute(
        build_lighthouse_list_statement(
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
            sort_by=sort_by,
            sort_order=sort_order,
        )
    )
    count_result = await session.execute(
        build_lighthouse_count_statement(
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
    return LighthouseListResult(
        items=items_result.scalars().all(),
        total=count_result.scalar_one(),
    )


async def get_lighthouse(session: AsyncSession, lighthouse_id: UUID) -> Lighthouse | None:
    return await session.get(Lighthouse, lighthouse_id)


async def get_lighthouse_by_slug(session: AsyncSession, slug: str) -> Lighthouse | None:
    result = await session.execute(select(Lighthouse).where(Lighthouse.slug == slug))
    return result.scalar_one_or_none()


async def create_lighthouse(session: AsyncSession, payload: LighthouseCreate) -> Lighthouse:
    lighthouse = Lighthouse(**payload.model_dump())
    session.add(lighthouse)

    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise LighthouseConflict from exc

    await session.refresh(lighthouse)
    return lighthouse


async def update_lighthouse(
    session: AsyncSession,
    lighthouse_id: UUID,
    payload: LighthouseUpdate,
) -> Lighthouse | None:
    lighthouse = await get_lighthouse(session, lighthouse_id)
    if lighthouse is None:
        return None

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(lighthouse, field, value)

    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise LighthouseConflict from exc

    await session.refresh(lighthouse)
    return lighthouse


async def delete_lighthouse(session: AsyncSession, lighthouse_id: UUID) -> bool:
    lighthouse = await get_lighthouse(session, lighthouse_id)
    if lighthouse is None:
        return False

    await session.delete(lighthouse)
    await session.commit()
    return True
