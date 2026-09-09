import type { LighthouseSortField, SortOrder } from "@/types/lighthouse";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type SortOption =
  | "prefecture"
  | "name"
  | "first_lit_date_asc"
  | "first_lit_date_desc";

export interface ListQuery {
  q: string;
  prefecture: string;
  visitable: boolean;
  sort: SortOption;
  page: number;
}

export interface ApiSort {
  sortBy: LighthouseSortField;
  sortOrder: SortOrder;
}

const SORT_OPTIONS: SortOption[] = [
  "prefecture",
  "name",
  "first_lit_date_asc",
  "first_lit_date_desc",
];

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function parseListQuery(searchParams: RawSearchParams): ListQuery {
  const pageValue = firstValue(searchParams.page);
  const rawPage = /^\d+$/.test(pageValue) ? Number(pageValue) : NaN;
  const rawSort = firstValue(searchParams.sort) as SortOption;

  return {
    q: firstValue(searchParams.q).trim().slice(0, 120),
    prefecture: firstValue(searchParams.prefecture).trim().slice(0, 40),
    visitable: firstValue(searchParams.visitable) === "true",
    sort: SORT_OPTIONS.includes(rawSort) ? rawSort : "prefecture",
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1,
  };
}

export function safeReturnHref(value: string | null): string {
  if (!value || !value.startsWith("/?") || value.length > 2000) return "/";
  const params = new URLSearchParams(value.slice(2));
  const raw = Object.fromEntries([...params.keys()].map((key) => [key, params.getAll(key)]));
  const query = parseListQuery(raw);
  return buildPageHref(query, query.page);
}

export function toApiSort(sort: SortOption): ApiSort {
  switch (sort) {
    case "name":
      return { sortBy: "name", sortOrder: "asc" };
    case "first_lit_date_asc":
      return { sortBy: "first_lit_date", sortOrder: "asc" };
    case "first_lit_date_desc":
      return { sortBy: "first_lit_date", sortOrder: "desc" };
    default:
      return { sortBy: "prefecture", sortOrder: "asc" };
  }
}

export function buildPageHref(query: ListQuery, page: number): string {
  const params = new URLSearchParams();

  if (query.q) params.set("q", query.q);
  if (query.prefecture) params.set("prefecture", query.prefecture);
  if (query.visitable) params.set("visitable", "true");
  if (query.sort !== "prefecture") params.set("sort", query.sort);
  if (page > 1) params.set("page", String(page));

  const queryString = params.toString();
  return queryString ? `/?${queryString}` : "/";
}
