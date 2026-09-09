"use client";

import { useLighthouseStatus } from "./lighthouse-status-provider";

export function LighthouseStatusActions({ slug, name, compact = false }: {
  slug: string;
  name: string;
  compact?: boolean;
}) {
  const { favorites, visited, ready, toggleFavorite, toggleVisited } = useLighthouseStatus();
  const favorite = favorites.includes(slug);
  const hasVisited = visited.includes(slug);

  return (
    <div className={`status-actions${compact ? " status-actions--compact" : ""}`} aria-label={`${name}の訪問メモ`}>
      <button type="button" className="status-action" aria-pressed={favorite} disabled={!ready}
        onClick={() => toggleFavorite(slug)}>
        <span aria-hidden="true">{favorite ? "★" : "☆"}</span>
        {favorite ? "行きたい登録済み" : "行きたい"}
      </button>
      <button type="button" className="status-action" aria-pressed={hasVisited} disabled={!ready}
        onClick={() => toggleVisited(slug)}>
        <span aria-hidden="true">{hasVisited ? "✓" : "○"}</span>
        {hasVisited ? "訪問済み" : "訪問記録"}
      </button>
    </div>
  );
}
