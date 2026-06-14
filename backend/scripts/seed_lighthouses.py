from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Any

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.lighthouse import Lighthouse
from app.schemas.lighthouse import LighthouseCreate

SEED_PATH = Path(__file__).resolve().parents[1] / "app" / "db" / "seeds" / "lighthouses.json"


def load_seed_rows() -> list[dict[str, Any]]:
    rows = json.loads(SEED_PATH.read_text(encoding="utf-8"))
    return [LighthouseCreate.model_validate(row).model_dump() for row in rows]


async def seed_lighthouses() -> None:
    rows = load_seed_rows()

    async with AsyncSessionLocal() as session:
        for row in rows:
            result = await session.execute(select(Lighthouse).where(Lighthouse.slug == row["slug"]))
            lighthouse = result.scalar_one_or_none()

            if lighthouse is None:
                session.add(Lighthouse(**row))
                continue

            for field, value in row.items():
                setattr(lighthouse, field, value)

        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed_lighthouses())

