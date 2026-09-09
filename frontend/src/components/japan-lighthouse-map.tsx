import japan from "@svg-maps/japan";
import Link from "next/link";

import { catalog } from "@/lib/catalog";
import { formatLocation } from "@/lib/format";

const prefectureIds: Record<string, string> = {
  "青森県": "aomori",
  "秋田県": "akita",
  "福島県": "fukushima",
  "千葉県": "chiba",
  "神奈川県": "kanagawa",
  "静岡県": "shizuoka",
  "三重県": "mie",
  "和歌山県": "wakayama",
  "山口県": "yamaguchi",
  "島根県": "shimane",
  "宮崎県": "miyazaki",
  "沖縄県": "okinawa",
};

const lighthousesByPrefecture = new Map<string, typeof catalog>();
for (const lighthouse of catalog) {
  if (!lighthouse.prefecture) continue;
  const records = lighthousesByPrefecture.get(lighthouse.prefecture) ?? [];
  lighthousesByPrefecture.set(lighthouse.prefecture, [...records, lighthouse]);
}

export function JapanLighthouseMap() {
  const activeById = new Map([...lighthousesByPrefecture.entries()].map(([prefecture, records]) => [
    prefectureIds[prefecture], { prefecture, records },
  ]));

  return (
    <div className="map-layout">
      <figure className="japan-map">
        <svg viewBox={japan.viewBox} role="img" aria-labelledby="map-title map-description">
          <title id="map-title">のぼれる灯台16の都道府県分布図</title>
          <desc id="map-description">色の濃い都道府県を選ぶと、その地域の灯台一覧へ移動します。</desc>
          {japan.locations.map((location: { id: string; name: string; path: string }) => {
            const active = activeById.get(location.id);
            if (!active) return <path className="japan-map__prefecture" d={location.path} key={location.id} aria-hidden="true" />;
            const label = `${active.prefecture}、灯台${active.records.length}基を一覧で見る`;
            return (
              <a className="japan-map__link" href={`/?prefecture=${encodeURIComponent(active.prefecture)}`}
                aria-label={label} key={location.id}>
                <path d={location.path}><title>{label}</title></path>
              </a>
            );
          })}
        </svg>
        <figcaption>
          地図：<a href="https://github.com/VictorCazanave/svg-maps/tree/master/packages/japan" target="_blank" rel="noreferrer">@svg-maps/japan</a>
          （<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>）
        </figcaption>
      </figure>

      <div className="map-index" aria-label="都道府県別の灯台一覧">
        {[...lighthousesByPrefecture.entries()].map(([prefecture, records]) => (
          <section className="map-index__group" key={prefecture}>
            <h2><Link href={`/?prefecture=${encodeURIComponent(prefecture)}`}>{prefecture}</Link> <span>{records.length}基</span></h2>
            <ul>
              {records.map((lighthouse) => (
                <li key={lighthouse.slug}>
                  <Link href={`/lighthouses/${lighthouse.slug}?from=${encodeURIComponent("/map/")}`}>
                    <strong>{lighthouse.name}</strong>
                    <span>{formatLocation(lighthouse.prefecture, lighthouse.municipality)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
