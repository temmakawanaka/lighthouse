"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { catalog } from "@/lib/catalog";
import { getCheckInTarget } from "@/lib/check-in";
import { LIGHTHOUSE_REGIONS, getLighthouseRegion } from "@/lib/regions";
import { shareOrDownloadStampBook } from "@/lib/stamp-book-image";
import { StampCelebration } from "./stamp-celebration";
import { useLighthouseStatus } from "./lighthouse-status-provider";

type RegionFilter = "すべて" | (typeof LIGHTHOUSE_REGIONS)[number]["name"];

export function StampBook() {
  const { stamps, ready, testMode, setTestMode, obtainTestStamp, clearTestStamps } = useLighthouseStatus();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [celebrationSlug, setCelebrationSlug] = useState<string | null>(null);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("すべて");
  const [onlyUnearned, setOnlyUnearned] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [sharing, setSharing] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const earned = Object.keys(stamps).filter((slug) => catalog.some((item) => item.slug === slug)).length;
  const total = catalog.length;
  const climbable = catalog.filter((item) => item.is_visitable);
  const selected = catalog.filter((item) => item.selections.includes("日本の灯台50選"));
  const viewpoint = catalog.filter((item) => getCheckInTarget(item).kind === "viewpoint");
  const countEarned = (records: typeof catalog) => records.filter((item) => stamps[item.slug]).length;
  const milestones = [
    { count: 1, name: "はじめの灯" },
    { count: 5, name: "岬めぐり" },
    { count: 10, name: "海辺の旅人" },
    { count: 16, name: "十六灯制覇" },
    { count: total, name: "灯台蒐集家" },
  ];
  const selectedLighthouse = selectedSlug ? catalog.find((item) => item.slug === selectedSlug) : undefined;
  const selectedStamp = selectedLighthouse ? stamps[selectedLighthouse.slug] : undefined;
  const testStampCount = Object.values(stamps).filter((stamp) => stamp.source === "test").length;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selectedLighthouse && selectedStamp && dialog && !dialog.open) dialog.showModal();
  }, [selectedLighthouse, selectedStamp]);

  const shareBook = async () => {
    setSharing(true);
    setShareMessage("スタンプ帳の画像を作成しています…");
    try {
      const result = await shareOrDownloadStampBook(stamps);
      setShareMessage(result === "shared" ? "スタンプ帳を共有しました。" : "スタンプ帳の画像を保存しました。");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") setShareMessage("");
      else setShareMessage("画像を作成できませんでした。もう一度お試しください。");
    } finally {
      setSharing(false);
    }
  };

  const testStamp = (slug: string) => {
    if (obtainTestStamp(slug)) setCelebrationSlug(slug);
  };

  const visibleLighthouses = catalog.filter((lighthouse) =>
    (regionFilter === "すべて" || getLighthouseRegion(lighthouse.prefecture) === regionFilter)
    && (!onlyUnearned || !stamps[lighthouse.slug]));
  const celebrationLighthouse = celebrationSlug ? catalog.find((item) => item.slug === celebrationSlug) : undefined;

  if (!ready) return <p className="stamp-book__loading" aria-live="polite">スタンプ帳を開いています。</p>;

  return <>
    <section className="stamp-progress" aria-labelledby="stamp-progress-heading">
      <div>
        <p className="kicker">COLLECTION</p>
        <h2 id="stamp-progress-heading">{earned} / {total} 基</h2>
        <p>全{total}基を収録。現地{total - viewpoint.length}基と安全な遠望地点{viewpoint.length}基、すべてでGPSスタンプを集められます。</p>
      </div>
      <div className="stamp-progress__rings" aria-label={`収録${total}基中${earned}基を獲得`}>
        <strong>{Math.round(earned / total * 100)}%</strong><span>収集率</span>
      </div>
      <progress max={total} value={earned}>{earned} / {total}</progress>
    </section>
    <div className="stamp-series" aria-label="シリーズ別の収集状況">
      <p><strong>のぼれる灯台</strong><span>{countEarned(climbable)} / {climbable.length}</span></p>
      <p><strong>日本の灯台50選</strong><span>{countEarned(selected)} / {selected.length}</span></p>
      <p><strong>遠望スタンプ</strong><span>{countEarned(viewpoint)} / {viewpoint.length}</span></p>
    </div>
    <section className={`stamp-test-panel${testMode ? " is-active" : ""}`} aria-label="GPSを使わない確認用モード">
      <div><strong>確認用テストモード</strong><span>GPSを使わず、未取得スタンプを画面上で試せます。テスト印は実際のGPSスタンプと区別して保存されます。</span></div>
      <button className={`button ${testMode ? "button--secondary" : "button--primary"}`} type="button" aria-pressed={testMode} onClick={() => setTestMode(!testMode)}>{testMode ? "テストモードを終了" : "テストモードを開始"}</button>
      {testStampCount > 0 && <button className="stamp-test-panel__clear" type="button" onClick={clearTestStamps}>テスト印をすべて消す（{testStampCount}基）</button>}
      {testMode && <p role="status">テストモード中です。各未取得カードの「テストで押す」から、獲得後の表示を確認できます。</p>}
    </section>
    <section className="stamp-book-actions" aria-label="スタンプ帳の保存と共有">
      <div><strong>集めたスタンプを一枚の画像に</strong><span>地域の進捗と獲得済みスタンプをまとめます。</span></div>
      <button className="button button--primary" type="button" disabled={sharing} onClick={shareBook}>{sharing ? "画像を作成中…" : "画像で保存・共有"}</button>
      {shareMessage && <p role="status">{shareMessage}</p>}
    </section>
    <section className="stamp-milestones" aria-labelledby="milestone-heading"><div><p className="kicker">ACHIEVEMENTS</p><h2 id="milestone-heading">収集バッジ</h2></div><ol>{milestones.map((milestone) => <li className={earned >= milestone.count ? "is-earned" : ""} key={milestone.count}><span aria-hidden="true">{earned >= milestone.count ? "★" : "◇"}</span><strong>{milestone.name}</strong><small>{milestone.count}基</small></li>)}</ol></section>
    <section className="regional-progress" aria-labelledby="regional-progress-heading">
      <div><p className="kicker">REGIONAL COLLECTION</p><h2 id="regional-progress-heading">地域別コンプリート</h2></div>
      <div className="regional-progress__grid">{LIGHTHOUSE_REGIONS.map((region) => {
        const records = catalog.filter((item) => getLighthouseRegion(item.prefecture) === region.name);
        const regionEarned = countEarned(records);
        const complete = records.length > 0 && regionEarned === records.length;
        return <button type="button" className={`${complete ? "is-complete " : ""}${regionFilter === region.name ? "is-selected" : ""}`} key={region.name} aria-pressed={regionFilter === region.name} onClick={() => setRegionFilter(regionFilter === region.name ? "すべて" : region.name)}>
          <span className={complete ? "region-complete-seal" : ""} aria-hidden="true">{complete ? "制覇" : "◇"}</span><span><strong>{region.name}</strong><small>{regionEarned} / {records.length}基</small></span>
          <progress max={records.length} value={regionEarned}>{regionEarned} / {records.length}</progress>
        </button>;
      })}</div>
    </section>
    <div className="stamp-list-controls">
      <div><strong>{regionFilter === "すべて" ? "全国" : regionFilter}のスタンプ</strong><span>{visibleLighthouses.length}基を表示</span></div>
      <button type="button" aria-pressed={onlyUnearned} onClick={() => setOnlyUnearned(!onlyUnearned)}>{onlyUnearned ? "すべて表示" : "未取得だけ表示"}</button>
    </div>
    <section className="stamp-grid" aria-label="灯台スタンプ一覧">
      {visibleLighthouses.map((lighthouse) => {
        const stamp = stamps[lighthouse.slug];
        const isViewpoint = getCheckInTarget(lighthouse).kind === "viewpoint";
        const sealContent = <><span>{lighthouse.prefecture?.replace(/[都府県]$/, "")}</span><strong>{isViewpoint ? "望" : "灯"}</strong><small>{stamp ? new Date(stamp.obtainedAt).toLocaleDateString("ja-JP") : "未取得"}</small></>;
        return <article className={`stamp-slot${stamp ? " stamp-slot--earned" : ""}${stamp?.source === "test" ? " stamp-slot--test" : ""}${isViewpoint ? " stamp-slot--viewpoint" : ""}`} key={lighthouse.slug}>
          {stamp ? <button className="stamp-seal stamp-seal--button" type="button" onClick={() => setSelectedSlug(lighthouse.slug)} aria-label={`${lighthouse.name}のスタンプを拡大表示`}>
            {sealContent}
          </button> : <div className="stamp-seal" aria-hidden="true">
            {sealContent}
          </div>}
          <div><p>{stamp?.source === "test" ? "TEST STAMP" : isViewpoint ? "VIEWPOINT STAMP" : stamp ? "CHECKED IN" : "DISCOVER"}</p><h3>{lighthouse.name}</h3><span>{lighthouse.municipality}</span></div>
          <Link href={`/lighthouses/${lighthouse.slug}?from=${encodeURIComponent("/stamps/")}`}>{stamp ? "記録を見る" : isViewpoint ? "遠望地点を確認" : "場所を確認"}<span aria-hidden="true"> →</span></Link>
          {!stamp && testMode && <button className="stamp-slot__test" type="button" onClick={() => testStamp(lighthouse.slug)}>テストで押す</button>}
        </article>;
      })}
      {visibleLighthouses.length === 0 && <p className="stamp-grid__empty">この条件に当てはまる未取得スタンプはありません。</p>}
    </section>
    <dialog className={`stamp-detail-dialog${selectedLighthouse && getCheckInTarget(selectedLighthouse).kind === "viewpoint" ? " stamp-detail-dialog--viewpoint" : ""}`} ref={dialogRef} onClose={() => setSelectedSlug(null)} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      {selectedLighthouse && selectedStamp && <div className="stamp-detail-dialog__content">
        <button className="stamp-detail-dialog__close" type="button" onClick={() => dialogRef.current?.close()} aria-label="閉じる">×</button>
        <p className="kicker">{selectedStamp.source === "test" ? "TEST STAMP" : "COLLECTED STAMP"}</p>
        <div className="stamp-detail-dialog__seal" aria-hidden="true"><span>{selectedLighthouse.prefecture?.replace(/[都府県]$/, "")}</span><strong>{getCheckInTarget(selectedLighthouse).kind === "viewpoint" ? "望" : "灯"}</strong><small>{new Date(selectedStamp.obtainedAt).toLocaleDateString("ja-JP")}</small></div>
        <h2>{selectedLighthouse.name}</h2>
        <dl><div><dt>獲得日</dt><dd>{new Date(selectedStamp.obtainedAt).toLocaleString("ja-JP")}</dd></div><div><dt>地域</dt><dd>{getLighthouseRegion(selectedLighthouse.prefecture)}・{selectedLighthouse.prefecture}</dd></div><div><dt>種類</dt><dd>{selectedStamp.source === "test" ? "確認用テスト印" : getCheckInTarget(selectedLighthouse).kind === "viewpoint" ? "遠望スタンプ" : "現地スタンプ"}</dd></div>{selectedStamp.source !== "test" && <div><dt>チェックイン距離</dt><dd>約{selectedStamp.distanceM}m</dd></div>}</dl>
        <Link className="text-link" href={`/lighthouses/${selectedLighthouse.slug}/`} onClick={() => dialogRef.current?.close()}>灯台の詳細を見る →</Link>
      </div>}
    </dialog>
    {celebrationLighthouse && <StampCelebration lighthouse={celebrationLighthouse} open onClose={() => setCelebrationSlug(null)} />}
  </>;
}
