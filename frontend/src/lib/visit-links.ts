import type { Lighthouse } from "@/types/lighthouse";

export function officialVisitUrl(urls: readonly string[]): string | undefined {
  return urls.find((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname === "www.tokokai.org" && /^\/tourlight\/tourlight\d+\/$/.test(url.pathname);
    } catch { return false; }
  });
}

export function directionsUrl(lighthouse: Pick<Lighthouse, "latitude" | "longitude">): string {
  const params = new URLSearchParams({ api: "1", destination: `${lighthouse.latitude},${lighthouse.longitude}` });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
