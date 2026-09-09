"use client";

import Link from "next/link";
import { catalog } from "@/lib/catalog";
import { LighthouseCard } from "./lighthouse-card";
import { useLighthouseStatus } from "./lighthouse-status-provider";

export function MyLighthouses() {
  const { favorites, visited, ready } = useLighthouseStatus();
  const favoriteRecords = catalog.filter(({ slug }) => favorites.includes(slug));
  const visitedRecords = catalog.filter(({ slug }) => visited.includes(slug));

  if (!ready) return <p className="my-lighthouses__loading" aria-live="polite">保存した灯台を読み込んでいます。</p>;

  return (
    <>
      <StatusSection title="行きたい灯台" count={favoriteRecords.length} records={favoriteRecords}
        empty="一覧や詳細ページの「行きたい」から追加できます。" />
      <StatusSection title="訪問済みの灯台" count={visitedRecords.length} records={visitedRecords}
        empty="訪れた灯台を「訪問記録」から残せます。" />
    </>
  );
}

function StatusSection({ title, count, records, empty }: {
  title: string;
  count: number;
  records: typeof catalog;
  empty: string;
}) {
  return (
    <section className="my-lighthouses__section" aria-labelledby={`status-${title}`}>
      <div className="results-toolbar">
        <h2 id={`status-${title}`}>{title} <span>{count}件</span></h2>
      </div>
      {records.length ? (
        <div className="lighthouse-grid">
          {records.map((lighthouse, index) => <LighthouseCard key={lighthouse.slug} lighthouse={lighthouse} sequence={index + 1} />)}
        </div>
      ) : (
        <div className="status-panel status-panel--compact">
          <p>{empty}</p>
          <Link className="button button--secondary" href="/">灯台一覧を見る</Link>
        </div>
      )}
    </section>
  );
}
