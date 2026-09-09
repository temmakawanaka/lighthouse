import Image from "next/image";

export function LighthousePhoto({ compact = false }: { compact?: boolean }) {
  return <figure className={`lighthouse-photo${compact ? " lighthouse-photo--compact" : ""}`}>
    <Image src="/images/omaezaki-lighthouse-alpsdake.jpg" alt="御前埼灯台と御前崎の海岸線。2018年撮影。"
      width={1280} height={853} unoptimized sizes={compact ? "(max-width: 840px) 100vw, 32vw" : "(max-width: 840px) 100vw, 50vw"} />
    <figcaption>写真：Alpsdake / <a href="https://commons.wikimedia.org/wiki/File:Omaezaki_Lighthouse_and_Shizuoka_Prefectural_Road_Route_357.jpg" target="_blank" rel="noreferrer">Wikimedia Commons</a> / <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a></figcaption>
  </figure>;
}
