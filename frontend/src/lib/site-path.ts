const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const SITE_BASE_PATH = configuredBasePath
  ? `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`
  : "";

export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_ORIGIN
  ?? "https://lighthouse-field-guide.colet3020.chatgpt.site")
  .replace(/\/$/, "");

export function sitePath(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${SITE_BASE_PATH}${path}`;
}

export function siteUrl(path: string): string {
  return `${SITE_ORIGIN}${sitePath(path)}`;
}
