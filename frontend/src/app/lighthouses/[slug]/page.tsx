import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-path";
import Link from "next/link";
import { connection } from "next/server";
import { catalog } from "@/lib/catalog";

import { BackToListLink } from "@/components/back-to-list-link";
import { DetailSection, hasVisibleDetailValue } from "@/components/detail-section";
import { LighthousePhoto } from "@/components/lighthouse-photo";
import { LighthouseStatusActions } from "@/components/lighthouse-status-actions";
import { GpsCheckIn } from "@/components/gps-check-in";
import { NearbyLighthouses } from "@/components/nearby-lighthouses";
import { officialVisitUrl, directionsUrl } from "@/lib/visit-links";
import { getCheckInTarget } from "@/lib/check-in";
import {
  formatDate,
  formatLocation,
  formatNumber,
  sourceLabel,
} from "@/lib/format";

import { loadLighthouse } from "./load-lighthouse";

export function generateStaticParams() {
  return process.env.LIGHTHOUSE_STATIC_EXPORT === "true" ? catalog.map(({ slug }) => ({ slug })) : [];
}

interface LighthouseDetailPageProps {
  params: Promise<{ slug: string }>;
}

// The server build resolves API-backed slugs per request. The static build script
// temporarily switches this literal to force-static so Next.js can export all 16 paths.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LighthouseDetailPageProps): Promise<Metadata> {
  // Metadata is rendered independently from the layout. Mark API-backed requests
  // as dynamic here as well, while keeping the export build fully static.
  if (process.env.LIGHTHOUSE_STATIC_EXPORT !== "true") await connection();
  const { slug } = await params;
  const lighthouse = await loadLighthouse(slug);

  return {
    title: lighthouse.name,
    description: lighthouse.description ?? `${lighthouse.name}の所在地・歴史・参観情報。`,
    alternates: { canonical: siteUrl(`/lighthouses/${lighthouse.slug}/`) },
  };
}

export default async function LighthouseDetailPage({ params }: LighthouseDetailPageProps) {
  if (process.env.LIGHTHOUSE_STATIC_EXPORT !== "true") await connection();
  const { slug } = await params;
  const lighthouse = await loadLighthouse(slug);
  const location = formatLocation(lighthouse.prefecture, lighthouse.municipality);
  const officialUrl = officialVisitUrl(lighthouse.source_urls);
  const checkInTarget = getCheckInTarget(lighthouse);
  const routeTarget = checkInTarget.kind === "viewpoint" ? checkInTarget : lighthouse;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${routeTarget.latitude},${routeTarget.longitude}`,
  )}`;

  const basicItems = [
    { label: "初点灯日", value: formatDate(lighthouse.first_lit_date) },
    { label: "建設年", value: lighthouse.built_year ? `${lighthouse.built_year}年` : null },
    { label: "建築材質", value: lighthouse.construction_material },
    { label: "塔の形", value: lighthouse.tower_shape },
    { label: "塗色・標識", value: lighthouse.marking },
    { label: "レンズ", value: lighthouse.lens },
    { label: "管理者", value: lighthouse.operator },
  ];

  const specificationItems = [
    { label: "灯質", value: lighthouse.light_characteristic },
    { label: "光度", value: formatNumber(lighthouse.intensity_cd, " cd") },
    { label: "光達距離", value: formatNumber(lighthouse.range_nm, "海里") },
    { label: "塔高", value: formatNumber(lighthouse.tower_height_m, "m") },
    { label: "灯高", value: formatNumber(lighthouse.focal_height_m, "m") },
    { label: "海上保安庁番号", value: lighthouse.jcg_number },
    { label: "国際番号", value: lighthouse.admiralty_number },
  ];

  const visitItems = [
    { label: "参観案内", value: lighthouse.visit_info },
    { label: "料金", value: lighthouse.admission_info },
    { label: "休止・休業", value: lighthouse.closed_info },
    { label: "駐車場", value: lighthouse.parking_info },
    {
      label: "電話番号",
      value: lighthouse.phone_number ? (
        <a className="inline-link" href={`tel:${lighthouse.phone_number}`}>
          {lighthouse.phone_number}
        </a>
      ) : null,
    },
  ];

  return (
    <main id="main-content" className="detail-page">
      <div className="shell">
        <div className="detail-page__topline">
          <BackToListLink />
          <nav className="breadcrumbs" aria-label="パンくずリスト">
            <Link href="/">灯台一覧</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{lighthouse.name}</span>
          </nav>
        </div>

        <article>
          <header className="detail-hero">
            <div className="detail-hero__visual">
              <LighthousePhoto lighthouse={lighthouse} />
            </div>
            <div className="detail-hero__content">
              <p className="detail-hero__record">LIGHTHOUSE RECORD</p>
              <p className="location-label location-label--large">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
                  <circle cx="12" cy="9" r="2.4" />
                </svg>
                {location}
              </p>
              <h1>{lighthouse.name}</h1>
              {lighthouse.english_name && (
                <p className="detail-hero__english">{lighthouse.english_name}</p>
              )}
              <div className="tag-list" aria-label="灯台の特徴">
                {lighthouse.is_visitable && <span className="badge badge--warm">登れる灯台</span>}
                {lighthouse.heritage_status && (
                  <span className="badge badge--sea">{lighthouse.heritage_status}</span>
                )}
                {lighthouse.selections
                  .filter((selection) => selection !== "のぼれる灯台16")
                  .map((selection) => (
                    <span className="badge" key={selection}>
                      {selection}
                    </span>
                  ))}
              </div>
              <p className="detail-hero__description">
                {lighthouse.description ?? "この灯台の詳しい紹介は準備中です。"}
              </p>
              <dl className="detail-highlight-list">
                <div>
                  <dt>初点灯</dt>
                  <dd>{formatDate(lighthouse.first_lit_date) ?? "調査中"}</dd>
                </div>
                <div>
                  <dt>塔高</dt>
                  <dd>{formatNumber(lighthouse.tower_height_m, "m") ?? "調査中"}</dd>
                </div>
              </dl>
              <div className="visit-actions">
                {officialUrl && <a className="button button--primary" href={officialUrl} target="_blank" rel="noreferrer">公式の参観案内 <span aria-hidden="true">↗</span><span className="sr-only">（新しいタブで開きます）</span></a>}
                <a className="button button--secondary" href={directionsUrl(routeTarget)} target="_blank" rel="noreferrer">{checkInTarget.kind === "viewpoint" ? "遠望地点への経路" : "ここへの経路を調べる"} <span aria-hidden="true">↗</span><span className="sr-only">（新しいタブで開きます）</span></a>
              </div>
              <LighthouseStatusActions slug={lighthouse.slug} name={lighthouse.name} />
            </div>
          </header>

          <GpsCheckIn lighthouse={lighthouse} />

          <div className="detail-layout">
            <div className="detail-layout__main">
              {lighthouse.is_visitable && <section className="visit-check" aria-label="参観前の確認">
                <p><strong>お出かけ前に</strong>　天候や工事による休止は、公式の参観案内でご確認ください。</p>
                {lighthouse.visit_checked_at && <p className="visit-check__date">参観情報の確認日：<time dateTime={lighthouse.visit_checked_at}>{formatDate(lighthouse.visit_checked_at)}</time></p>}
                {lighthouse.visit_notice && <p className="visit-check__notice">{lighthouse.visit_notice}</p>}
                {lighthouse.visit_info?.includes("土日等") && <p>「土日等」は土・日・祝休日、GW、8月10〜19日、12月29日〜1月3日を含みます。</p>}
              </section>}
              <DetailSection title="歴史・基本情報" eyebrow="HISTORY" items={basicItems} />
              <DetailSection
                title="灯台の諸元"
                eyebrow="SPECIFICATIONS"
                items={specificationItems}
              />
              {visitItems.some((item) => hasVisibleDetailValue(item.value)) ? (
                <DetailSection title="参観情報" eyebrow="VISIT" items={visitItems} />
              ) : (
                <section className="detail-section">
                  <div className="detail-section__heading">
                    <p className="kicker">VISIT</p>
                    <h2>参観情報</h2>
                  </div>
                  <div className="notice-box">
                    最新の参観情報は、公式サイトでご確認ください。
                  </div>
                </section>
              )}
            </div>

            <aside className="detail-sidebar" aria-label="所在地と情報源">
              <section className="side-card">
                <p className="kicker">LOCATION</p>
                <h2>所在地</h2>
                <address>{lighthouse.address ?? location}</address>
                {lighthouse.area_name && <p className="area-name">{lighthouse.area_name}</p>}
                <dl className="coordinate-list">
                  <div>
                    <dt>緯度</dt>
                    <dd>{lighthouse.latitude}</dd>
                  </div>
                  <div>
                    <dt>経度</dt>
                    <dd>{lighthouse.longitude}</dd>
                  </div>
                </dl>
                <a
                  className="button button--secondary button--full"
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {checkInTarget.kind === "viewpoint" ? "遠望地点をGoogle Mapsで開く" : "Google Mapsで開く"}
                  <span className="external-mark" aria-hidden="true">↗</span>
                  <span className="sr-only">（新しいタブで開きます）</span>
                </a>
              </section>

              <NearbyLighthouses current={lighthouse} />

              {lighthouse.source_urls.length > 0 && (
                <section className="side-card side-card--muted">
                  <p className="kicker">SOURCES</p>
                  <h2>情報源</h2>
                  <p className="side-card__description">
                    営業時間や料金は変更されることがあります。お出かけ前に最新情報をご確認ください。
                  </p>
                  <ul className="source-list">
                    {lighthouse.source_urls.map((url, index) => (
                      <li key={url}>
                        <a href={url} target="_blank" rel="noreferrer">
                          {sourceLabel(url, index)}
                          <span aria-hidden="true">↗</span>
                          <span className="sr-only">（新しいタブで開きます）</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  {lighthouse.source_notes && <p className="source-notes">{lighthouse.source_notes}</p>}
                </section>
              )}
            </aside>
          </div>
        </article>
      </div>
    </main>
  );
}
