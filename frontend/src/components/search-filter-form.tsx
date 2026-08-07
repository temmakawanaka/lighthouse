"use client";

import { FormEvent } from "react";

import { PREFECTURES } from "@/lib/constants";

import { useSearchNavigation } from "./search-navigation-provider";

export function SearchFilterForm() {
  const { clearSearchParams, isPending, params, updateSearchParams } = useSearchNavigation();
  const q = params.get("q") ?? "";
  const prefecture = params.get("prefecture") ?? "";
  const visitable = params.get("visitable") === "true";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateSearchParams({ q: String(formData.get("q") ?? "").trim() || null });
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
          onChange={(event) =>
            updateSearchParams({ prefecture: event.target.value || null })
          }
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
          onChange={(event) =>
            updateSearchParams({ visitable: event.target.checked ? "true" : null })
          }
        />
        <span>登れる灯台のみ</span>
      </label>

      <div className="search-panel__actions">
        <button className="button button--primary" type="submit" disabled={isPending}>
          {isPending ? "検索中…" : "検索する"}
        </button>
        <button className="button button--quiet" type="button" onClick={clearSearchParams}>
          条件をクリア
        </button>
      </div>
    </form>
  );
}
