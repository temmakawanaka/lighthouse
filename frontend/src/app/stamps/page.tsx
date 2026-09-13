import type { Metadata } from "next";
import { StampBook } from "@/components/stamp-book";

export const metadata: Metadata = {
  title: "灯台スタンプ帳",
  description: "現地のGPSチェックインで獲得した灯台スタンプを一覧できます。",
  alternates: { canonical: "/stamps/" },
  robots: { index: false, follow: true },
};

export default function StampsPage() {
  return <main id="main-content" className="stamp-book">
    <header className="subpage-heading subpage-heading--stamp"><div className="shell"><p className="kicker">STAMP BOOK</p><h1>灯台スタンプ帳</h1><p>海辺へ行った証を、一基ずつ集める。</p></div></header>
    <div className="shell stamp-book__content"><StampBook /><p className="local-storage-note">スタンプはこのブラウザだけに保存される本人用のGPSチェックイン記録です。現在地は端末内の距離判定に使い、緯度・経度そのものは保存しません。</p></div>
  </main>;
}
