import { describe, expect, it } from "vitest";

import { buildPageHref, parseListQuery, toApiSort } from "./query-params";

describe("parseListQuery", () => {
  it("uses safe defaults when parameters are missing or invalid", () => {
    expect(parseListQuery({ page: "-2", sort: "unknown" })).toEqual({
      q: "",
      prefecture: "",
      visitable: false,
      sort: "prefecture",
      page: 1,
    });
  });

  it("normalizes supported search parameters", () => {
    expect(
      parseListQuery({
        q: "  犬吠埼  ",
        prefecture: "千葉県",
        visitable: "true",
        sort: "first_lit_date_desc",
        page: "2",
      }),
    ).toEqual({
      q: "犬吠埼",
      prefecture: "千葉県",
      visitable: true,
      sort: "first_lit_date_desc",
      page: 2,
    });
  });
});

describe("query helpers", () => {
  it("maps screen sort options to API parameters", () => {
    expect(toApiSort("first_lit_date_desc")).toEqual({
      sortBy: "first_lit_date",
      sortOrder: "desc",
    });
  });

  it("preserves active filters in pagination links", () => {
    const href = buildPageHref(
      {
        q: "犬吠埼",
        prefecture: "千葉県",
        visitable: true,
        sort: "name",
        page: 1,
      },
      2,
    );

    expect(href).toBe(
      "/?q=%E7%8A%AC%E5%90%A0%E5%9F%BC&prefecture=%E5%8D%83%E8%91%89%E7%9C%8C&visitable=true&sort=name&page=2",
    );
  });
});
