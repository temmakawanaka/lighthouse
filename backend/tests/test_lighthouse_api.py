from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

from fastapi.testclient import TestClient

from app.main import create_app
from app.schemas.lighthouse import LighthouseRead


def make_lighthouse(slug: str = "inubosaki") -> LighthouseRead:
    return LighthouseRead(
        id="00000000-0000-0000-0000-000000000001",
        name="犬吠埼灯台",
        slug=slug,
        latitude=Decimal("35.707861"),
        longitude=Decimal("140.868639"),
        prefecture="千葉県",
        municipality="銚子市",
        is_visitable=True,
        source_urls=["https://example.com"],
        created_at=datetime(2026, 1, 1, tzinfo=UTC),
        updated_at=datetime(2026, 1, 1, tzinfo=UTC),
    )


def test_list_lighthouses_forwards_search_filters(monkeypatch: Any) -> None:
    captured: dict[str, Any] = {}

    async def fake_list_lighthouses(*_: Any, **kwargs: Any) -> list[LighthouseRead]:
        captured.update(kwargs)
        return [make_lighthouse()]

    monkeypatch.setattr(
        "app.api.v1.endpoints.lighthouses.lighthouse_service.list_lighthouses",
        fake_list_lighthouses,
    )

    with TestClient(create_app()) as client:
        response = client.get(
            "/api/v1/lighthouses",
            params={
                "q": "灯台",
                "prefecture": "千葉県",
                "municipality": "銚子市",
                "is_visitable": "true",
                "north": "36",
                "south": "35",
                "east": "141",
                "west": "140",
            },
        )

    assert response.status_code == 200
    assert response.json()[0]["slug"] == "inubosaki"
    assert captured["q"] == "灯台"
    assert captured["prefecture"] == "千葉県"
    assert captured["municipality"] == "銚子市"
    assert captured["is_visitable"] is True
    assert captured["north"] == Decimal("36")
    assert captured["south"] == Decimal("35")
    assert captured["east"] == Decimal("141")
    assert captured["west"] == Decimal("140")


def test_list_lighthouses_rejects_partial_map_bounds() -> None:
    with TestClient(create_app()) as client:
        response = client.get("/api/v1/lighthouses", params={"north": "36"})

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "地図範囲検索には north, south, east, west をすべて指定してください。"
    )


def test_get_lighthouse_by_slug(monkeypatch: Any) -> None:
    async def fake_get_lighthouse_by_slug(*_: Any, **__: Any) -> LighthouseRead:
        return make_lighthouse()

    monkeypatch.setattr(
        "app.api.v1.endpoints.lighthouses.lighthouse_service.get_lighthouse_by_slug",
        fake_get_lighthouse_by_slug,
    )

    with TestClient(create_app()) as client:
        response = client.get("/api/v1/lighthouses/slug/inubosaki")

    assert response.status_code == 200
    assert response.json()["slug"] == "inubosaki"
