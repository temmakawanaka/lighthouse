import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "灯台アプリ｜のぼれる灯台を探す",
    template: "%s｜灯台アプリ",
  },
  description: "日本各地の参観できる灯台を、地域や名前から探せる灯台ガイドです。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <a className="skip-link" href="#main-content">
          本文へ移動
        </a>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <div className="shell">
            <p>灯台を知り、海辺への旅をもっと楽しむためのガイド。</p>
            <small>参観前には、必ず公式サイトで最新情報をご確認ください。</small>
          </div>
        </footer>
      </body>
    </html>
  );
}
