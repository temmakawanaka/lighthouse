import type { Lighthouse } from "@/types/lighthouse";
import { distanceKm } from "./trip-plan";

export const CHECK_IN_RADIUS_M = 300;
export const MAX_ACCURACY_ALLOWANCE_M = 200;

export interface CheckInPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export function evaluateCheckIn(position: CheckInPosition, lighthouse: Pick<Lighthouse, "latitude" | "longitude">) {
  const distanceM = distanceKm(
    { latitude: String(position.latitude), longitude: String(position.longitude) },
    lighthouse,
  ) * 1000;
  const accuracyM = Math.max(0, position.accuracy);
  const allowedRadiusM = CHECK_IN_RADIUS_M + Math.min(accuracyM, MAX_ACCURACY_ALLOWANCE_M);
  const accuracySufficient = accuracyM <= MAX_ACCURACY_ALLOWANCE_M;
  return {
    distanceM,
    accuracyM,
    allowedRadiusM,
    accuracySufficient,
    eligible: accuracySufficient && distanceM <= allowedRadiusM,
  };
}
