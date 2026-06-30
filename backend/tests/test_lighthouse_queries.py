from decimal import Decimal

from sqlalchemy.dialects import postgresql

from app.schemas.lighthouse import LighthouseSortField, SortOrder
from app.services.lighthouses import (
    build_lighthouse_count_statement,
    build_lighthouse_list_statement,
)


def compile_sql(statement: object) -> str:
    return str(
        statement.compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": True},
        )
    )


def test_build_lighthouse_list_statement_includes_filters_and_sorting() -> None:
    statement = build_lighthouse_list_statement(
        limit=20,
        offset=10,
        q="崎",
        prefecture="千葉県",
        municipality="銚子市",
        is_visitable=True,
        north=Decimal("36"),
        south=Decimal("35"),
        east=Decimal("141"),
        west=Decimal("140"),
        sort_by=LighthouseSortField.NAME,
        sort_order=SortOrder.DESC,
    )

    sql = compile_sql(statement)

    assert "ILIKE" in sql
    assert "lighthouses.prefecture = '千葉県'" in sql
    assert "lighthouses.municipality = '銚子市'" in sql
    assert "lighthouses.is_visitable IS true" in sql
    assert "lighthouses.latitude <= 36" in sql
    assert "lighthouses.latitude >= 35" in sql
    assert "lighthouses.longitude <= 141" in sql
    assert "lighthouses.longitude >= 140" in sql
    assert "ORDER BY lighthouses.name DESC" in sql
    assert "LIMIT 20" in sql
    assert "OFFSET 10" in sql


def test_build_lighthouse_count_statement_matches_filters_without_pagination() -> None:
    statement = build_lighthouse_count_statement(
        q="岬",
        prefecture="三重県",
        is_visitable=True,
    )

    sql = compile_sql(statement)

    assert "count(*)" in sql.lower()
    assert "lighthouses.prefecture = '三重県'" in sql
    assert "lighthouses.is_visitable IS true" in sql
    assert "LIMIT" not in sql
    assert "OFFSET" not in sql
