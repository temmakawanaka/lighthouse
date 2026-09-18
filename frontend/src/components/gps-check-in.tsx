"use client";

import Link from "next/link";
import { useState } from "react";
import { evaluateCheckIn, getCheckInTarget } from "@/lib/check-in";
import type { Lighthouse } from "@/types/lighthouse";
import { StampCelebration } from "./stamp-celebration";
import { useLighthouseStatus } from "./lighthouse-status-provider";

type State = "idle" | "locating" | "near" | "far" | "error";

export function GpsCheckIn({ lighthouse }: { lighthouse: Lighthouse }) {
  const { stamps, obtainStamp, obtainTestStamp, testMode, ready } = useLighthouseStatus();
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const [celebrating, setCelebrating] = useState(false);
  const stamp = stamps[lighthouse.slug];
  const target = getCheckInTarget(lighthouse);
  const isViewpoint = target.kind === "viewpoint";
  const targetMapUrl = `https://www.google.com/maps/search/?api=1&query=${target.latitude},${target.longitude}`;
  const isTestStamp = stamp?.source === "test";

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
          ? `${target.locationName}まで約${result.distanceM < 1000 ? `${Math.round(result.distanceM)}m` : `${(result.distanceM / 1000).toFixed(1)}km`}です。半径${target.radiusM}m以内で再度お試しください。`
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
      setMessage(isViewpoint ? "遠望地点でのGPSチェックインを確認しました。遠望スタンプを獲得しました！" : "GPSチェックインを確認しました。スタンプを獲得しました！");
      setCelebrating(true);
    }, (error) => {
      setState("error");
      setMessage(error.code === error.PERMISSION_DENIED
        ? "位置情報が許可されていません。ブラウザの設定から許可してください。"
        : "現在地を取得できませんでした。屋外で電波状況を確認し、もう一度お試しください。");
    }, { enableHighAccuracy: true, timeout: 15_000, maximumAge: 10_000 });
  };

  const testCheckIn = () => {
    const saved = obtainTestStamp(lighthouse.slug);
    if (!saved) {
      setState("error");
      setMessage("テスト印をこの端末に保存できませんでした。ブラウザ設定を確認して、もう一度お試しください。");
      return;
    }
    setState("near");
    setMessage("GPSを使わず、確認用のテスト印を押しました。スタンプ帳からまとめて削除できます。");
    setCelebrating(true);
  };

  return <><section className={`check-in-card${stamp ? " check-in-card--earned" : ""}${isViewpoint ? " check-in-card--viewpoint" : ""}${isTestStamp ? " check-in-card--test" : ""}${state === "near" ? " check-in-card--just-earned" : ""}`} aria-labelledby="check-in-heading">
    <div className="check-in-card__stamp" aria-hidden="true">
      <span>{isTestStamp ? "確認用" : stamp ? "獲得" : isViewpoint ? "遠望" : "GPS"}</span>
      <strong>{isViewpoint ? "望" : "灯"}</strong>
      <small>{stamp ? new Date(stamp.obtainedAt).toLocaleDateString("ja-JP") : "CHECK IN"}</small>
    </div>
    <div className="check-in-card__body">
      <p className="kicker">{isViewpoint ? "VIEWPOINT STAMP" : "LIGHTHOUSE STAMP"}</p>
      <h2 id="check-in-heading">{isTestStamp ? "確認用のテスト印を獲得済み" : stamp ? `${isViewpoint ? "遠望" : "現地"}スタンプを獲得済み` : isViewpoint ? "安全な遠望地点でスタンプを獲得" : "現地でスタンプを獲得"}</h2>
      {stamp ? <>
        <p>{isTestStamp ? `${new Date(stamp.obtainedAt).toLocaleString("ja-JP")}、GPSを使わずにテスト取得しました。` : `${new Date(stamp.obtainedAt).toLocaleString("ja-JP")}、${target.locationName}から約${stamp.distanceM}mでチェックインしました。`}</p>
        <Link className="text-link" href="/stamps/">スタンプ帳を見る →</Link>
      </> : <>
        <p>{isViewpoint ? lighthouse.gps_check_in_note : `灯台の半径${target.radiusM}m以内で現在地を確認すると、端末にデジタルスタンプが残ります。`}</p>
        {isViewpoint && <p className="check-in-card__target"><strong>チェックイン地点：</strong>{target.locationName}（半径{target.radiusM}m） <a href={targetMapUrl} target="_blank" rel="noreferrer">地図を開く ↗</a>{target.sourceUrl && <>　<a href={target.sourceUrl} target="_blank" rel="noreferrer">公式案内 ↗</a></>}</p>}
        <div className="check-in-card__actions">
          <button className="button button--stamp" type="button" disabled={!ready || state === "locating"} onClick={checkIn}>
            {state === "locating" ? "現在地を確認中…" : isViewpoint ? "遠望地点でチェックイン" : "GPSでチェックイン"}
          </button>
          {testMode && <button className="button button--secondary" type="button" disabled={!ready || state === "locating"} onClick={testCheckIn}>GPSなしでテスト取得</button>}
        </div>
      </>}
      {message && <p className={`check-in-card__message check-in-card__message--${state}`} role="status">{message}</p>}
      <small>{isTestStamp ? "これは確認用のテスト印です。実際のGPSチェックイン記録ではありません。" : "現在地は端末内の距離判定だけに使い、緯度・経度そのものは保存しません。この記録は本人用で、改ざん防止を伴う公式な訪問証明ではありません。"}</small>
    </div>
  </section>{celebrating && <StampCelebration lighthouse={lighthouse} open onClose={() => setCelebrating(false)} />}</>;
}
