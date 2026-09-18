import type { Lighthouse } from "@/types/lighthouse";
import { distanceKm } from "./trip-plan";

export const CHECK_IN_RADIUS_M = 300;
export const MAX_ACCURACY_ALLOWANCE_M = 200;

export interface CheckInPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

type CheckInLighthouse = Pick<Lighthouse, "latitude" | "longitude" | "check_in_type" | "check_in_latitude" | "check_in_longitude" | "check_in_radius_m" | "check_in_location_name" | "check_in_source_url">;

export function getCheckInTarget(lighthouse: CheckInLighthouse) {
  const kind = lighthouse.check_in_type ?? "onsite";
  return {
    kind,
    latitude: lighthouse.check_in_latitude ?? lighthouse.latitude,
    longitude: lighthouse.check_in_longitude ?? lighthouse.longitude,
    radiusM: lighthouse.check_in_radius_m ?? CHECK_IN_RADIUS_M,
    locationName: lighthouse.check_in_location_name ?? (kind === "viewpoint" ? "安全な遠望地点" : "灯台周辺"),
    sourceUrl: lighthouse.check_in_source_url,
  } as const;
}

export function evaluateCheckIn(position: CheckInPosition, lighthouse: CheckInLighthouse) {
  const target = getCheckInTarget(lighthouse);
  const distanceM = distanceKm(
    { latitude: String(position.latitude), longitude: String(position.longitude) },
    target,
  ) * 1000;
  const accuracyM = Math.max(0, position.accuracy);
  const allowedRadiusM = target.radiusM + Math.min(accuracyM, MAX_ACCURACY_ALLOWANCE_M);
  const accuracySufficient = accuracyM <= MAX_ACCURACY_ALLOWANCE_M;
  return {
    distanceM,
    accuracyM,
    allowedRadiusM,
    accuracySufficient,
    eligible: accuracySufficient && distanceM <= allowedRadiusM,
    target,
  };
}
