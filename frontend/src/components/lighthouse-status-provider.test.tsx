import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LighthouseStatusProvider, parseStoredStatus, STORAGE_KEY, useLighthouseStatus } from "./lighthouse-status-provider";

describe("parseStoredStatus", () => {
  it("returns an empty state for invalid input", () => {
    expect(parseStoredStatus("not-json")).toEqual({ version: 3, favorites: [], visited: [], visits: {}, stamps: {} });
    expect(parseStoredStatus(JSON.stringify({ favorites: "bad", visited: [1] }))).toEqual({ version: 3, favorites: [], visited: [], visits: {}, stamps: {} });
  });

  it("deduplicates and validates stored slugs", () => {
    expect(parseStoredStatus(JSON.stringify({ favorites: ["omaesaki", "omaesaki", 1], visited: ["inubosaki"] })))
      .toEqual({ version: 3, favorites: ["omaesaki"], visited: ["inubosaki"], visits: { inubosaki: { date: "", note: "" } }, stamps: {} });
  });

  it("normalizes a GPS stamp into a visit record when importing older or edited data", () => {
    const status = parseStoredStatus(JSON.stringify({
      visited: [],
      stamps: { omaesaki: { obtainedAt: "2026-09-09T10:00:00.000Z", distanceM: 42, accuracyM: 9 } },
    }));
    expect(status.visited).toContain("omaesaki");
    expect(status.visits.omaesaki.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("LighthouseStatusProvider", () => {
  beforeEach(() => window.localStorage.clear());

  it("loads, toggles, and persists independent states", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ favorites: ["omaesaki"], visited: [] }));
    const wrapper = ({ children }: { children: ReactNode }) => <LighthouseStatusProvider>{children}</LighthouseStatusProvider>;
    const { result } = renderHook(() => useLighthouseStatus(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.favorites).toEqual(["omaesaki"]);

    act(() => result.current.toggleVisited("omaesaki"));
    expect(result.current.visited).toEqual(["omaesaki"]);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}").visited).toEqual(["omaesaki"]);

    act(() => result.current.updateVisit("omaesaki", { date: "2026-09-09", note: "海がきれいだった" }));
    expect(result.current.visits.omaesaki).toEqual({ date: "2026-09-09", note: "海がきれいだった" });

    act(() => result.current.toggleFavorite("omaesaki"));
    expect(result.current.favorites).toEqual([]);
    expect(result.current.visited).toEqual(["omaesaki"]);

    act(() => result.current.obtainStamp("omaesaki", { obtainedAt: "2026-09-09T10:00:00.000Z", distanceM: 42, accuracyM: 9 }));
    expect(result.current.stamps.omaesaki.distanceM).toBe(42);

    act(() => result.current.toggleVisited("omaesaki"));
    expect(result.current.visited).toEqual(["omaesaki"]);
    expect(result.current.stamps.omaesaki.distanceM).toBe(42);
  });

  it("does not claim a stamp when browser storage rejects the write", async () => {
    const wrapper = ({ children }: { children: ReactNode }) => <LighthouseStatusProvider>{children}</LighthouseStatusProvider>;
    const { result } = renderHook(() => useLighthouseStatus(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });

    let saved = true;
    act(() => {
      saved = result.current.obtainStamp("omaesaki", { obtainedAt: "2026-09-09T10:00:00.000Z", distanceM: 42, accuracyM: 9 });
    });
    expect(saved).toBe(false);
    expect(result.current.stamps).toEqual({});
    expect(result.current.storageError).toBe(true);
    setItem.mockRestore();
  });
});
