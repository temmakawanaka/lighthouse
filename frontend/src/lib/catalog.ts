import seed from "@/data/lighthouses.json";
import reviews from "@/data/visit-reviews.json";
import { PAGE_SIZE, PREFECTURES } from "@/lib/constants";
import { toApiSort, type ListQuery } from "@/lib/query-params";
import type { Lighthouse, LighthouseListResponse } from "@/types/lighthouse";

export const catalog: Lighthouse[] = seed.map((record) => ({
  ...record, id: record.slug, is_active: true,
  // No database timestamps exist in the seed. The build date is not a source verification date.
  created_at: "", updated_at: "",
  visit_checked_at: reviews[record.slug as keyof typeof reviews]?.checked_at,
  visit_notice: reviews[record.slug as keyof typeof reviews]?.notice,
}));

export function normalizeSearch(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("ja-JP")
    .replace(/[ァ-ヶ]/g, (character) => String.fromCharCode(character.charCodeAt(0) - 0x60))
    .replace(/[﨑埼碕]/g, "崎");
}

export function searchCatalog(query: ListQuery, records: readonly Lighthouse[] = catalog): LighthouseListResponse {
  const terms = normalizeSearch(query.q).trim().split(/\s+/).filter(Boolean);
  const filtered = records.filter((record) => {
    if (!record.is_active || (query.visitable && record.is_visitable !== true)) return false;
    if (query.prefecture && query.prefecture !== record.prefecture) return false;
    const searchable = normalizeSearch([
      record.name, record.name_kana, record.english_name, record.prefecture,
      record.municipality, record.area_name, record.description,
    ].filter(Boolean).join(" "));
    return terms.every((term) => searchable.includes(term));
  });
  const collator = new Intl.Collator("ja-JP");
  const nameOrder = (a: Lighthouse, b: Lighthouse) => collator.compare(a.name_kana || a.name, b.name_kana || b.name) || a.slug.localeCompare(b.slug);
  const prefectureOrder = (record: Lighthouse) => {
    const index = PREFECTURES.indexOf(record.prefecture as typeof PREFECTURES[number]);
    return index < 0 ? PREFECTURES.length : index;
  };
  filtered.sort((a, b) => {
    if (query.sort === "name") return nameOrder(a, b);
    if (query.sort.startsWith("first_lit_date")) {
      if (!a.first_lit_date || !b.first_lit_date) return a.first_lit_date ? -1 : b.first_lit_date ? 1 : nameOrder(a, b);
      const direction = query.sort === "first_lit_date_desc" ? -1 : 1;
      return direction * a.first_lit_date.localeCompare(b.first_lit_date) || nameOrder(a, b);
    }
    return prefectureOrder(a) - prefectureOrder(b) || nameOrder(a, b);
  });
  const offset = (query.page - 1) * PAGE_SIZE;
  const { sortBy, sortOrder } = toApiSort(query.sort);
  return { items: filtered.slice(offset, offset + PAGE_SIZE), total: filtered.length,
    limit: PAGE_SIZE, offset, has_more: offset + PAGE_SIZE < filtered.length, sort_by: sortBy, sort_order: sortOrder };
}

export function getCatalogLighthouse(slug: string): Lighthouse | undefined {
  return catalog.find((record) => record.slug === slug && record.is_active);
}
