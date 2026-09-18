import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-path";
import { TripPlanner } from "@/components/trip-planner";

export const metadata: Metadata = {
  title: "灯台めぐりの旅程",
  description: "のぼれる灯台を最大5基選び、訪問順とGoogle Mapsのドライブルートを作れます。",
  alternates: { canonical: siteUrl("/trip/") },
};

export default function TripPage() {
  return <main id="main-content" className="trip-page">
    <header className="subpage-heading"><div className="shell"><p className="kicker">LIGHTHOUSE TRIP</p><h1>灯台めぐりの旅程</h1><p>訪れたい順に最大5基を選び、1日のドライブルートを作れます。</p></div></header>
    <div className="shell trip-page__content"><TripPlanner /></div>
  </main>;
}
