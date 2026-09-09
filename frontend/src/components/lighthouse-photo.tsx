import Image from "next/image";
import photoSources from "@/data/photo-sources.json";
import type { Lighthouse } from "@/types/lighthouse";
import { LighthouseVisual } from "./lighthouse-visual";

export function LighthousePhoto({ lighthouse, compact = false }: { lighthouse: Lighthouse; compact?: boolean }) {
  const photo = photoSources[lighthouse.slug as keyof typeof photoSources];

  if (!photo) return <LighthouseVisual visualId={lighthouse.slug} label={`${lighthouse.name}のイメージ図版`} />;
  const filename = lighthouse.slug === "omaesaki" ? "omaezaki-lighthouse-alpsdake" : lighthouse.slug;
  const imageSource = `/images/${filename}.webp`;
  const thumbnailSource = `/images/thumbs/${filename}.webp`;

  return <figure className={`lighthouse-photo${compact ? " lighthouse-photo--compact" : ""}`}>
    <Image src={compact ? thumbnailSource : imageSource} alt={photo.alt}
      width={compact ? 640 : 1280} height={compact ? 427 : 853} unoptimized sizes={compact ? "(max-width: 840px) 100vw, 32vw" : "(max-width: 840px) 100vw, 50vw"} />
    {!compact && <figcaption>写真：{photo.author} / <a href={photo.source_url} target="_blank" rel="noreferrer">Wikimedia Commons</a> / <a href={photo.license_url} target="_blank" rel="noreferrer">{photo.license}</a></figcaption>}
  </figure>;
}
