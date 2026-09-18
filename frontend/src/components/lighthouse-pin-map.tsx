"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { catalog } from "@/lib/catalog";
import { getCheckInTarget } from "@/lib/check-in";
import type { Lighthouse } from "@/types/lighthouse";
import { LighthouseStatusActions } from "./lighthouse-status-actions";
import { useLighthouseStatus } from "./lighthouse-status-provider";

type Filter = "all" | "unstamped" | "stamped" | "climbable" | "viewpoint";

const REGION_VIEWS = [
  { name: "全国", center: [36.2, 138.2] as [number, number], zoom: 5 },
  { name: "北海道", center: [43.3, 142.7] as [number, number], zoom: 6 },
  { name: "東北", center: [39.1, 140.8] as [number, number], zoom: 6 },
  { name: "関東", center: [35.7, 139.6] as [number, number], zoom: 7 },
  { name: "中部", center: [36.2, 137.4] as [number, number], zoom: 6 },
  { name: "近畿", center: [34.7, 135.1] as [number, number], zoom: 7 },
  { name: "中国", center: [34.6, 132.6] as [number, number], zoom: 7 },
  { name: "四国", center: [33.7, 133.5] as [number, number], zoom: 7 },
  { name: "九州・沖縄", center: [29.4, 130.2] as [number, number], zoom: 5 },
] as const;

export function LighthousePinMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const locationRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState("");
  const [activeRegion, setActiveRegion] = useState("全国");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const { stamps, ready } = useLighthouseStatus();
  const visible = useMemo(() => catalog.filter((item) => filter === "all"
    || (filter === "stamped" && stamps[item.slug])
    || (filter === "unstamped" && !stamps[item.slug])
    || (filter === "climbable" && item.is_visitable)
    || (filter === "viewpoint" && getCheckInTarget(item).kind === "viewpoint")), [filter, stamps]);
  const selectedLighthouse = selectedSlug ? catalog.find((item) => item.slug === selectedSlug) : undefined;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let active = true;
    void import("leaflet").then((L) => {
      if (!active || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, { zoomControl: false, scrollWheelZoom: false }).setView([36.2, 138.2], 5);
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
    let removeListeners: (() => void) | undefined;
    void import("leaflet").then((L) => {
      if (!active || !layerRef.current) return;
      layerRef.current.clearLayers();
      const drawMarkers = () => {
        if (!layerRef.current || !mapRef.current) return;
        layerRef.current.clearLayers();
        const groups: Lighthouse[][] = [];
        for (const lighthouse of visible) {
          const point = mapRef.current.latLngToContainerPoint([Number(lighthouse.latitude), Number(lighthouse.longitude)]);
          const group = groups.find((candidate) => {
            const first = candidate[0];
            const firstPoint = mapRef.current!.latLngToContainerPoint([Number(first.latitude), Number(first.longitude)]);
            return point.distanceTo(firstPoint) < 44;
          });
          if (group) group.push(lighthouse);
          else groups.push([lighthouse]);
        }
        for (const group of groups) {
          if (group.length > 1) {
            const bounds = L.latLngBounds(group.map((item) => [Number(item.latitude), Number(item.longitude)] as [number, number]));
            const icon = L.divIcon({
              className: "lighthouse-map-marker-wrap",
              html: `<span class="lighthouse-map-cluster" aria-hidden="true">${group.length}</span>`,
              iconSize: [40, 40], iconAnchor: [20, 20],
            });
            L.marker(bounds.getCenter(), { icon, title: `${group.length}基の灯台` })
              .on("click", () => mapRef.current?.fitBounds(bounds, { padding: [64, 64], maxZoom: 11 }))
              .addTo(layerRef.current);
            continue;
          }
          const lighthouse = group[0];
        const earned = Boolean(stamps[lighthouse.slug]);
        const target = getCheckInTarget(lighthouse);
        const isViewpoint = target.kind === "viewpoint";
        const icon = L.divIcon({
          className: "lighthouse-map-marker-wrap",
          html: `<span class="lighthouse-map-marker${earned ? " lighthouse-map-marker--earned" : ""}${isViewpoint ? " lighthouse-map-marker--viewpoint" : ""}" aria-hidden="true">${earned ? "印" : isViewpoint ? "望" : "灯"}</span>`,
          iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -18],
        });
        L.marker([Number(lighthouse.latitude), Number(lighthouse.longitude)], { icon, title: lighthouse.name })
          .on("click", () => setSelectedSlug(lighthouse.slug))
          .addTo(layerRef.current);
        }
      };
      drawMarkers();
      const map = mapRef.current;
      if (!map) return;
      map.on("zoomend moveend", drawMarkers);
      removeListeners = () => map.off("zoomend moveend", drawMarkers);
    });
    return () => { active = false; removeListeners?.(); };
  }, [mapReady, ready, stamps, visible]);

  useEffect(() => {
    if (viewMode !== "map" || !mapRef.current) return;
    const frame = window.requestAnimationFrame(() => mapRef.current?.invalidateSize());
    return () => window.cancelAnimationFrame(frame);
  }, [viewMode]);

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
        setActiveRegion("");
        setLocating(false);
        setMessage("地図を現在地へ移動しました。青い円は測位精度の目安です。");
      });
    }, () => {
      setLocating(false);
      setMessage("現在地を取得できませんでした。位置情報の許可と電波状況をご確認ください。");
    },
    { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 });
  };

  const moveToRegion = (region: (typeof REGION_VIEWS)[number]) => {
    if (!mapRef.current) return;
    mapRef.current.setView(region.center, region.zoom, { animate: true });
    setActiveRegion(region.name);
    setMessage("");
  };

  const changeZoom = (direction: 1 | -1) => {
    if (!mapRef.current) return;
    if (direction > 0) mapRef.current.zoomIn();
    else mapRef.current.zoomOut();
    setActiveRegion("");
  };

  return <section className="pin-map" aria-labelledby="pin-map-heading">
    <div className="pin-map__toolbar"><div><p className="kicker">GPS MAP</p><h2 id="pin-map-heading">全国の灯台マップ</h2><p>朱色は獲得済み、紺色はまだ訪れていない灯台です。</p></div><button className="button button--primary" type="button" disabled={locating} onClick={locate}>{locating ? "現在地を確認中…" : "現在地を表示"}</button></div>
    <div className="pin-map__filters" aria-label="地図に表示する灯台">
      {([['all','すべて'],['unstamped','未取得'],['stamped','獲得済み'],['climbable','登れる灯台'],['viewpoint','遠望スタンプ']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
    </div>
    <div className="pin-map__regions" aria-label="地域へ地図を移動">
      {REGION_VIEWS.map((region) => <button key={region.name} type="button" disabled={!mapReady} aria-pressed={activeRegion === region.name} onClick={() => moveToRegion(region)}>{region.name}</button>)}
    </div>
    {message && <p className="pin-map__message" role="status">{message}</p>}
    <div className="pin-map__view-switch" aria-label="表示方法">
      <button type="button" aria-pressed={viewMode === "map"} onClick={() => setViewMode("map")}>地図</button>
      <button type="button" aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")}>一覧 <span>{visible.length}</span></button>
    </div>
    <div className={`pin-map__map-wrap${viewMode === "list" ? " is-hidden" : ""}`}>
      <div className="pin-map__zoom" aria-label="地図の拡大と縮小">
        <button type="button" disabled={!mapReady} onClick={() => changeZoom(1)} aria-label="地図を拡大">＋</button>
        <button type="button" disabled={!mapReady} onClick={() => changeZoom(-1)} aria-label="地図を縮小">−</button>
      </div>
      <div className="pin-map__canvas" ref={containerRef} role="region" aria-label="灯台の位置を示す操作可能な地図。指2本のピンチ操作でも拡大縮小できます。" />
      {selectedLighthouse && <MapLighthouseCard lighthouse={selectedLighthouse} earned={Boolean(stamps[selectedLighthouse.slug])} onClose={() => setSelectedSlug(null)} />}
    </div>
    {viewMode === "list" && <div className="pin-map__list" aria-label={`${visible.length}基の灯台一覧`}>
      {visible.map((lighthouse) => <MapLighthouseCard key={lighthouse.slug} lighthouse={lighthouse} earned={Boolean(stamps[lighthouse.slug])} />)}
    </div>}
    <p className="pin-map__note">ピンを選ぶと灯台の詳細へ進めます。地図表示時はOpenStreetMapへ表示範囲のタイルを要求します。現在地を表示した場合、その周辺の地図範囲も要求対象になります。<Link href="/stamps/">スタンプ帳を見る →</Link></p>
  </section>;
}

function MapLighthouseCard({ lighthouse, earned, onClose }: { lighthouse: Lighthouse; earned: boolean; onClose?: () => void }) {
  const target = getCheckInTarget(lighthouse);
  return <article className={`pin-map-card${onClose ? " pin-map-card--overlay" : ""}`}>
    {onClose && <button className="pin-map-card__close" type="button" aria-label="灯台カードを閉じる" onClick={onClose}>×</button>}
    <div className="pin-map-card__heading">
      <div><small>{lighthouse.prefecture} {lighthouse.municipality}</small><h3>{lighthouse.name}</h3></div>
      <LighthouseStatusActions slug={lighthouse.slug} name={lighthouse.name} compact />
    </div>
    <p><span className={earned ? "is-earned" : ""}>{earned ? "獲得済み" : target.kind === "viewpoint" ? "遠望スタンプ" : "未取得"}</span>{target.kind === "viewpoint" ? target.locationName : lighthouse.is_visitable ? "登れる灯台" : "現地チェックイン"}</p>
    <Link href={`/lighthouses/${lighthouse.slug}?from=${encodeURIComponent("/map/")}`}>{earned ? "獲得記録を見る" : "詳細・チェックイン"}<span aria-hidden="true"> →</span></Link>
  </article>;
}
