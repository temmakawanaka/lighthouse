import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { LighthouseStatusProvider, parseStoredStatus, STORAGE_KEY, useLighthouseStatus } from "./lighthouse-status-provider";

describe("parseStoredStatus", () => {
  it("returns an empty state for invalid input", () => {
    expect(parseStoredStatus("not-json")).toEqual({ version: 1, favorites: [], visited: [] });
    expect(parseStoredStatus(JSON.stringify({ favorites: "bad", visited: [1] }))).toEqual({ version: 1, favorites: [], visited: [] });
  });

  it("deduplicates and validates stored slugs", () => {
    expect(parseStoredStatus(JSON.stringify({ favorites: ["omaesaki", "omaesaki", 1], visited: ["inubosaki"] })))
      .toEqual({ version: 1, favorites: ["omaesaki"], visited: ["inubosaki"] });
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

    act(() => result.current.toggleFavorite("omaesaki"));
    expect(result.current.favorites).toEqual([]);
    expect(result.current.visited).toEqual(["omaesaki"]);
  });
});
