interface LighthouseVisualProps {
  visualId: string;
  size?: "card" | "hero" | "detail";
  label?: string;
}

export function LighthouseVisual({ visualId, size = "card", label }: LighthouseVisualProps) {
  const idSuffix = `${size}-${visualId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const skyId = `sky-${idSuffix}`;
  const seaId = `sea-${idSuffix}`;
  const variant = Array.from(visualId).reduce((total, character) => total + character.charCodeAt(0), 0) % 3;
  const palettes = [
    { sky: "#dbe7e4", horizon: "#f1e4cf", sea: "#2e6269", deep: "#173f4a", sun: "#d96a4c" },
    { sky: "#d8e2e7", horizon: "#eee5d5", sea: "#476f76", deep: "#223f4b", sun: "#d39a3f" },
    { sky: "#e3e2d9", horizon: "#f2e5d1", sea: "#37636e", deep: "#183e4a", sun: "#c85645" },
  ];
  const palette = palettes[variant];
  const sunX = [512, 118, 530][variant];

  return (
    <div
      className={`lighthouse-visual lighthouse-visual--${size}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 640 360" focusable="false">
        <defs>
          <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={palette.sky} />
            <stop offset="1" stopColor={palette.horizon} />
          </linearGradient>
          <linearGradient id={seaId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={palette.sea} />
            <stop offset="1" stopColor={palette.deep} />
          </linearGradient>
        </defs>
        <rect width="640" height="360" fill={`url(#${skyId})`} />
        <path d="M0 174h640" fill="none" stroke="#173f4a" strokeWidth="1" opacity=".18" />
        <circle cx={sunX} cy="72" r="27" fill={palette.sun} opacity=".9" />
        <path d="M0 214c91-31 168-22 250 5 86 28 167 19 249-7 56-18 102-13 141 5v143H0V214Z" fill={`url(#${seaId})`} />
        <path d="M0 251c82-23 156-15 235 10 103 32 198 27 280 1 45-14 87-14 125-3" fill="none" stroke="#f4efe2" strokeWidth="4" opacity=".7" />
        <path d="M0 279c72-18 151-8 226 13 101 29 202 23 286-2 46-14 88-12 128-1" fill="none" stroke="#f4efe2" strokeWidth="2" opacity=".35" />
        <path d="M340 311 366 119h68l26 192H340Z" fill="#f6f1e6" stroke="#173f4a" strokeWidth="2" />
        <path d="m366 119 7-42h54l7 42h-68Z" fill="#f6f1e6" stroke="#173f4a" strokeWidth="2" />
        <path d="M354 119h92v22h-92z" fill={palette.sun} stroke="#173f4a" strokeWidth="2" />
        <path d="m347 77 53-38 53 38H347Z" fill="#173f4a" />
        <rect x="382" y="81" width="36" height="24" fill="#e7b75b" stroke="#173f4a" strokeWidth="2" />
        <path d="M327 77h146M337 68v24M463 68v24" fill="none" stroke="#173f4a" strokeWidth="5" />
        <path d="M365 185h70l5 36h-80l5-36Z" fill={palette.sun} stroke="#173f4a" strokeWidth="2" />
        <path d="M395 260h22v51h-22z" fill="#173f4a" />
        <path d="M258 311c17-47 49-65 101-54l-8 54h-93Zm190 0-7-52c48-14 88 4 119 52H448Z" fill="#244b46" />
        <path d="M79 86c18-12 36-12 54 0 18-12 36-12 54 0M116 130c13-9 27-9 40 0 13-9 26-9 39 0" fill="none" stroke="#365966" strokeWidth="4" strokeLinecap="round" opacity=".62" />
        <path d="M30 326h580" fill="none" stroke="#f4efe2" strokeWidth="1" opacity=".45" />
      </svg>
    </div>
  );
}
