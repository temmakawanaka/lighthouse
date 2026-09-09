export function formatDate(value: string | null): string | null {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  return `${year}年${month}月${day}日`;
}

export function formatYear(value: string | null, builtYear: number | null): string | null {
  if (value) {
    const year = Number.parseInt(value.slice(0, 4), 10);
    if (Number.isFinite(year)) return `${year}年`;
  }

  return builtYear ? `${builtYear}年` : null;
}

export function formatNumber(value: number | string | null, unit: string): string | null {
  if (value === null || value === "") return null;

  const number = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(number)) return null;

  return `${new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 2 }).format(number)}${unit}`;
}

export function formatLocation(
  prefecture: string | null,
  municipality: string | null,
): string {
  return [prefecture, municipality].filter(Boolean).join(" ") || "所在地情報なし";
}

export function sourceLabel(url: string, index: number): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "www.tokokai.org") return /\/tourlight\/tourlight\d+/.test(parsed.pathname) ? "燈光会：この灯台の参観案内" : "燈光会：のぼれる灯台一覧";
    if (parsed.hostname === "www.kaiho.mlit.go.jp" && parsed.pathname === "/soshiki/koutsuu/toudai/kengaku.html") return "海上保安庁：参観できる灯台";
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return `情報源 ${index + 1}`;
  }
}
