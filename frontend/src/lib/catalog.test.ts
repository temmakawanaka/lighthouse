import { describe, expect, it } from "vitest";
import { catalog, getCatalogLighthouse, searchCatalog } from "./catalog";
import { parseListQuery } from "./query-params";
import reviews from "@/data/visit-reviews.json";
import { PAGE_SIZE } from "./constants";
import { LIGHTHOUSE_50_SLUGS } from "@/data/lighthouse-50";

describe("bundled lighthouse directory", () => {
  it("contains the 16 climbable and additional sourced records with unique slugs", () => {
    expect(catalog).toHaveLength(52);
    expect(catalog.filter((record) => record.is_visitable)).toHaveLength(16);
    expect(catalog.filter((record) => record.gps_check_in_available !== false)).toHaveLength(52);
    expect(catalog.filter((record) => record.check_in_type === "viewpoint" && record.gps_check_in_note)).toHaveLength(7);
    expect(new Set(catalog.map((record) => record.slug)).size).toBe(catalog.length);
    expect(catalog.filter((record) => record.selections.includes("日本の灯台50選")).map(({ slug }) => slug).sort())
      .toEqual([...LIGHTHOUSE_50_SLUGS].sort());
    for (const record of catalog) {
      expect(getCatalogLighthouse(record.slug)).toEqual(record);
      expect(record.source_urls.length).toBeGreaterThan(0);
      const review = reviews[record.slug as keyof typeof reviews];
      if (record.is_visitable) {
        expect(record.source_urls).toContain(review.source_url);
        expect(record.visit_checked_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
    expect(getCatalogLighthouse("missing")).toBeUndefined();
  });

  it("keeps Hennasaki's canceled special event separate from ordinary visitor information", () => {
    const record = getCatalogLighthouse("hennasaki");
    expect(record?.visit_checked_at).toBe("2026-10-23");
    expect(record?.visit_notice).toContain("2026年10月25日に予定されていた無料の一般公開イベント");
    expect(record?.visit_notice).toContain("台風接近に伴い中止");
    expect(record?.is_visitable).toBe(true);
    expect(record?.visit_notice).toContain("通常参観の実施状況は最新の公式案内");
    expect(record?.admission_info).toContain("300円");
    expect(record?.visit_info).toContain("10〜2月13:00〜16:30");
  });

  it("keeps Zanpamisaki's canceled maintenance conditional on weather and preserves lunch closure", () => {
    const record = getCatalogLighthouse("zanpamisaki");
    expect(record?.visit_checked_at).toBe("2026-10-23");
    expect(record?.visit_notice).toContain("参観休止は取り消されました");
    expect(record?.visit_notice).toContain("天候によって参観休止となる場合");
    expect(record?.visit_notice).toContain("通常の12:00〜13:00の昼休業は継続");
    expect(record?.is_visitable).toBe(true);
    expect(record?.admission_info).toContain("300円");
  });

  it("keeps upcoming Shiriyazaki closures and removes the expired date", () => {
    const record = getCatalogLighthouse("shiriyazaki");
    expect(record?.visit_checked_at).toBe("2026-10-23");
    expect(record?.visit_notice).toContain("10月27日9:00〜10:00");
    expect(record?.visit_notice).toContain("11月4日終日");
    expect(record?.visit_notice).not.toContain("10月20日");
  });

  it("keeps Tsunoshima reopening dependent on work completion and its outage contact temporary", () => {
    const record = getCatalogLighthouse("tsunoshima");
    expect(record?.visit_checked_at).toBe("2026-10-23");
    expect(record?.visit_notice).toContain("11月20日9:00〜12:00");
    expect(record?.visit_notice).toContain("作業終了後に再開予定");
    expect(record?.visit_notice).toContain("復旧までのお問い合わせ");
    expect(record?.visit_notice).toContain("03-3501-1054／info@tokokai.org");
    expect(record?.visit_notice).not.toContain("10月19日");
    expect(record?.is_visitable).toBe(true);
  });

  it.each(["御前崎", "御前埼", "ｵﾏｴｻｷ", "ＯＭＡＥＳＡＫＩ", "静岡 御前"])("finds the same lighthouse for %s", (q) => {
    expect(searchCatalog(parseListQuery({ q })).items.map((record) => record.slug)).toEqual(["omaesaki"]);
  });

  it("combines filters and pagination without duplicate or missing records", () => {
    const first = searchCatalog(parseListQuery({}));
    const second = searchCatalog(parseListQuery({ page: "2" }));
    expect(first.items).toHaveLength(12);
    expect(second.items).toHaveLength(12);
    expect(first.has_more).toBe(true);
    expect(second.has_more).toBe(true);
    expect(new Set([...first.items, ...second.items].map((record) => record.slug)).size).toBe(PAGE_SIZE * 2);
    expect(searchCatalog(parseListQuery({ prefecture: "静岡県", visitable: "true" })).total).toBe(2);
    expect(searchCatalog(parseListQuery({ prefecture: "静岡県", q: "犬吠埼" })).total).toBe(0);
  });

  it("sorts dates in both directions and leaves unknown dates last without mutating records", () => {
    const records = catalog.slice(0, 4).map((record, index) => index ? record : { ...record, first_lit_date: null });
    const original = [...records];
    for (const sort of ["first_lit_date_asc", "first_lit_date_desc"]) {
      const items = searchCatalog(parseListQuery({ sort }), records).items;
      expect(items.at(-1)?.first_lit_date).toBeNull();
      const dates = items.slice(0, -1).map((record) => record.first_lit_date);
      expect(dates).toEqual(sort.endsWith("desc") ? [...dates].sort().reverse() : [...dates].sort());
    }
    expect(records).toEqual(original);
  });

  it("excludes inactive records and distinguishes unknown from visitable", () => {
    const records = [
      { ...catalog[0], is_active: false },
      { ...catalog[1], is_visitable: null },
      { ...catalog[2], is_visitable: false },
      catalog[3],
    ];
    expect(searchCatalog(parseListQuery({}), records).total).toBe(3);
    expect(searchCatalog(parseListQuery({ visitable: "true" }), records).items).toEqual([catalog[3]]);
  });
});
