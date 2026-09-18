import type { MetadataRoute } from "next";
import { sitePath } from "@/lib/site-path";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "灯台アプリ｜日本の海辺をめぐる案内帖",
    short_name: "灯台アプリ",
    description: "日本各地の灯台を地図で探し、GPSチェックインでスタンプを集めるフィールドガイド。",
    id: sitePath("/"),
    start_url: sitePath("/"),
    scope: sitePath("/"),
    display: "standalone",
    background_color: "#f4f0e7",
    theme_color: "#102c34",
    lang: "ja",
    icons: [
      { src: sitePath("/icon-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: sitePath("/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
      { src: sitePath("/icon-512-maskable.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: sitePath("/icon.svg"), sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
