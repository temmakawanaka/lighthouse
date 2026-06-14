from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Lighthouse(Base):
    __tablename__ = "lighthouses"
    __table_args__ = (
        UniqueConstraint("slug", name="uq_lighthouses_slug"),
        CheckConstraint("latitude >= -90 AND latitude <= 90", name="ck_lighthouses_latitude_range"),
        CheckConstraint(
            "longitude >= -180 AND longitude <= 180",
            name="ck_lighthouses_longitude_range",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(120), index=True)
    slug: Mapped[str] = mapped_column(String(160))
    description: Mapped[str | None] = mapped_column(Text)
    latitude: Mapped[Decimal] = mapped_column(Numeric(9, 6))
    longitude: Mapped[Decimal] = mapped_column(Numeric(9, 6))
    name_kana: Mapped[str | None] = mapped_column(String(160))
    english_name: Mapped[str | None] = mapped_column(String(160))
    country_code: Mapped[str] = mapped_column(String(2), default="JP", server_default="JP")
    prefecture: Mapped[str | None] = mapped_column(String(40), index=True)
    municipality: Mapped[str | None] = mapped_column(String(80), index=True)
    address: Mapped[str | None] = mapped_column(String(255))
    area_name: Mapped[str | None] = mapped_column(String(120))
    jcg_number: Mapped[str | None] = mapped_column(String(40))
    admiralty_number: Mapped[str | None] = mapped_column(String(40))
    operator: Mapped[str | None] = mapped_column(String(120))
    first_lit_date: Mapped[date | None] = mapped_column(Date)
    built_year: Mapped[int | None] = mapped_column(Integer)
    construction_material: Mapped[str | None] = mapped_column(String(120))
    tower_shape: Mapped[str | None] = mapped_column(String(160))
    marking: Mapped[str | None] = mapped_column(String(160))
    lens: Mapped[str | None] = mapped_column(String(160))
    light_characteristic: Mapped[str | None] = mapped_column(String(255))
    intensity_cd: Mapped[int | None] = mapped_column(Integer)
    range_nm: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    range_km: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    tower_height_m: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    focal_height_m: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    is_visitable: Mapped[bool | None] = mapped_column(Boolean)
    visit_info: Mapped[str | None] = mapped_column(Text)
    admission_info: Mapped[str | None] = mapped_column(Text)
    closed_info: Mapped[str | None] = mapped_column(Text)
    parking_info: Mapped[str | None] = mapped_column(Text)
    phone_number: Mapped[str | None] = mapped_column(String(40))
    heritage_status: Mapped[str | None] = mapped_column(String(255))
    selections: Mapped[list[str]] = mapped_column(
        JSONB,
        default=list,
        server_default=text("'[]'::jsonb"),
    )
    source_urls: Mapped[list[str]] = mapped_column(
        JSONB,
        default=list,
        server_default=text("'[]'::jsonb"),
    )
    source_notes: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
