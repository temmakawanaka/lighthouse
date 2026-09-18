import type { MetadataRoute } from "next";
import { catalog } from "@/lib/catalog";
import { siteUrl } from "@/lib/site-path";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date("2026-09-09");
  return [
    { url: siteUrl("/"), lastModified: updated, changeFrequency: "weekly", priority: 1 },
    { url: siteUrl("/map/"), lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
    { url: siteUrl("/stamps/"), lastModified: updated, changeFrequency: "monthly", priority: 0.7 },
    { url: siteUrl("/trip/"), lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
    ...catalog.map(({ slug }) => ({ url: siteUrl(`/lighthouses/${slug}/`), lastModified: updated, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
