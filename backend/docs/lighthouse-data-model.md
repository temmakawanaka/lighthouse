# Lighthouse Data Model Notes

## Goal

The API should return lighthouse records that can support:

- map/list/detail views
- historical and cultural descriptions
- navigation-aid specifications
- visitor information for climbable or public lighthouses
- provenance for each manually curated record

## Sample Sources

The first seed data uses public web sources for four real lighthouses:

- Omaesaki Lighthouse: Omaezaki City official tourism page and Wikipedia
- Inubosaki Lighthouse: Wikipedia, including linked Japan Coast Guard references
- Tsunoshima Lighthouse: Wikipedia, including linked Japan Coast Guard references
- Izumo Hinomisaki Lighthouse: Wikipedia Chinese edition, including technical specifications

For production-grade curation, prefer source priority in this order:

1. Japan Coast Guard pages and official notices
2. municipality or prefectural tourism pages
3. Tokokai pages for climbable and historical lighthouses
4. secondary references such as Wikipedia only when primary pages are unavailable

## Confirmed Data Groups

### Identity

- `name`
- `slug`
- `name_kana`
- `english_name`
- `description`

### Location

- `country_code`
- `prefecture`
- `municipality`
- `address`
- `area_name`
- `latitude`
- `longitude`

Latitude and longitude are kept as decimals for now. If radius search, route search, or map clustering becomes central, add PostGIS later rather than changing the public API shape.

### Navigation Aid Specifications

- `jcg_number`
- `admiralty_number`
- `operator`
- `first_lit_date`
- `built_year`
- `construction_material`
- `tower_shape`
- `marking`
- `lens`
- `light_characteristic`
- `intensity_cd`
- `range_nm`
- `range_km`
- `tower_height_m`
- `focal_height_m`

These fields appeared repeatedly in public lighthouse pages and are useful for detail pages, filtering, and comparisons.

### Visitor Information

- `is_visitable`
- `visit_info`
- `admission_info`
- `closed_info`
- `parking_info`
- `phone_number`

Opening hours and fees change more often than structural specs, so they are intentionally stored as text notes for the first version. A normalized schedule table can be introduced once the UI needs calendar-aware behavior.

### Cultural / Editorial Labels

- `heritage_status`
- `selections`

`selections` is JSONB because a lighthouse can belong to multiple editorial lists such as Japan's 50 Lighthouses, climbable lighthouses, or world lighthouse selections.

### Provenance

- `source_urls`
- `source_notes`

Every manually curated lighthouse should keep at least one source URL. When sources disagree, write the adopted source and rationale in `source_notes`.

## Seed Command

```powershell
cd backend
.\.venv\Scripts\python.exe -m scripts.seed_lighthouses
```

Run this after `alembic upgrade head`.

