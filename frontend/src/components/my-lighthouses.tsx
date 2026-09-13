"use client";

import Link from "next/link";
import { catalog } from "@/lib/catalog";
import { LighthouseCard } from "./lighthouse-card";
import { useLighthouseStatus } from "./lighthouse-status-provider";
import { UserDataTransfer } from "./user-data-transfer";

export function MyLighthouses() {
  const { favorites, visited, visits, stamps, ready, updateVisit } = useLighthouseStatus();
  const favoriteRecords = catalog.filter(({ slug }) => favorites.includes(slug));
  const visitedRecords = catalog.filter(({ slug }) => visited.includes(slug));

  if (!ready) return <p className="my-lighthouses__loading" aria-live="polite">保存した灯台を読み込んでいます。</p>;

  return (
    <>
      <StatusSection title="行きたい灯台" count={favoriteRecords.length} records={favoriteRecords}
        empty="一覧や詳細ページの「行きたい」から追加できます。" />
      <section className="my-lighthouses__section" aria-labelledby="visited-heading">
        <div className="results-toolbar"><h2 id="visited-heading">訪問済みの灯台 <span>{visitedRecords.length}件</span></h2></div>
        {visitedRecords.length ? <div className="visit-records">
          {visitedRecords.map((lighthouse) => {
            const visit = visits[lighthouse.slug] ?? { date: "", note: "" };
            return <article className="visit-record" key={lighthouse.slug}>
              <div className="visit-record__heading"><div><strong>{lighthouse.name}</strong><span>{lighthouse.prefecture} {lighthouse.municipality}</span>{stamps[lighthouse.slug] && <em className="visit-record__verified">GPSスタンプ獲得済み</em>}</div><Link className="text-link" href={`/lighthouses/${lighthouse.slug}?from=${encodeURIComponent("/my-lighthouses/")}`}>詳細を見る →</Link></div>
              <div className="visit-record__fields">
                <label>訪問日<input type="date" value={visit.date} onChange={(event) => updateVisit(lighthouse.slug, { ...visit, date: event.target.value })} /></label>
                <label>メモ<textarea value={visit.note} maxLength={500} rows={3} placeholder="景色や旅の思い出を残せます" onChange={(event) => updateVisit(lighthouse.slug, { ...visit, note: event.target.value })} /></label>
              </div>
            </article>;
          })}
        </div> : <div className="status-panel status-panel--compact"><p>訪れた灯台を「訪問記録」から残せます。</p><Link className="button button--secondary" href="/">灯台一覧を見る</Link></div>}
      </section>
      <section className="status-panel status-panel--stamp"><div><p className="kicker">STAMP BOOK</p><h2>現地で集めたスタンプ</h2><p>訪問メモとは別に、GPSで現地到着を確認した灯台だけがスタンプ帳へ残ります。</p></div><Link className="button button--stamp" href="/stamps/">スタンプ帳を開く</Link></section>
      <UserDataTransfer />
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
