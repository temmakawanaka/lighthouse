import Link from "next/link";
import { catalog } from "@/lib/catalog";
import { formatLocation } from "@/lib/format";
import { nearbyLighthouses } from "@/lib/trip-plan";
import type { Lighthouse } from "@/types/lighthouse";

export function NearbyLighthouses({ current }: { current: Lighthouse }) {
  const nearby = nearbyLighthouses(current, catalog);
  return <section className="side-card nearby-card">
    <p className="kicker">NEARBY</p><h2>近くの灯台</h2>
    <p className="side-card__description">次の行き先候補です。距離は直線距離の目安です。</p>
    <ul>{nearby.map(({ lighthouse, distanceKm }) => <li key={lighthouse.slug}>
      <Link href={`/lighthouses/${lighthouse.slug}`}><strong>{lighthouse.name}</strong><span>{formatLocation(lighthouse.prefecture, lighthouse.municipality)}・約{Math.round(distanceKm)}km</span></Link>
    </li>)}</ul>
    <Link className="text-link" href="/trip/">旅程を作る →</Link>
  </section>;
}
