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
    expect(catalog.filter((record) => record.gps_check_in_available !== false)).toHaveLength(45);
    expect(catalog.filter((record) => record.gps_check_in_available === false && record.gps_check_in_note)).toHaveLength(7);
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
