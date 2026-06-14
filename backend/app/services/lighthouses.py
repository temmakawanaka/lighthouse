from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lighthouse import Lighthouse
from app.schemas.lighthouse import LighthouseCreate, LighthouseUpdate


class LighthouseConflict(Exception):
    pass


async def list_lighthouses(
    session: AsyncSession,
    *,
    limit: int,
    offset: int,
) -> Sequence[Lighthouse]:
    result = await session.execute(
        select(Lighthouse).order_by(Lighthouse.name).limit(limit).offset(offset)
    )
    return result.scalars().all()


async def get_lighthouse(session: AsyncSession, lighthouse_id: UUID) -> Lighthouse | None:
    return await session.get(Lighthouse, lighthouse_id)


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

