import type { Metadata } from "next";
import Link from "next/link";

import { BackToListLink } from "@/components/back-to-list-link";
import { DetailSection, hasVisibleDetailValue } from "@/components/detail-section";
import { LighthouseVisual } from "@/components/lighthouse-visual";
import {
  formatDate,
  formatLocation,
  formatNumber,
  sourceLabel,
} from "@/lib/format";

import { loadLighthouse } from "./load-lighthouse";

export const dynamic = "force-dynamic";

interface LighthouseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LighthouseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lighthouse = await loadLighthouse(slug);

  return {
    title: lighthouse.name,
    description: lighthouse.description ?? `${lighthouse.name}の所在地・歴史・参観情報。`,
  };
}

export default async function LighthouseDetailPage({ params }: LighthouseDetailPageProps) {
  const { slug } = await params;
  const lighthouse = await loadLighthouse(slug);
  const location = formatLocation(lighthouse.prefecture, lighthouse.municipality);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${lighthouse.latitude},${lighthouse.longitude}`,
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
              <LighthouseVisual
                visualId={lighthouse.slug}
                size="detail"
                label={`${lighthouse.name}のイメージイラスト`}
              />
              <span className="image-note">写真は準備中です</span>
            </div>
            <div className="detail-hero__content">
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
            </div>
          </header>

          <div className="detail-layout">
            <div className="detail-layout__main">
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
                  Google Mapsで開く
                  <span className="external-mark" aria-hidden="true">↗</span>
                  <span className="sr-only">（新しいタブで開きます）</span>
                </a>
              </section>

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
                </section>
              )}
            </aside>
          </div>
        </article>
      </div>
    </main>
  );
}
