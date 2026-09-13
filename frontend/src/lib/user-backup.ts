import { parseStoredStatus, type StoredStatus } from "@/components/lighthouse-status-provider";
import { parseTripPlan, type TripPlan } from "./trip-plan";

export interface UserBackup {
  app: "lighthouse-field-guide";
  version: 1;
  exportedAt: string;
  status: StoredStatus;
  trip: TripPlan;
}

export function createUserBackup(status: StoredStatus, trip: TripPlan, now = new Date()): UserBackup {
  return { app: "lighthouse-field-guide", version: 1, exportedAt: now.toISOString(), status, trip };
}

export function parseUserBackup(value: string, validSlugs: ReadonlySet<string>): UserBackup {
  const parsed = JSON.parse(value) as Partial<UserBackup>;
  if (parsed.app !== "lighthouse-field-guide" || parsed.version !== 1 || !parsed.status || !parsed.trip) {
    throw new Error("この灯台アプリのバックアップファイルではありません。");
  }
  const validStatus = parseStoredStatus(JSON.stringify(parsed.status));
  const allowed = (slugs: string[]) => slugs.filter((slug) => validSlugs.has(slug));
  const status = {
    ...validStatus,
    favorites: allowed(validStatus.favorites),
    visited: allowed(validStatus.visited),
    visits: Object.fromEntries(Object.entries(validStatus.visits).filter(([slug]) => validSlugs.has(slug))),
    stamps: Object.fromEntries(Object.entries(validStatus.stamps).filter(([slug]) => validSlugs.has(slug))),
  };
  return {
    app: "lighthouse-field-guide",
    version: 1,
    exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : new Date(0).toISOString(),
    status,
    trip: parseTripPlan(JSON.stringify(parsed.trip), validSlugs),
  };
}
