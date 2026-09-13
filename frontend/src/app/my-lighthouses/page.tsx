import type { Metadata } from "next";
import { MyLighthouses } from "@/components/my-lighthouses";

export const metadata: Metadata = {
  title: "マイ灯台",
  description: "行きたい灯台と、自分で残した訪問メモをこの端末で管理できます。",
  alternates: { canonical: "/my-lighthouses/" },
  robots: { index: false, follow: true },
};

export default function MyLighthousesPage() {
  return (
    <main id="main-content" className="my-lighthouses">
      <header className="subpage-heading">
        <div className="shell">
          <p className="kicker">MY LIGHTHOUSES</p>
          <h1>マイ灯台</h1>
          <p>行きたい灯台と旅のメモを管理します。現地で獲得したGPSチェックイン記録はスタンプ帳に残ります。</p>
        </div>
      </header>
      <div className="shell my-lighthouses__content">
        <MyLighthouses />
        <p className="local-storage-note">記録はこのブラウザだけに保存されます。会員登録や通信は必要ありません。</p>
      </div>
    </main>
  );
}
