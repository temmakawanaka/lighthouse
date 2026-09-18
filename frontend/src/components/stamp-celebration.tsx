"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { catalog } from "@/lib/catalog";
import { getCheckInTarget } from "@/lib/check-in";
import { getLighthouseRegion } from "@/lib/regions";
import type { Lighthouse } from "@/types/lighthouse";
import { useLighthouseStatus } from "./lighthouse-status-provider";

export function StampCelebration({ lighthouse, open, onClose }: { lighthouse: Lighthouse; open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { stamps } = useLighthouseStatus();
  const stamp = stamps[lighthouse.slug];
  const region = getLighthouseRegion(lighthouse.prefecture);
  const regionRecords = catalog.filter((item) => getLighthouseRegion(item.prefecture) === region);
  const regionEarned = regionRecords.filter((item) => stamps[item.slug]).length;
  const totalEarned = catalog.filter((item) => stamps[item.slug]).length;
  const isViewpoint = getCheckInTarget(lighthouse).kind === "viewpoint";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && stamp && dialog && !dialog.open) dialog.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open, stamp]);

  return <dialog className={`stamp-celebration${isViewpoint ? " stamp-celebration--viewpoint" : ""}`} ref={dialogRef} onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
    {stamp && <div className="stamp-celebration__content">
      <button type="button" className="stamp-celebration__close" onClick={() => dialogRef.current?.close()} aria-label="獲得画面を閉じる">×</button>
      <p className="kicker">STAMP ACQUIRED</p>
      <div className="stamp-celebration__seal" aria-hidden="true"><span>{lighthouse.prefecture?.replace(/[都府県]$/, "")}</span><strong>{isViewpoint ? "望" : "灯"}</strong><small>{stamp.source === "test" ? "TEST" : new Date(stamp.obtainedAt).toLocaleDateString("ja-JP")}</small></div>
      <h2>スタンプ獲得！</h2>
      <p className="stamp-celebration__name">{lighthouse.name}</p>
      <p className="stamp-celebration__progress"><strong>{region}で{regionEarned}個目</strong><span>全52基中 {totalEarned}基を獲得</span></p>
      {stamp.source === "test" && <small className="stamp-celebration__test-note">確認用テスト印です。GPSでの訪問記録とは区別されます。</small>}
      <div className="stamp-celebration__actions"><button type="button" className="button button--secondary" onClick={() => dialogRef.current?.close()}>閉じる</button><Link className="button button--stamp" href="/stamps/">スタンプ帳を見る</Link></div>
    </div>}
  </dialog>;
}
