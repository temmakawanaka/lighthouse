import json
from pathlib import Path

from app.schemas.lighthouse import LighthouseCreate


def test_lighthouse_seed_data_is_valid() -> None:
    seed_path = Path("app/db/seeds/lighthouses.json")
    rows = json.loads(seed_path.read_text(encoding="utf-8"))

    parsed_rows = [LighthouseCreate.model_validate(row) for row in rows]
    slugs = [row.slug for row in parsed_rows]

    assert len(parsed_rows) == 16
    assert len(slugs) == len(set(slugs))
    assert all(row.source_urls for row in parsed_rows)
    assert all(row.is_visitable is True for row in parsed_rows)
    assert all("のぼれる灯台16" in row.selections for row in parsed_rows)
