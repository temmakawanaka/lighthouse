"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { SortOption } from "@/lib/query-params";

interface SortSelectProps {
  value: SortOption;
}

export function SortSelect({ value }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(nextValue: SortOption) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextValue === "prefecture") params.delete("sort");
    else params.set("sort", nextValue);
    params.delete("page");

    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    });
  }

  return (
    <div className="sort-control" aria-busy={isPending}>
      <label htmlFor="sort">並び替え</label>
      <select
        id="sort"
        value={value}
        disabled={isPending}
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
