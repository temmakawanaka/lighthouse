"use client";

import Link from "next/link";
import { useState } from "react";
import { CHECK_IN_RADIUS_M, evaluateCheckIn } from "@/lib/check-in";
import type { Lighthouse } from "@/types/lighthouse";
import { useLighthouseStatus } from "./lighthouse-status-provider";

type State = "idle" | "locating" | "near" | "far" | "error";

export function GpsCheckIn({ lighthouse }: { lighthouse: Lighthouse }) {
  const { stamps, obtainStamp, ready } = useLighthouseStatus();
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const stamp = stamps[lighthouse.slug];
  const available = lighthouse.gps_check_in_available !== false;

  const checkIn = () => {
    if (!("geolocation" in navigator)) {
      setState("error");
      setMessage("この端末では現在地を取得できません。");
      return;
    }
    setState("locating");
    setMessage("現在地を確認しています…");
    navigator.geolocation.getCurrentPosition((position) => {
      const result = evaluateCheckIn(position.coords, lighthouse);
      if (!result.eligible) {
        setState("far");
        setMessage(result.accuracySufficient
          ? `灯台まで約${result.distanceM < 1000 ? `${Math.round(result.distanceM)}m` : `${(result.distanceM / 1000).toFixed(1)}km`}です。半径${CHECK_IN_RADIUS_M}m以内で再度お試しください。`
          : "現在地の精度が足りません。空が見える場所で少し待ってから、もう一度お試しください。");
        return;
      }
      const saved = obtainStamp(lighthouse.slug, {
        obtainedAt: new Date().toISOString(),
        distanceM: result.distanceM,
        accuracyM: result.accuracyM,
      });
      if (!saved) {
        setState("error");
        setMessage("スタンプをこの端末に保存できませんでした。空き容量やブラウザ設定を確認して、もう一度お試しください。");
        return;
      }
      setState("near");
      setMessage("GPSチェックインを確認しました。スタンプを獲得しました！");
    }, (error) => {
      setState("error");
      setMessage(error.code === error.PERMISSION_DENIED
        ? "位置情報が許可されていません。ブラウザの設定から許可してください。"
        : "現在地を取得できませんでした。屋外で電波状況を確認し、もう一度お試しください。");
    }, { enableHighAccuracy: true, timeout: 15_000, maximumAge: 10_000 });
  };

  return <section className={`check-in-card${stamp ? " check-in-card--earned" : ""}`} aria-labelledby="check-in-heading">
    <div className="check-in-card__stamp" aria-hidden="true">
      <span>{stamp ? "獲得" : "GPS"}</span>
      <strong>灯</strong>
      <small>{stamp ? new Date(stamp.obtainedAt).toLocaleDateString("ja-JP") : "CHECK IN"}</small>
    </div>
    <div className="check-in-card__body">
      <p className="kicker">LIGHTHOUSE STAMP</p>
      <h2 id="check-in-heading">{stamp ? "この灯台のスタンプを獲得済み" : available ? "現地でスタンプを獲得" : "安全なチェックイン地点を準備中"}</h2>
      {stamp ? <>
        <p>{new Date(stamp.obtainedAt).toLocaleString("ja-JP")}、灯台から約{stamp.distanceM}mでチェックインしました。</p>
        <Link className="text-link" href="/stamps/">スタンプ帳を見る →</Link>
      </> : available ? <>
        <p>灯台の半径{CHECK_IN_RADIUS_M}m以内で現在地を確認すると、端末にデジタルスタンプが残ります。</p>
        <button className="button button--stamp" type="button" disabled={!ready || state === "locating"} onClick={checkIn}>
          {state === "locating" ? "現在地を確認中…" : "GPSでチェックイン"}
        </button>
      </> : <p>{lighthouse.gps_check_in_note ?? "一般に到達できる安全な地点を確認できるまで、この灯台のGPSスタンプは停止しています。"}</p>}
      {message && <p className={`check-in-card__message check-in-card__message--${state}`} role="status">{message}</p>}
      <small>現在地は端末内の距離判定だけに使い、緯度・経度そのものは保存しません。この記録は本人用で、改ざん防止を伴う公式な訪問証明ではありません。</small>
    </div>
  </section>;
}
