import { describe, expect, it } from "vitest";
import { CHECK_IN_RADIUS_M, evaluateCheckIn } from "./check-in";

const lighthouse = { latitude: "35.000000", longitude: "139.000000" };

describe("GPS check-in eligibility", () => {
  it("accepts a precise position inside the base radius", () => {
    const result = evaluateCheckIn({ latitude: 35.001, longitude: 139, accuracy: 10 }, lighthouse);
    expect(result.distanceM).toBeLessThan(CHECK_IN_RADIUS_M);
    expect(result.eligible).toBe(true);
  });

  it("rejects a distant position even when accuracy is poor", () => {
    const result = evaluateCheckIn({ latitude: 35.01, longitude: 139, accuracy: 5000 }, lighthouse);
    expect(result.allowedRadiusM).toBe(500);
    expect(result.accuracySufficient).toBe(false);
    expect(result.eligible).toBe(false);
  });

  it("rejects an apparently nearby position when reported accuracy is too poor", () => {
    const result = evaluateCheckIn({ latitude: 35, longitude: 139, accuracy: 1000 }, lighthouse);
    expect(result.distanceM).toBe(0);
    expect(result.accuracySufficient).toBe(false);
    expect(result.eligible).toBe(false);
  });

  it("allows a small capped accuracy margin", () => {
    const result = evaluateCheckIn({ latitude: 35.004, longitude: 139, accuracy: 200 }, lighthouse);
    expect(result.distanceM).toBeGreaterThan(CHECK_IN_RADIUS_M);
    expect(result.eligible).toBe(true);
  });
});
