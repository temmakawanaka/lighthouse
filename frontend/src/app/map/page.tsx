import type { Metadata } from "next";
import Link from "next/link";

import { JapanLighthouseMap } from "@/components/japan-lighthouse-map";

export const metadata: Metadata = {
  title: "地図から灯台を探す",
  description: "のぼれる灯台16を、日本地図と都道府県から探せます。",
};

export default function MapPage() {
  return (
    <main id="main-content" className="map-page">
      <header className="subpage-heading">
        <div className="shell">
          <p className="kicker">LIGHTHOUSE MAP</p>
          <h1>地図から灯台を探す</h1>
          <p>色のついた都道府県、または灯台名から選べます。</p>
        </div>
      </header>
      <div className="shell map-page__content">
        <JapanLighthouseMap />
        <p className="map-page__note">道路や周辺施設は、各灯台の詳細ページからGoogle Mapsで確認できます。</p>
        <Link className="button button--secondary" href="/">条件を指定して一覧から探す</Link>
      </div>
    </main>
  );
}
