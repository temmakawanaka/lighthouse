import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog";
import { distanceKm, googleMapsRouteUrl, MAX_TRIP_STOPS, nearbyLighthouses, parseSharedTrip, parseTripPlan, sharedTripQuery } from "./trip-plan";

describe("trip plan", () => {
  const validSlugs = new Set(catalog.map(({ slug }) => slug));

  it("recovers safely from invalid and legacy stored values", () => {
    expect(parseTripPlan("not-json", validSlugs)).toEqual({ version: 1, date: "", stops: [] });
    expect(parseTripPlan(JSON.stringify({ date: "bad", stops: ["omaesaki", "unknown", "omaesaki"] }), validSlugs))
      .toEqual({ version: 1, date: "", stops: ["omaesaki"] });
  });

  it("limits the plan to the Google Maps mobile-safe stop count", () => {
    const stops = catalog.slice(0, MAX_TRIP_STOPS + 2).map(({ slug }) => slug);
    expect(parseTripPlan(JSON.stringify({ date: "2026-10-01", stops }), validSlugs))
      .toEqual({ version: 1, date: "2026-10-01", stops: stops.slice(0, MAX_TRIP_STOPS) });
  });

  it("builds an ordered Google Maps driving route", () => {
    const url = new URL(googleMapsRouteUrl([catalog[0], catalog[1], catalog[2]])!);
    expect(url.hostname).toBe("www.google.com");
    expect(url.searchParams.get("origin")).toBe(`${catalog[0].latitude},${catalog[0].longitude}`);
    expect(url.searchParams.get("waypoints")).toBe(`${catalog[1].latitude},${catalog[1].longitude}`);
    expect(url.searchParams.get("destination")).toBe(`${catalog[2].latitude},${catalog[2].longitude}`);
    expect(googleMapsRouteUrl([catalog[0]])).toBeNull();
  });

  it("round-trips a shared trip without accepting unknown stops", () => {
    const plan = { version: 1 as const, date: "2026-10-01", stops: ["omaesaki", "inubosaki"] };
    expect(parseSharedTrip(`?${sharedTripQuery(plan)}`, validSlugs)).toEqual(plan);
    expect(parseSharedTrip("?stops=unknown", validSlugs)).toBeNull();
    expect(parseSharedTrip("?stops=omaesaki&date=bad", validSlugs)?.date).toBe("");
  });

  it("calculates plausible distances and nearest lighthouses", () => {
    expect(distanceKm(catalog[0], catalog[0])).toBeCloseTo(0);
    const omaesaki = catalog.find(({ slug }) => slug === "omaesaki")!;
    const nearest = nearbyLighthouses(omaesaki, catalog);
    expect(nearest).toHaveLength(3);
    expect(nearest[0].distanceKm).toBeGreaterThan(0);
    expect(nearest[0].distanceKm).toBeLessThanOrEqual(nearest[1].distanceKm);
  });
});
