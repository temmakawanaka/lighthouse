import type { MetadataRoute } from "next";
import { catalog } from "@/lib/catalog";

const origin = "https://lighthouse-field-guide.colet3020.chatgpt.site";
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date("2026-09-09");
  return [
    { url: origin, lastModified: updated, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/map/`, lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
    { url: `${origin}/trip/`, lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
    ...catalog.map(({ slug }) => ({ url: `${origin}/lighthouses/${slug}/`, lastModified: updated, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
