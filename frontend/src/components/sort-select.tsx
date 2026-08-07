"use client";

import type { SortOption } from "@/lib/query-params";

import { useSearchNavigation } from "./search-navigation-provider";

const SORT_OPTIONS: SortOption[] = [
  "prefecture",
  "name",
  "first_lit_date_asc",
  "first_lit_date_desc",
];

export function SortSelect() {
  const { isPending, params, updateSearchParams } = useSearchNavigation();
  const rawValue = params.get("sort") as SortOption;
  const value = SORT_OPTIONS.includes(rawValue) ? rawValue : "prefecture";

  function handleChange(nextValue: SortOption) {
    updateSearchParams({ sort: nextValue === "prefecture" ? null : nextValue });
  }

  return (
    <div className="sort-control" aria-busy={isPending}>
      <label htmlFor="sort">並び替え</label>
      <select
        id="sort"
        value={value}
        onChange={(event) => handleChange(event.target.value as SortOption)}
      >
        <option value="prefecture">地域順</option>
        <option value="name">名前順</option>
        <option value="first_lit_date_asc">初点灯が古い順</option>
        <option value="first_lit_date_desc">初点灯が新しい順</option>
      </select>
    </div>
  );
}
