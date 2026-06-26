from collections.abc import Sequence
from decimal import Decimal
from uuid import UUID

from sqlalchemy import Select, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lighthouse import Lighthouse
from app.schemas.lighthouse import LighthouseCreate, LighthouseUpdate


class LighthouseConflict(Exception):
    pass


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
) -> Select[tuple[Lighthouse]]:
    statement = select(Lighthouse)

    if q:
        pattern = f"%{q}%"
        statement = statement.where(
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
        statement = statement.where(Lighthouse.prefecture == prefecture)

    if municipality:
        statement = statement.where(Lighthouse.municipality == municipality)

    if is_visitable is not None:
        statement = statement.where(Lighthouse.is_visitable.is_(is_visitable))

    if None not in (north, south, east, west):
        statement = statement.where(
            Lighthouse.latitude <= north,
            Lighthouse.latitude >= south,
            Lighthouse.longitude <= east,
            Lighthouse.longitude >= west,
        )

    return (
        statement.order_by(Lighthouse.prefecture, Lighthouse.municipality, Lighthouse.name)
        .limit(limit)
        .offset(offset)
    )


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
) -> Sequence[Lighthouse]:
    result = await session.execute(
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
        )
    )
    return result.scalars().all()


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
