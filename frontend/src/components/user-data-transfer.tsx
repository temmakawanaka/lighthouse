"use client";

import { useRef, useState } from "react";
import { catalog } from "@/lib/catalog";
import { emptyTripPlan, parseTripPlan, TRIP_STORAGE_KEY } from "@/lib/trip-plan";
import { createUserBackup, parseUserBackup } from "@/lib/user-backup";
import { useLighthouseStatus } from "./lighthouse-status-provider";

const validSlugs = new Set(catalog.map(({ slug }) => slug));

export function UserDataTransfer() {
  const { favorites, visited, visits, replaceStatus } = useLighthouseStatus();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const download = () => {
    const trip = parseTripPlan(window.localStorage.getItem(TRIP_STORAGE_KEY), validSlugs);
    const backup = createUserBackup({ version: 2, favorites, visited, visits }, trip);
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `lighthouse-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setError(false);
    setMessage("バックアップを書き出しました。");
  };

  const restore = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 100_000) throw new Error("ファイルサイズが大きすぎます。");
      const backup = parseUserBackup(await file.text(), validSlugs);
      replaceStatus(backup.status);
      window.localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(backup.trip ?? emptyTripPlan));
      window.dispatchEvent(new Event("lighthouse-trip-updated"));
      setError(false);
      setMessage(`記録を復元しました（行きたい ${backup.status.favorites.length}基・訪問済み ${backup.status.visited.length}基）。`);
    } catch (caught) {
      setError(true);
      setMessage(caught instanceof Error ? caught.message : "バックアップを読み込めませんでした。");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return <section className="data-transfer" aria-labelledby="data-transfer-heading">
    <div><p className="kicker">BACKUP</p><h2 id="data-transfer-heading">記録を持ち運ぶ</h2></div>
    <p>行きたい灯台、訪問記録、旅程を1つのファイルに保存できます。機種変更時の移行にも使えます。</p>
    <div className="data-transfer__actions">
      <button className="button button--secondary" type="button" onClick={download}>バックアップを書き出す</button>
      <label className="button button--quiet">バックアップを復元
        <input ref={inputRef} type="file" accept="application/json,.json" onChange={(event) => restore(event.target.files?.[0])} />
      </label>
    </div>
    {message && <p className={error ? "data-transfer__message data-transfer__message--error" : "data-transfer__message"} role="status">{message}</p>}
    <small>復元すると、この端末の現在の記録をバックアップの内容で置き換えます。</small>
  </section>;
}
