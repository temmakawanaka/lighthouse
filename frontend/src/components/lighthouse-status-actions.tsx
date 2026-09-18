"use client";

import { useLighthouseStatus } from "./lighthouse-status-provider";

export function LighthouseStatusActions({ slug, name, compact = false }: {
  slug: string;
  name: string;
  compact?: boolean;
}) {
  const { favorites, ready, toggleFavorite } = useLighthouseStatus();
  const favorite = favorites.includes(slug);

  return (
    <div className={`status-actions${compact ? " status-actions--compact" : ""}`} aria-label={`${name}の保存操作`}>
      <button type="button" className="status-action" aria-pressed={favorite} disabled={!ready}
        aria-label={compact ? `${name}を${favorite ? "行きたいから削除" : "行きたいに追加"}` : undefined}
        onClick={() => toggleFavorite(slug)}>
        <span aria-hidden="true">{favorite ? "★" : "☆"}</span>
        {!compact && (favorite ? "行きたい登録済み" : "行きたい")}
      </button>
    </div>
  );
}
