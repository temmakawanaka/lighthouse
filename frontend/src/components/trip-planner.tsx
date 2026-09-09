"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { catalog } from "@/lib/catalog";
import { formatLocation } from "@/lib/format";
import { emptyTripPlan, googleMapsRouteUrl, MAX_TRIP_STOPS, parseTripPlan, routeDistanceKm, TRIP_STORAGE_KEY, type TripPlan } from "@/lib/trip-plan";
import { useLighthouseStatus } from "./lighthouse-status-provider";

const validSlugs = new Set(catalog.map(({ slug }) => slug));

export function TripPlanner() {
  const { favorites, ready: statusReady } = useLighthouseStatus();
  const [plan, setPlan] = useState<TripPlan>(emptyTripPlan);
  const [ready, setReady] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      try { setPlan(parseTripPlan(window.localStorage.getItem(TRIP_STORAGE_KEY), validSlugs)); }
      catch { setPlan(emptyTripPlan); }
      setReady(true);
    });
  }, []);

  const updatePlan = (next: TripPlan) => {
    setPlan(next);
    try { window.localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(next)); } catch { /* keep current-tab state */ }
  };

  const selected = plan.stops.map((slug) => catalog.find((record) => record.slug === slug)).filter((record): record is typeof catalog[number] => Boolean(record));
  const candidates = useMemo(() => [...catalog].sort((first, second) => {
    const favoriteDifference = Number(favorites.includes(second.slug)) - Number(favorites.includes(first.slug));
    return favoriteDifference || (first.name_kana ?? first.name).localeCompare(second.name_kana ?? second.name, "ja-JP");
  }), [favorites]);
  const routeUrl = googleMapsRouteUrl(selected);

  const toggleStop = (slug: string) => {
    if (plan.stops.includes(slug)) {
      updatePlan({ ...plan, stops: plan.stops.filter((value) => value !== slug) });
      setAnnouncement("旅程から削除しました。");
    } else if (plan.stops.length < MAX_TRIP_STOPS) {
      updatePlan({ ...plan, stops: [...plan.stops, slug] });
      setAnnouncement(`${plan.stops.length + 1}番目の訪問先に追加しました。`);
    }
  };

  const moveStop = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= plan.stops.length) return;
    const stops = [...plan.stops];
    [stops[index], stops[destination]] = [stops[destination], stops[index]];
    updatePlan({ ...plan, stops });
    setAnnouncement(`${catalog.find(({ slug }) => slug === stops[destination])?.name}を${destination + 1}番目に移動しました。`);
  };

  if (!ready || !statusReady) return <p className="trip-planner__loading" aria-live="polite">旅程を読み込んでいます。</p>;

  return (
    <>
      <div className="trip-planner">
        <section className="trip-plan" aria-labelledby="trip-order-heading">
          <div className="trip-section-heading">
            <div><p className="kicker">ROUTE</p><h2 id="trip-order-heading">訪問する順番</h2></div>
            <span>{selected.length} / {MAX_TRIP_STOPS}基</span>
          </div>
          <label className="trip-date">訪問予定日（任意）
            <input type="date" value={plan.date} onChange={(event) => updatePlan({ ...plan, date: event.target.value })} />
          </label>
          {selected.length ? (
            <ol className="trip-stop-list">
              {selected.map((lighthouse, index) => (
                <li key={lighthouse.slug}>
                  <span className="trip-stop__number">{index + 1}</span>
                  <div><strong>{lighthouse.name}</strong><span>{formatLocation(lighthouse.prefecture, lighthouse.municipality)}</span></div>
                  <div className="trip-stop__moves">
                    <button type="button" disabled={index === 0} onClick={() => moveStop(index, -1)} aria-label={`${lighthouse.name}を1つ上へ`}>↑</button>
                    <button type="button" disabled={index === selected.length - 1} onClick={() => moveStop(index, 1)} aria-label={`${lighthouse.name}を1つ下へ`}>↓</button>
                    <button type="button" onClick={() => toggleStop(lighthouse.slug)} aria-label={`${lighthouse.name}を旅程から削除`}>×</button>
                  </div>
                </li>
              ))}
            </ol>
          ) : <div className="trip-empty"><p>下の一覧から、訪れたい灯台を順番に選んでください。</p></div>}
          <div className="trip-summary">
            <p><span>直線距離の目安</span><strong>{selected.length > 1 ? `${Math.round(routeDistanceKm(selected))} km` : "—"}</strong></p>
            <small>道路距離・所要時間・フェリーの有無はGoogle Mapsでご確認ください。</small>
          </div>
          {routeUrl ? <a className="button button--primary button--full" href={routeUrl} target="_blank" rel="noreferrer">Google Mapsでルートを開く <span aria-hidden="true">↗</span><span className="sr-only">（新しいタブまたは外部アプリで開きます）</span></a>
            : <p className="trip-route-hint">2基以上を選ぶとルートを開けます。</p>}
        </section>

        <section className="trip-candidates" aria-labelledby="trip-candidates-heading">
          <div className="trip-section-heading"><div><p className="kicker">STOPS</p><h2 id="trip-candidates-heading">灯台を選ぶ</h2></div></div>
          {plan.stops.length >= MAX_TRIP_STOPS && <p className="trip-limit" role="status">スマートフォンでも確実に開けるよう、1旅程は最大5基です。</p>}
          <ul className="trip-candidate-list">
            {candidates.map((lighthouse) => {
              const chosen = plan.stops.includes(lighthouse.slug);
              const imageSource = lighthouse.slug === "omaesaki" ? "/images/omaezaki-lighthouse-alpsdake.jpg" : `/images/${lighthouse.slug}.jpg`;
              return <li key={lighthouse.slug}>
                <Image src={imageSource} alt="" width={96} height={72} unoptimized />
                <div><strong>{lighthouse.name}</strong><span>{formatLocation(lighthouse.prefecture, lighthouse.municipality)}</span>{favorites.includes(lighthouse.slug) && <small>★ 行きたい登録済み</small>}</div>
                <button type="button" aria-label={`${lighthouse.name}を旅程に${chosen ? "追加済み" : "追加"}`} aria-pressed={chosen} disabled={!chosen && plan.stops.length >= MAX_TRIP_STOPS} onClick={() => toggleStop(lighthouse.slug)}>
                  {chosen ? "選択済み" : "追加"}
                </button>
              </li>;
            })}
          </ul>
        </section>
      </div>
      <p className="trip-storage-note">旅程はこのブラウザだけに保存されます。料金はかかりません。</p>
      <p className="sr-only" aria-live="polite">{announcement}</p>
      <div className="trip-back-links"><Link className="button button--secondary" href="/map/">地図から選び直す</Link><Link className="text-link" href="/my-lighthouses/">マイ灯台を見る →</Link></div>
    </>
  );
}
