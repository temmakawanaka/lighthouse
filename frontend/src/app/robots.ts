import type { MetadataRoute } from "next";
import { sitePath, siteUrl } from "@/lib/site-path";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: sitePath("/") },
    sitemap: siteUrl("/sitemap.xml"),
  };
}
