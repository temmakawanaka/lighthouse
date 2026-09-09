import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { LighthouseStatusProvider } from "@/components/lighthouse-status-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://lighthouse-field-guide.colet3020.chatgpt.site"),
  title: {
    default: "灯台アプリ｜のぼれる灯台を探す",
    template: "%s｜灯台アプリ",
  },
  description: "日本各地の参観できる灯台を、地域や名前から探せる灯台ガイドです。",
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" }], apple: "/apple-touch-icon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <a className="skip-link" href="#main-content">
          本文へ移動
        </a>
        <LighthouseStatusProvider>
          <SiteHeader />
          {children}
        </LighthouseStatusProvider>
        <ServiceWorkerRegister />
        <footer className="site-footer">
          <div className="shell site-footer__inner">
            <div className="site-footer__brand">
              <span aria-hidden="true">灯</span>
              <p>
                <strong>灯台アプリ</strong>
                <small>LIGHTHOUSE FIELD GUIDE</small>
              </p>
            </div>
            <div className="site-footer__note">
              <p>灯台を知り、海辺への旅をもっと楽しむためのガイド。</p>
              <small>参観前には、必ず公式サイトで最新情報をご確認ください。</small>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
