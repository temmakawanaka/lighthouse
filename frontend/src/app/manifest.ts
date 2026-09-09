import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "灯台アプリ｜日本の海辺をめぐる案内帖",
    short_name: "灯台アプリ",
    description: "のぼれる灯台16を探し、参観情報を確認できるフィールドガイド。",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f0e7",
    theme_color: "#102c34",
    lang: "ja",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
