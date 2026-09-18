"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { catalog } from "@/lib/catalog";
import { formatLocation } from "@/lib/format";
import { emptyTripPlan, googleMapsRouteUrl, MAX_TRIP_STOPS, parseSharedTrip, parseTripPlan, routeDistanceKm, sharedTripQuery, TRIP_STORAGE_KEY, type TripPlan } from "@/lib/trip-plan";
import { useLighthouseStatus } from "./lighthouse-status-provider";
import { LighthousePhoto } from "./lighthouse-photo";

const validSlugs = new Set(catalog.map(({ slug }) => slug));

export function TripPlanner() {
  const { favorites, ready: statusReady } = useLighthouseStatus();
  const [plan, setPlan] = useState<TripPlan>(emptyTripPlan);
  const [ready, setReady] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [sharedPlan, setSharedPlan] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const shared = parseSharedTrip(window.location.search, validSlugs);
        setPlan(shared ?? parseTripPlan(window.localStorage.getItem(TRIP_STORAGE_KEY), validSlugs));
        setSharedPlan(Boolean(shared));
      }
      catch { setPlan(emptyTripPlan); }
      setReady(true);
    });
    const synchronize = () => {
      try { setPlan(parseTripPlan(window.localStorage.getItem(TRIP_STORAGE_KEY), validSlugs)); } catch { setPlan(emptyTripPlan); }
    };
    window.addEventListener("lighthouse-trip-updated", synchronize);
    return () => window.removeEventListener("lighthouse-trip-updated", synchronize);
  }, []);

  const updatePlan = (next: TripPlan) => {
    setPlan(next);
    setSharedPlan(false);
    try { window.localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(next)); } catch { /* keep current-tab state */ }
  };

  const saveSharedPlan = () => {
    try {
      window.localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(plan));
      setSharedPlan(false);
      setAnnouncement("共有された旅程をこの端末に保存しました。");
    } catch {
      setAnnouncement("旅程を保存できませんでした。");
    }
  };

  const sharePlan = async () => {
    const url = `${window.location.origin}${window.location.pathname}?${sharedTripQuery(plan)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "灯台めぐりの旅程", text: `${plan.stops.length}基をめぐる灯台旅程`, url });
        setAnnouncement("旅程を共有しました。");
      } else {
        await navigator.clipboard.writeText(url);
        setAnnouncement("共有URLをコピーしました。");
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setAnnouncement("共有できませんでした。ブラウザの設定をご確認ください。");
    }
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
          {sharedPlan && <div className="shared-trip-notice" role="status"><p>共有された旅程を表示しています。まだこの端末には保存していません。</p><button type="button" onClick={saveSharedPlan}>この旅程を保存</button></div>}
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
          {selected.length > 0 && <button className="button button--secondary button--full trip-share" type="button" onClick={sharePlan}>この旅程を共有する</button>}
        </section>

        <section className="trip-candidates" aria-labelledby="trip-candidates-heading">
          <div className="trip-section-heading"><div><p className="kicker">STOPS</p><h2 id="trip-candidates-heading">灯台を選ぶ</h2></div></div>
          {plan.stops.length >= MAX_TRIP_STOPS && <p className="trip-limit" role="status">スマートフォンでも確実に開けるよう、1旅程は最大5基です。</p>}
          <ul className="trip-candidate-list">
            {candidates.map((lighthouse) => {
              const chosen = plan.stops.includes(lighthouse.slug);
              return <li key={lighthouse.slug}>
                <LighthousePhoto lighthouse={lighthouse} compact />
                <div><strong>{lighthouse.name}</strong><span>{formatLocation(lighthouse.prefecture, lighthouse.municipality)}</span>{favorites.includes(lighthouse.slug) && <small>★ 行きたい登録済み</small>}</div>
                <button type="button" aria-label={`${lighthouse.name}を旅程に${chosen ? "追加済み" : "追加"}`} aria-pressed={chosen} disabled={!chosen && plan.stops.length >= MAX_TRIP_STOPS} onClick={() => toggleStop(lighthouse.slug)}>
                  {chosen ? "選択済み" : "追加"}
                </button>
              </li>;
            })}
          </ul>
        </section>
      </div>
      <p className="trip-storage-note">旅程はこのブラウザだけに保存されます。共有URLに含まれるのは灯台名と予定日だけです。</p>
      <p className="sr-only" aria-live="polite">{announcement}</p>
      <div className="trip-back-links"><Link className="button button--secondary" href="/map/">地図から選び直す</Link><Link className="text-link" href="/my-lighthouses/">マイ灯台を見る →</Link></div>
    </>
  );
}
