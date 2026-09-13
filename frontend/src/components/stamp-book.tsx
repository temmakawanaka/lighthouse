"use client";

import Link from "next/link";
import { catalog } from "@/lib/catalog";
import { useLighthouseStatus } from "./lighthouse-status-provider";

export function StampBook() {
  const { stamps, ready } = useLighthouseStatus();
  const earned = Object.keys(stamps).filter((slug) => catalog.some((item) => item.slug === slug)).length;
  const climbable = catalog.filter((item) => item.is_visitable);
  const selected = catalog.filter((item) => item.selections.includes("日本の灯台50選"));
  const countEarned = (records: typeof catalog) => records.filter((item) => stamps[item.slug]).length;
  const milestones = [
    { count: 1, name: "はじめの灯" },
    { count: 5, name: "岬めぐり" },
    { count: 10, name: "海辺の旅人" },
    { count: 16, name: "十六灯制覇" },
    { count: catalog.length, name: "灯台蒐集家" },
  ];

  if (!ready) return <p className="stamp-book__loading" aria-live="polite">スタンプ帳を開いています。</p>;

  return <>
    <section className="stamp-progress" aria-labelledby="stamp-progress-heading">
      <div>
        <p className="kicker">COLLECTION</p>
        <h2 id="stamp-progress-heading">{earned} / {catalog.length} 基</h2>
        <p>現地でGPSチェックインした灯台だけが、朱色のスタンプになります。</p>
      </div>
      <div className="stamp-progress__rings" aria-label={`全${catalog.length}基中${earned}基を獲得`}>
        <strong>{Math.round(earned / catalog.length * 100)}%</strong><span>収集率</span>
      </div>
      <progress max={catalog.length} value={earned}>{earned} / {catalog.length}</progress>
    </section>
    <div className="stamp-series" aria-label="シリーズ別の収集状況">
      <p><strong>のぼれる灯台</strong><span>{countEarned(climbable)} / {climbable.length}</span></p>
      <p><strong>日本の灯台50選</strong><span>{countEarned(selected)} / {selected.length}</span></p>
    </div>
    <section className="stamp-milestones" aria-labelledby="milestone-heading"><div><p className="kicker">ACHIEVEMENTS</p><h2 id="milestone-heading">収集バッジ</h2></div><ol>{milestones.map((milestone) => <li className={earned >= milestone.count ? "is-earned" : ""} key={milestone.count}><span aria-hidden="true">{earned >= milestone.count ? "★" : "◇"}</span><strong>{milestone.name}</strong><small>{milestone.count}基</small></li>)}</ol></section>
    <section className="stamp-grid" aria-label="灯台スタンプ一覧">
      {catalog.map((lighthouse) => {
        const stamp = stamps[lighthouse.slug];
        return <article className={`stamp-slot${stamp ? " stamp-slot--earned" : ""}`} key={lighthouse.slug}>
          <div className="stamp-seal" aria-hidden="true">
            <span>{lighthouse.prefecture?.replace(/[都府県]$/, "")}</span>
            <strong>灯</strong>
            <small>{stamp ? new Date(stamp.obtainedAt).toLocaleDateString("ja-JP") : "未取得"}</small>
          </div>
          <div><p>{stamp ? "CHECKED IN" : "DISCOVER"}</p><h3>{lighthouse.name}</h3><span>{lighthouse.municipality}</span></div>
          <Link href={`/lighthouses/${lighthouse.slug}?from=${encodeURIComponent("/stamps/")}`}>{stamp ? "記録を見る" : "場所を確認"}<span aria-hidden="true"> →</span></Link>
        </article>;
      })}
    </section>
  </>;
}
