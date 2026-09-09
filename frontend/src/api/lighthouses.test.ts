import { afterEach, describe, expect, it, vi } from "vitest";
import { getLighthouseBySlug, getLighthouses, LighthouseApiError } from "./lighthouses";
import { parseListQuery } from "@/lib/query-params";
import { usesCatalog } from "@/lib/data-source";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("catalog and API selection", () => {
  it("runs without any network or database configuration", async () => {
    vi.stubEnv("LIGHTHOUSE_DATA_SOURCE", "");
    vi.stubEnv("LIGHTHOUSE_API_BASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    expect((await getLighthouses(parseListQuery({}))).total).toBe(16);
    expect((await getLighthouseBySlug("omaesaki")).name).toBe("御前埼灯台");
    await expect(getLighthouseBySlug("missing")).rejects.toMatchObject({ status: 404 });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("keeps configured API failures visible instead of substituting catalog data", async () => {
    vi.stubEnv("LIGHTHOUSE_DATA_SOURCE", "");
    vi.stubEnv("LIGHTHOUSE_API_BASE_URL", "https://api.example.test/");
    const fetch = vi.fn().mockResolvedValue(new Response("unavailable", { status: 503 }));
    vi.stubGlobal("fetch", fetch);
    await expect(getLighthouses(parseListQuery({ prefecture: "静岡県", page: "2" }))).rejects.toBeInstanceOf(LighthouseApiError);
    const requested = new URL(fetch.mock.calls[0][0]);
    expect(requested.origin).toBe("https://api.example.test");
    expect(requested.searchParams.get("prefecture")).toBe("静岡県");
    expect(requested.searchParams.get("offset")).toBe("12");
  });
  it("rejects invalid configuration", () => {
    vi.stubEnv("LIGHTHOUSE_DATA_SOURCE", "typo");
    expect(usesCatalog).toThrow("catalog or api");
  });
});
