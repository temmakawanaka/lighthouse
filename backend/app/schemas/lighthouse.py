from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

SLUG_PATTERN = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"


class LighthouseBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    slug: str = Field(min_length=1, max_length=160, pattern=SLUG_PATTERN)
    description: str | None = None
    latitude: Decimal = Field(ge=-90, le=90)
    longitude: Decimal = Field(ge=-180, le=180)
    name_kana: str | None = Field(default=None, max_length=160)
    english_name: str | None = Field(default=None, max_length=160)
    country_code: str = Field(default="JP", min_length=2, max_length=2)
    prefecture: str | None = Field(default=None, max_length=40)
    municipality: str | None = Field(default=None, max_length=80)
    address: str | None = Field(default=None, max_length=255)
    area_name: str | None = Field(default=None, max_length=120)
    jcg_number: str | None = Field(default=None, max_length=40)
    admiralty_number: str | None = Field(default=None, max_length=40)
    operator: str | None = Field(default=None, max_length=120)
    first_lit_date: date | None = None
    built_year: int | None = Field(default=None, ge=1800, le=2200)
    construction_material: str | None = Field(default=None, max_length=120)
    tower_shape: str | None = Field(default=None, max_length=160)
    marking: str | None = Field(default=None, max_length=160)
    lens: str | None = Field(default=None, max_length=160)
    light_characteristic: str | None = Field(default=None, max_length=255)
    intensity_cd: int | None = Field(default=None, ge=0)
    range_nm: Decimal | None = Field(default=None, ge=0)
    range_km: Decimal | None = Field(default=None, ge=0)
    tower_height_m: Decimal | None = Field(default=None, ge=0)
    focal_height_m: Decimal | None = Field(default=None, ge=0)
    is_visitable: bool | None = None
    visit_info: str | None = None
    admission_info: str | None = None
    closed_info: str | None = None
    parking_info: str | None = None
    phone_number: str | None = Field(default=None, max_length=40)
    heritage_status: str | None = Field(default=None, max_length=255)
    selections: list[str] = Field(default_factory=list)
    source_urls: list[str] = Field(default_factory=list)
    source_notes: str | None = None
    is_active: bool = True


class LighthouseCreate(LighthouseBase):
    pass


class LighthouseUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    slug: str | None = Field(default=None, min_length=1, max_length=160, pattern=SLUG_PATTERN)
    description: str | None = None
    latitude: Decimal | None = Field(default=None, ge=-90, le=90)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180)
    name_kana: str | None = Field(default=None, max_length=160)
    english_name: str | None = Field(default=None, max_length=160)
    country_code: str | None = Field(default=None, min_length=2, max_length=2)
    prefecture: str | None = Field(default=None, max_length=40)
    municipality: str | None = Field(default=None, max_length=80)
    address: str | None = Field(default=None, max_length=255)
    area_name: str | None = Field(default=None, max_length=120)
    jcg_number: str | None = Field(default=None, max_length=40)
    admiralty_number: str | None = Field(default=None, max_length=40)
    operator: str | None = Field(default=None, max_length=120)
    first_lit_date: date | None = None
    built_year: int | None = Field(default=None, ge=1800, le=2200)
    construction_material: str | None = Field(default=None, max_length=120)
    tower_shape: str | None = Field(default=None, max_length=160)
    marking: str | None = Field(default=None, max_length=160)
    lens: str | None = Field(default=None, max_length=160)
    light_characteristic: str | None = Field(default=None, max_length=255)
    intensity_cd: int | None = Field(default=None, ge=0)
    range_nm: Decimal | None = Field(default=None, ge=0)
    range_km: Decimal | None = Field(default=None, ge=0)
    tower_height_m: Decimal | None = Field(default=None, ge=0)
    focal_height_m: Decimal | None = Field(default=None, ge=0)
    is_visitable: bool | None = None
    visit_info: str | None = None
    admission_info: str | None = None
    closed_info: str | None = None
    parking_info: str | None = None
    phone_number: str | None = Field(default=None, max_length=40)
    heritage_status: str | None = Field(default=None, max_length=255)
    selections: list[str] = Field(default_factory=list)
    source_urls: list[str] = Field(default_factory=list)
    source_notes: str | None = None
    is_active: bool | None = None


class LighthouseRead(LighthouseBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
