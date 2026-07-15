interface LighthouseVisualProps {
  size?: "card" | "hero" | "detail";
  label?: string;
}

export function LighthouseVisual({ size = "card", label }: LighthouseVisualProps) {
  return (
    <div
      className={`lighthouse-visual lighthouse-visual--${size}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 640 360" focusable="false">
        <defs>
          <linearGradient id={`sky-${size}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bfe7e8" />
            <stop offset="1" stopColor="#f6eee0" />
          </linearGradient>
          <linearGradient id={`sea-${size}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0b6670" />
            <stop offset="1" stopColor="#0b354d" />
          </linearGradient>
        </defs>
        <rect width="640" height="360" fill={`url(#sky-${size})`} />
        <circle cx="516" cy="70" r="30" fill="#f7b957" opacity=".92" />
        <path d="M0 214c91-36 168-25 250 3 86 30 167 22 249-7 56-20 102-15 141 5v145H0V214Z" fill={`url(#sea-${size})`} />
        <path d="M0 247c82-25 156-16 235 11 103 35 198 30 280 1 45-16 87-16 125-3" fill="none" stroke="#dff3ef" strokeWidth="7" opacity=".65" />
        <path d="M340 309 366 119h68l26 190H340Z" fill="#f9f6ed" />
        <path d="m366 119 7-42h54l7 42h-68Z" fill="#f9f6ed" />
        <path d="M354 119h92v22h-92z" fill="#d9574e" />
        <path d="m347 77 53-38 53 38H347Z" fill="#183b50" />
        <rect x="382" y="81" width="36" height="24" rx="2" fill="#f7b957" />
        <path d="M327 77h146M337 69v23M463 69v23" fill="none" stroke="#183b50" strokeWidth="6" />
        <path d="M365 185h70l5 36h-80l5-36Z" fill="#d9574e" />
        <path d="M395 260h22v49h-22z" fill="#183b50" />
        <path d="M418 89 589 60M382 89 226 60" fill="none" stroke="#fff8d7" strokeWidth="12" strokeLinecap="round" opacity=".48" />
        <path d="M258 309c17-47 49-65 101-54l-8 54h-93Zm190 0-7-52c48-14 88 4 119 52H448Z" fill="#173f45" />
        <path d="M78 86c18-12 36-12 54 0 18-12 36-12 54 0M116 130c13-9 27-9 40 0 13-9 26-9 39 0" fill="none" stroke="#476c78" strokeWidth="5" strokeLinecap="round" opacity=".55" />
      </svg>
    </div>
  );
}
