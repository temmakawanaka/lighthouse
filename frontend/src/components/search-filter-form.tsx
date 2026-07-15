"use client";

import { FormEvent, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PREFECTURES } from "@/lib/constants";

interface SearchFilterFormProps {
  q: string;
  prefecture: string;
  visitable: boolean;
}

export function SearchFilterForm({ q, prefecture, visitable }: SearchFilterFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");

    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    update({ q: String(formData.get("q") ?? "").trim() || null });
  }

  function clearFilters() {
    startTransition(() => router.push(pathname));
  }

  return (
    <form className="search-panel" onSubmit={handleSubmit} aria-busy={isPending}>
      <div className="field field--search">
        <label htmlFor="lighthouse-query">キーワード</label>
        <div className="input-with-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            id="lighthouse-query"
            key={q}
            name="q"
            type="search"
            defaultValue={q}
            maxLength={120}
            placeholder="灯台名や地域を入力"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="prefecture">都道府県</label>
        <select
          id="prefecture"
          value={prefecture}
          onChange={(event) => update({ prefecture: event.target.value || null })}
        >
          <option value="">全国</option>
          {PREFECTURES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <label className="check-field">
        <input
          type="checkbox"
          checked={visitable}
          onChange={(event) => update({ visitable: event.target.checked ? "true" : null })}
        />
        <span>登れる灯台のみ</span>
      </label>

      <div className="search-panel__actions">
        <button className="button button--primary" type="submit" disabled={isPending}>
          {isPending ? "検索中…" : "検索する"}
        </button>
        <button className="button button--quiet" type="button" onClick={clearFilters}>
          条件をクリア
        </button>
      </div>
    </form>
  );
}
