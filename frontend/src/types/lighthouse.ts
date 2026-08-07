export type LighthouseSortField =
  | "prefecture"
  | "name"
  | "first_lit_date"
  | "created_at";

export type SortOrder = "asc" | "desc";

export interface Lighthouse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  latitude: string;
  longitude: string;
  name_kana: string | null;
  english_name: string | null;
  country_code: string;
  prefecture: string | null;
  municipality: string | null;
  address: string | null;
  area_name: string | null;
  jcg_number: string | null;
  admiralty_number: string | null;
  operator: string | null;
  first_lit_date: string | null;
  built_year: number | null;
  construction_material: string | null;
  tower_shape: string | null;
  marking: string | null;
  lens: string | null;
  light_characteristic: string | null;
  intensity_cd: number | null;
  range_nm: string | null;
  range_km: string | null;
  tower_height_m: string | null;
  focal_height_m: string | null;
  is_visitable: boolean | null;
  visit_info: string | null;
  admission_info: string | null;
  closed_info: string | null;
  parking_info: string | null;
  phone_number: string | null;
  heritage_status: string | null;
  selections: string[];
  source_urls: string[];
  source_notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LighthouseListResponse {
  items: Lighthouse[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
  sort_by: LighthouseSortField;
  sort_order: SortOrder;
}
