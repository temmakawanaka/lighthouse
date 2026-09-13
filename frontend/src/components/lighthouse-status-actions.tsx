"use client";

import { useLighthouseStatus } from "./lighthouse-status-provider";

export function LighthouseStatusActions({ slug, name, compact = false }: {
  slug: string;
  name: string;
  compact?: boolean;
}) {
  const { favorites, visited, stamps, ready, toggleFavorite, toggleVisited } = useLighthouseStatus();
  const favorite = favorites.includes(slug);
  const hasVisited = visited.includes(slug);
  const hasGpsStamp = Boolean(stamps[slug]);

  return (
    <div className={`status-actions${compact ? " status-actions--compact" : ""}`} aria-label={`${name}の保存操作`}>
      <button type="button" className="status-action" aria-pressed={favorite} disabled={!ready}
        onClick={() => toggleFavorite(slug)}>
        <span aria-hidden="true">{favorite ? "★" : "☆"}</span>
        {favorite ? "行きたい登録済み" : "行きたい"}
      </button>
      <button type="button" className="status-action" aria-pressed={hasVisited} disabled={!ready || hasGpsStamp}
        onClick={() => toggleVisited(slug)}>
        <span aria-hidden="true">{hasVisited ? "✓" : "○"}</span>
        {hasGpsStamp ? "GPSスタンプ済み" : hasVisited ? "訪問メモあり" : "訪問メモ"}
      </button>
    </div>
  );
}
