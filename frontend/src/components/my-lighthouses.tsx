"use client";

import Link from "next/link";
import { catalog } from "@/lib/catalog";
import { LighthouseCard } from "./lighthouse-card";
import { useLighthouseStatus } from "./lighthouse-status-provider";
import { UserDataTransfer } from "./user-data-transfer";

export function MyLighthouses() {
  const { favorites, ready } = useLighthouseStatus();
  const favoriteRecords = catalog.filter(({ slug }) => favorites.includes(slug));

  if (!ready) return <p className="my-lighthouses__loading" aria-live="polite">保存した灯台を読み込んでいます。</p>;

  return (
    <>
      <StatusSection title="行きたい灯台" count={favoriteRecords.length} records={favoriteRecords}
        empty="一覧や詳細ページの「行きたい」から追加できます。" />
      <section className="status-panel status-panel--stamp"><div><p className="kicker">STAMP BOOK</p><h2>集めたスタンプ</h2><p>GPSチェックインで獲得した灯台を、スタンプ帳で確認できます。</p></div><Link className="button button--stamp" href="/stamps/">スタンプ帳を開く</Link></section>
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
