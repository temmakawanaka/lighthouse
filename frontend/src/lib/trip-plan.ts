import type { Lighthouse } from "@/types/lighthouse";

export const TRIP_STORAGE_KEY = "lighthouse-field-guide:trip-plan:v1";
export const MAX_TRIP_STOPS = 5;

export interface TripPlan {
  version: 1;
  date: string;
  stops: string[];
}

export const emptyTripPlan: TripPlan = { version: 1, date: "", stops: [] };

export function parseTripPlan(value: string | null, validSlugs: ReadonlySet<string>): TripPlan {
  if (!value) return emptyTripPlan;
  try {
    const parsed = JSON.parse(value) as Partial<TripPlan>;
    const date = typeof parsed.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : "";
    const stops = Array.isArray(parsed.stops)
      ? [...new Set(parsed.stops.filter((slug): slug is string => typeof slug === "string" && validSlugs.has(slug)))].slice(0, MAX_TRIP_STOPS)
      : [];
    return { version: 1, date, stops };
  } catch {
    return emptyTripPlan;
  }
}

export function distanceKm(first: Pick<Lighthouse, "latitude" | "longitude">, second: Pick<Lighthouse, "latitude" | "longitude">): number {
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const firstLatitude = toRadians(Number(first.latitude));
  const secondLatitude = toRadians(Number(second.latitude));
  const latitudeDelta = secondLatitude - firstLatitude;
  const longitudeDelta = toRadians(Number(second.longitude) - Number(first.longitude));
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function routeDistanceKm(stops: readonly Lighthouse[]): number {
  return stops.slice(1).reduce((total, stop, index) => total + distanceKm(stops[index], stop), 0);
}

export function googleMapsRouteUrl(stops: readonly Lighthouse[]): string | null {
  if (stops.length < 2) return null;
  const coordinate = (record: Lighthouse) => `${record.latitude},${record.longitude}`;
  const params = new URLSearchParams({
    api: "1",
    origin: coordinate(stops[0]),
    destination: coordinate(stops.at(-1)!),
    travelmode: "driving",
  });
  if (stops.length > 2) params.set("waypoints", stops.slice(1, -1).map(coordinate).join("|"));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function nearbyLighthouses(current: Lighthouse, catalog: readonly Lighthouse[], limit = 3) {
  return catalog
    .filter(({ slug }) => slug !== current.slug)
    .map((lighthouse) => ({ lighthouse, distanceKm: distanceKm(current, lighthouse) }))
    .sort((first, second) => first.distanceKm - second.distanceKm)
    .slice(0, limit);
}
