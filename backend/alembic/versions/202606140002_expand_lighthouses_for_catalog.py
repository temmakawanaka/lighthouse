"""expand lighthouses for catalog

Revision ID: 202606140002
Revises: 202606140001
Create Date: 2026-06-14 00:02:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "202606140002"
down_revision: str | None = "202606140001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("lighthouses", sa.Column("name_kana", sa.String(length=160), nullable=True))
    op.add_column("lighthouses", sa.Column("english_name", sa.String(length=160), nullable=True))
    op.add_column(
        "lighthouses",
        sa.Column("country_code", sa.String(length=2), server_default="JP", nullable=False),
    )
    op.add_column("lighthouses", sa.Column("prefecture", sa.String(length=40), nullable=True))
    op.add_column("lighthouses", sa.Column("municipality", sa.String(length=80), nullable=True))
    op.add_column("lighthouses", sa.Column("address", sa.String(length=255), nullable=True))
    op.add_column("lighthouses", sa.Column("area_name", sa.String(length=120), nullable=True))
    op.add_column("lighthouses", sa.Column("jcg_number", sa.String(length=40), nullable=True))
    op.add_column("lighthouses", sa.Column("admiralty_number", sa.String(length=40), nullable=True))
    op.add_column("lighthouses", sa.Column("operator", sa.String(length=120), nullable=True))
    op.add_column("lighthouses", sa.Column("first_lit_date", sa.Date(), nullable=True))
    op.add_column("lighthouses", sa.Column("built_year", sa.Integer(), nullable=True))
    op.add_column(
        "lighthouses",
        sa.Column("construction_material", sa.String(length=120), nullable=True),
    )
    op.add_column("lighthouses", sa.Column("tower_shape", sa.String(length=160), nullable=True))
    op.add_column("lighthouses", sa.Column("marking", sa.String(length=160), nullable=True))
    op.add_column("lighthouses", sa.Column("lens", sa.String(length=160), nullable=True))
    op.add_column(
        "lighthouses",
        sa.Column("light_characteristic", sa.String(length=255), nullable=True),
    )
    op.add_column("lighthouses", sa.Column("intensity_cd", sa.Integer(), nullable=True))
    op.add_column("lighthouses", sa.Column("range_nm", sa.Numeric(5, 2), nullable=True))
    op.add_column("lighthouses", sa.Column("range_km", sa.Numeric(6, 2), nullable=True))
    op.add_column("lighthouses", sa.Column("tower_height_m", sa.Numeric(6, 2), nullable=True))
    op.add_column("lighthouses", sa.Column("focal_height_m", sa.Numeric(6, 2), nullable=True))
    op.add_column("lighthouses", sa.Column("is_visitable", sa.Boolean(), nullable=True))
    op.add_column("lighthouses", sa.Column("visit_info", sa.Text(), nullable=True))
    op.add_column("lighthouses", sa.Column("admission_info", sa.Text(), nullable=True))
    op.add_column("lighthouses", sa.Column("closed_info", sa.Text(), nullable=True))
    op.add_column("lighthouses", sa.Column("parking_info", sa.Text(), nullable=True))
    op.add_column("lighthouses", sa.Column("phone_number", sa.String(length=40), nullable=True))
    op.add_column("lighthouses", sa.Column("heritage_status", sa.String(length=255), nullable=True))
    op.add_column(
        "lighthouses",
        sa.Column(
            "selections",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'[]'::jsonb"),
            nullable=False,
        ),
    )
    op.add_column(
        "lighthouses",
        sa.Column(
            "source_urls",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'[]'::jsonb"),
            nullable=False,
        ),
    )
    op.add_column("lighthouses", sa.Column("source_notes", sa.Text(), nullable=True))
    op.create_index("ix_lighthouses_prefecture", "lighthouses", ["prefecture"], unique=False)
    op.create_index("ix_lighthouses_municipality", "lighthouses", ["municipality"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_lighthouses_municipality", table_name="lighthouses")
    op.drop_index("ix_lighthouses_prefecture", table_name="lighthouses")
    op.drop_column("lighthouses", "source_notes")
    op.drop_column("lighthouses", "source_urls")
    op.drop_column("lighthouses", "selections")
    op.drop_column("lighthouses", "heritage_status")
    op.drop_column("lighthouses", "phone_number")
    op.drop_column("lighthouses", "parking_info")
    op.drop_column("lighthouses", "closed_info")
    op.drop_column("lighthouses", "admission_info")
    op.drop_column("lighthouses", "visit_info")
    op.drop_column("lighthouses", "is_visitable")
    op.drop_column("lighthouses", "focal_height_m")
    op.drop_column("lighthouses", "tower_height_m")
    op.drop_column("lighthouses", "range_km")
    op.drop_column("lighthouses", "range_nm")
    op.drop_column("lighthouses", "intensity_cd")
    op.drop_column("lighthouses", "light_characteristic")
    op.drop_column("lighthouses", "lens")
    op.drop_column("lighthouses", "marking")
    op.drop_column("lighthouses", "tower_shape")
    op.drop_column("lighthouses", "construction_material")
    op.drop_column("lighthouses", "built_year")
    op.drop_column("lighthouses", "first_lit_date")
    op.drop_column("lighthouses", "operator")
    op.drop_column("lighthouses", "admiralty_number")
    op.drop_column("lighthouses", "jcg_number")
    op.drop_column("lighthouses", "area_name")
    op.drop_column("lighthouses", "address")
    op.drop_column("lighthouses", "municipality")
    op.drop_column("lighthouses", "prefecture")
    op.drop_column("lighthouses", "country_code")
    op.drop_column("lighthouses", "english_name")
    op.drop_column("lighthouses", "name_kana")

