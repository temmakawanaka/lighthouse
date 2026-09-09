import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { LighthouseStatusProvider, parseStoredStatus, STORAGE_KEY, useLighthouseStatus } from "./lighthouse-status-provider";

describe("parseStoredStatus", () => {
  it("returns an empty state for invalid input", () => {
    expect(parseStoredStatus("not-json")).toEqual({ version: 2, favorites: [], visited: [], visits: {} });
    expect(parseStoredStatus(JSON.stringify({ favorites: "bad", visited: [1] }))).toEqual({ version: 2, favorites: [], visited: [], visits: {} });
  });

  it("deduplicates and validates stored slugs", () => {
    expect(parseStoredStatus(JSON.stringify({ favorites: ["omaesaki", "omaesaki", 1], visited: ["inubosaki"] })))
      .toEqual({ version: 2, favorites: ["omaesaki"], visited: ["inubosaki"], visits: { inubosaki: { date: "", note: "" } } });
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
  });
});
