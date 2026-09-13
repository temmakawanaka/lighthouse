import type { Metadata } from "next";
import Link from "next/link";

import { JapanLighthouseMap } from "@/components/japan-lighthouse-map";
import { NearestLighthouses } from "@/components/nearest-lighthouses";
import { LighthousePinMap } from "@/components/lighthouse-pin-map";

export const metadata: Metadata = {
  title: "地図から灯台を探す",
  description: "日本各地の灯台をピン地図や現在地から探し、GPSスタンプの獲得状況を確認できます。",
  alternates: { canonical: "/map/" },
};

export default function MapPage() {
  return (
    <main id="main-content" className="map-page">
      <header className="subpage-heading">
        <div className="shell">
          <p className="kicker">LIGHTHOUSE MAP</p>
          <h1>地図から灯台を探す</h1>
          <p>灯台ピンと現在地から、次に訪れる海辺を探せます。</p>
        </div>
      </header>
      <div className="shell map-page__content">
        <LighthousePinMap />
        <NearestLighthouses />
        <JapanLighthouseMap />
        <p className="map-page__note">道路や周辺施設は、各灯台の詳細ページからGoogle Mapsで確認できます。</p>
        <Link className="button button--secondary" href="/">条件を指定して一覧から探す</Link>
      </div>
    </main>
  );
}
