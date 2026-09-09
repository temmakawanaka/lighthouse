import { PAGE_SIZE } from "@/lib/constants";
import { usesCatalog } from "@/lib/data-source";
import { getCatalogLighthouse, searchCatalog } from "@/lib/catalog";
import type { ListQuery } from "@/lib/query-params";
import { toApiSort } from "@/lib/query-params";
import type { Lighthouse, LighthouseListResponse } from "@/types/lighthouse";

const DEFAULT_API_BASE_URL = "http://localhost:8000";

export class LighthouseApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "LighthouseApiError";
  }
}

function apiBaseUrl(): string {
  return (
    process.env.LIGHTHOUSE_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    DEFAULT_API_BASE_URL
  ).replace(/\/$/, "");
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new LighthouseApiError("灯台APIの取得に失敗しました。", response.status);
  }

  return (await response.json()) as T;
}

export async function getLighthouses(query: ListQuery): Promise<LighthouseListResponse> {
  if (usesCatalog()) return searchCatalog(query);
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String((query.page - 1) * PAGE_SIZE),
  });
  const { sortBy, sortOrder } = toApiSort(query.sort);

  params.set("sort_by", sortBy);
  params.set("sort_order", sortOrder);

  if (query.q) params.set("q", query.q);
  if (query.prefecture) params.set("prefecture", query.prefecture);
  if (query.visitable) params.set("is_visitable", "true");

  return request<LighthouseListResponse>(`/api/v1/lighthouses?${params.toString()}`);
}

export async function getLighthouseBySlug(slug: string): Promise<Lighthouse> {
  if (usesCatalog()) {
    const record = getCatalogLighthouse(slug);
    if (!record) throw new LighthouseApiError("灯台が見つかりませんでした。", 404);
    return record;
  }
  return request<Lighthouse>(`/api/v1/lighthouses/slug/${encodeURIComponent(slug)}`);
}
