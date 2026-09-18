import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { LighthouseStatusProvider } from "@/components/lighthouse-status-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { MobileNav } from "@/components/mobile-nav";
import { SITE_ORIGIN, sitePath, siteUrl } from "@/lib/site-path";

import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "灯台アプリ｜GPSで集める灯台スタンプラリー",
    template: "%s｜灯台アプリ",
  },
  description: "日本各地の灯台を地図で探し、現地のGPSチェックインでデジタルスタンプを集める灯台スタンプラリーです。",
  alternates: { canonical: siteUrl("/") },
  manifest: sitePath("/manifest.webmanifest"),
  icons: { icon: [{ url: sitePath("/icon.svg"), type: "image/svg+xml" }, { url: sitePath("/icon-192.png"), sizes: "192x192", type: "image/png" }], apple: sitePath("/apple-touch-icon.png") },
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
          <MobileNav />
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
