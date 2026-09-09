"use client";

import Link from "next/link";
import { useState } from "react";
import { catalog } from "@/lib/catalog";
import { formatLocation } from "@/lib/format";
import { distanceKm } from "@/lib/trip-plan";

type Nearest = { lighthouse: typeof catalog[number]; distance: number };

export function NearestLighthouses() {
  const [nearest, setNearest] = useState<Nearest[] | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setState("error");
      setMessage("このブラウザでは現在地を取得できません。都道府県一覧をご利用ください。");
      return;
    }
    setState("loading");
    setMessage("現在地を確認しています…");
    navigator.geolocation.getCurrentPosition((position) => {
      const current = { latitude: String(position.coords.latitude), longitude: String(position.coords.longitude) };
      setNearest(catalog.map((lighthouse) => ({ lighthouse, distance: distanceKm(current, lighthouse) }))
        .sort((first, second) => first.distance - second.distance).slice(0, 5));
      setState("idle");
      setMessage("現在地に近い順で表示しました。");
    }, (error) => {
      setState("error");
      setMessage(error.code === error.PERMISSION_DENIED
        ? "現在地の利用が許可されませんでした。ブラウザの設定を確認するか、都道府県一覧をご利用ください。"
        : "現在地を取得できませんでした。電波状況を確認して、もう一度お試しください。");
    }, { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 });
  };

  return <section className="nearest-search" aria-labelledby="nearest-heading">
    <div className="nearest-search__intro"><div><p className="kicker">NEAR YOU</p><h2 id="nearest-heading">現在地の近くから探す</h2><p>位置情報は距離計算だけに使い、保存・送信しません。</p></div><button className="button button--primary" type="button" onClick={locate} disabled={state === "loading"}>{state === "loading" ? "確認中…" : "現在地から探す"}</button></div>
    {message && <p className={state === "error" ? "nearest-search__message nearest-search__message--error" : "nearest-search__message"} role="status">{message}</p>}
    {nearest && <ol className="nearest-list">
      {nearest.map(({ lighthouse, distance }, index) => <li key={lighthouse.slug}><span className="nearest-list__rank" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><strong>{lighthouse.name}</strong><span>{formatLocation(lighthouse.prefecture, lighthouse.municipality)}</span></div><span className="nearest-list__distance">約 {Math.round(distance)} km<small>直線距離</small></span><Link className="text-link" href={`/lighthouses/${lighthouse.slug}?from=${encodeURIComponent("/map/")}`} aria-label={`${lighthouse.name}の詳細を見る`}>詳細 →</Link></li>)}
    </ol>}
  </section>;
}
