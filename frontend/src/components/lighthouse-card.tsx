import Link from "next/link";

import { formatLocation, formatYear } from "@/lib/format";
import type { Lighthouse } from "@/types/lighthouse";

import { LighthousePhoto } from "./lighthouse-photo";
import { LighthouseStatusActions } from "./lighthouse-status-actions";

interface LighthouseCardProps {
  lighthouse: Lighthouse;
  sequence?: number;
  returnHref?: string;
}

export function LighthouseCard({ lighthouse, sequence, returnHref = "/" }: LighthouseCardProps) {
  const year = formatYear(lighthouse.first_lit_date, lighthouse.built_year);

  return (
    <article className="lighthouse-card">
      <div className="lighthouse-card__visual">
        <LighthousePhoto lighthouse={lighthouse} compact />
        {sequence && (
          <span className="lighthouse-card__number" aria-hidden="true">
            {String(sequence).padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="lighthouse-card__body">
        <div className="eyebrow-row">
          <span className="location-label">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
              <circle cx="12" cy="9" r="2.4" />
            </svg>
            {formatLocation(lighthouse.prefecture, lighthouse.municipality)}
          </span>
          {lighthouse.is_visitable && <span className="badge badge--warm">登れる灯台</span>}
        </div>
        <div className="lighthouse-card__title-row">
          <h2>{lighthouse.name}</h2>
          <LighthouseStatusActions slug={lighthouse.slug} name={lighthouse.name} compact />
        </div>
        {lighthouse.english_name && <p className="english-name">{lighthouse.english_name}</p>}
        <p className="card-description">
          {lighthouse.description ?? "灯台の詳しい情報を確認できます。"}
        </p>
        <div className="lighthouse-card__footer">
          <span>{year ? `初点灯 ${year}` : "初点灯年 調査中"}</span>
          <Link className="text-link" aria-label={`${lighthouse.name}の詳細を見る`} href={`/lighthouses/${lighthouse.slug}${returnHref === "/" ? "" : `?from=${encodeURIComponent(returnHref)}`}`}>
            灯台の詳細を見る
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
