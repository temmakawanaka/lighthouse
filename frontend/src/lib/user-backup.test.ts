import { describe, expect, it } from "vitest";
import { catalog } from "./catalog";
import { createUserBackup, parseUserBackup } from "./user-backup";

describe("user backup", () => {
  const validSlugs = new Set(catalog.map(({ slug }) => slug));

  it("exports and restores status, visit details, and trip data", () => {
    const status = { version: 3 as const, favorites: ["omaesaki"], visited: ["inubosaki"], visits: { inubosaki: { date: "2026-09-09", note: "晴れ" } }, stamps: {} };
    const trip = { version: 1 as const, date: "2026-10-01", stops: ["omaesaki", "inubosaki"] };
    const backup = createUserBackup(status, trip, new Date("2026-09-09T00:00:00Z"));
    expect(parseUserBackup(JSON.stringify(backup), validSlugs)).toEqual(backup);
  });

  it("rejects unrelated files and filters unknown records", () => {
    expect(() => parseUserBackup(JSON.stringify({ app: "other", version: 1 }), validSlugs)).toThrow();
    const value = JSON.stringify({ app: "lighthouse-field-guide", version: 1, exportedAt: "", status: {
      favorites: ["unknown"],
      visited: ["unknown"],
      stamps: { unknown: { obtainedAt: "2026-09-09T10:00:00.000Z", distanceM: 1, accuracyM: 1 } },
    }, trip: { stops: ["unknown"] } });
    const parsed = parseUserBackup(value, validSlugs);
    expect(parsed.status.favorites).toEqual([]);
    expect(parsed.status.stamps).toEqual({});
  });
});
