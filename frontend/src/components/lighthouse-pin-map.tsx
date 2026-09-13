"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { catalog } from "@/lib/catalog";
import { useLighthouseStatus } from "./lighthouse-status-provider";

type Filter = "all" | "unstamped" | "stamped" | "climbable";

export function LighthousePinMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const locationRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState("");
  const { stamps, ready } = useLighthouseStatus();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let active = true;
    void import("leaflet").then((L) => {
      if (!active || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([36.2, 138.2], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      locationRef.current = L.layerGroup().addTo(map);
      setMapReady(true);
    });
    return () => {
      active = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !layerRef.current || !ready) return;
    let active = true;
    void import("leaflet").then((L) => {
      if (!active || !layerRef.current) return;
      layerRef.current.clearLayers();
      const visible = catalog.filter((item) => filter === "all"
        || (filter === "stamped" && stamps[item.slug])
        || (filter === "unstamped" && !stamps[item.slug])
        || (filter === "climbable" && item.is_visitable));
      for (const lighthouse of visible) {
        const earned = Boolean(stamps[lighthouse.slug]);
        const icon = L.divIcon({
          className: "lighthouse-map-marker-wrap",
          html: `<span class="lighthouse-map-marker${earned ? " lighthouse-map-marker--earned" : ""}" aria-hidden="true">${earned ? "印" : "灯"}</span>`,
          iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -18],
        });
        L.marker([Number(lighthouse.latitude), Number(lighthouse.longitude)], { icon, title: lighthouse.name })
          .bindPopup(`<div class="lighthouse-popup"><strong>${lighthouse.name}</strong><span>${lighthouse.prefecture ?? ""} ${lighthouse.municipality ?? ""}</span><a href="/lighthouses/${lighthouse.slug}/">詳細・チェックイン</a></div>`)
          .addTo(layerRef.current);
      }
    });
    return () => { active = false; };
  }, [filter, mapReady, ready, stamps]);

  const locate = () => {
    if (locating) return;
    if (!("geolocation" in navigator)) { setMessage("この端末では現在地を取得できません。"); return; }
    setLocating(true);
    setMessage("現在地を確認しています…");
    navigator.geolocation.getCurrentPosition((position) => {
      void import("leaflet").then((L) => {
        const map = mapRef.current;
        const layer = locationRef.current;
        if (!map || !layer) return;
        layer.clearLayers();
        const point: [number, number] = [position.coords.latitude, position.coords.longitude];
        L.circle(point, { radius: position.coords.accuracy, className: "current-location-accuracy" }).addTo(layer);
        L.circleMarker(point, { radius: 8, className: "current-location-dot" }).bindPopup("現在地").addTo(layer);
        map.setView(point, 10);
        setLocating(false);
        setMessage("地図を現在地へ移動しました。青い円は測位精度の目安です。");
      });
    }, () => {
      setLocating(false);
      setMessage("現在地を取得できませんでした。位置情報の許可と電波状況をご確認ください。");
    },
    { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 });
  };

  return <section className="pin-map" aria-labelledby="pin-map-heading">
    <div className="pin-map__toolbar"><div><p className="kicker">GPS MAP</p><h2 id="pin-map-heading">全国の灯台マップ</h2><p>朱色は獲得済み、紺色はまだ訪れていない灯台です。</p></div><button className="button button--primary" type="button" disabled={locating} onClick={locate}>{locating ? "現在地を確認中…" : "現在地を表示"}</button></div>
    <div className="pin-map__filters" aria-label="地図に表示する灯台">
      {([['all','すべて'],['unstamped','未取得'],['stamped','獲得済み'],['climbable','登れる灯台']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
    </div>
    {message && <p className="pin-map__message" role="status">{message}</p>}
    <div className="pin-map__canvas" ref={containerRef} role="region" aria-label="灯台の位置を示す操作可能な地図" />
    <p className="pin-map__note">ピンを選ぶと灯台の詳細へ進めます。地図表示時はOpenStreetMapへ表示範囲のタイルを要求します。現在地を表示した場合、その周辺の地図範囲も要求対象になります。<Link href="/stamps/">スタンプ帳を見る →</Link></p>
  </section>;
}
