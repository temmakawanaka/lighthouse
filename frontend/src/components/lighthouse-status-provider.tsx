"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "lighthouse-field-guide:user-state:v1";
const TEST_MODE_KEY = "lighthouse-field-guide:test-mode:v1";

export interface VisitRecord {
  date: string;
  note: string;
}

export interface StampRecord {
  obtainedAt: string;
  distanceM: number;
  accuracyM: number;
  source?: "test";
  addedVisit?: boolean;
}

export interface StoredStatus {
  version: 3;
  favorites: string[];
  visited: string[];
  visits: Record<string, VisitRecord>;
  stamps: Record<string, StampRecord>;
}
type StatusListKey = "favorites" | "visited";

interface LighthouseStatusContextValue extends StoredStatus {
  ready: boolean;
  storageError: boolean;
  testMode: boolean;
  toggleFavorite: (slug: string) => void;
  toggleVisited: (slug: string) => void;
  updateVisit: (slug: string, visit: VisitRecord) => void;
  obtainStamp: (slug: string, stamp: StampRecord) => boolean;
  obtainTestStamp: (slug: string) => boolean;
  clearTestStamps: () => void;
  setTestMode: (enabled: boolean) => void;
  replaceStatus: (status: StoredStatus) => void;
}

const emptyStatus: StoredStatus = { version: 3, favorites: [], visited: [], visits: {}, stamps: {} };
const LighthouseStatusContext = createContext<LighthouseStatusContextValue>({
  ...emptyStatus,
  ready: false,
  storageError: false,
  testMode: false,
  toggleFavorite: () => undefined,
  toggleVisited: () => undefined,
  updateVisit: () => undefined,
  obtainStamp: () => false,
  obtainTestStamp: () => false,
  clearTestStamps: () => undefined,
  setTestMode: () => undefined,
  replaceStatus: () => undefined,
});

function validVisitRecord(value: unknown): VisitRecord {
  const record = value && typeof value === "object" ? value as Partial<VisitRecord> : {};
  return {
    date: typeof record.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(record.date) ? record.date : "",
    note: typeof record.note === "string" ? record.note.slice(0, 500) : "",
  };
}

function validStampRecord(value: unknown): StampRecord | null {
  const record = value && typeof value === "object" ? value as Partial<StampRecord> : {};
  if (typeof record.obtainedAt !== "string" || Number.isNaN(Date.parse(record.obtainedAt))) return null;
  if (typeof record.distanceM !== "number" || !Number.isFinite(record.distanceM) || record.distanceM < 0) return null;
  if (typeof record.accuracyM !== "number" || !Number.isFinite(record.accuracyM) || record.accuracyM < 0) return null;
  return {
    obtainedAt: record.obtainedAt,
    distanceM: Math.round(record.distanceM),
    accuracyM: Math.round(record.accuracyM),
    ...(record.source === "test" ? { source: "test" as const } : {}),
    ...(record.source === "test" && record.addedVisit === true ? { addedVisit: true } : {}),
  };
}

export function parseStoredStatus(value: string | null): StoredStatus {
  if (!value) return emptyStatus;
  try {
    const parsed = JSON.parse(value) as Partial<StoredStatus>;
    const strings = (items: unknown) => Array.isArray(items)
      ? [...new Set(items.filter((item): item is string => typeof item === "string" && item.length <= 80))]
      : [];
    const favorites = strings(parsed.favorites).slice(0, 250);
    const sourceStamps = parsed.stamps && typeof parsed.stamps === "object" ? parsed.stamps : {};
    const stamps = Object.fromEntries(Object.entries(sourceStamps).flatMap(([slug, stamp]) => {
      const valid = validStampRecord(stamp);
      return valid && slug.length <= 80 ? [[slug, valid]] : [];
    }).slice(0, 250));
    const visited = [...new Set([...strings(parsed.visited), ...Object.keys(stamps)])].slice(0, 250);
    const sourceVisits = parsed.visits && typeof parsed.visits === "object" ? parsed.visits : {};
    const visits = Object.fromEntries(visited.map((slug) => {
      const fallbackDate = stamps[slug] ? localDate(new Date(stamps[slug].obtainedAt)) : "";
      const visit = validVisitRecord(sourceVisits[slug]);
      return [slug, visit.date || visit.note ? visit : { date: fallbackDate, note: "" }];
    }));
    return { version: 3, favorites, visited, visits, stamps };
  } catch {
    return emptyStatus;
  }
}

function localDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function LighthouseStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<StoredStatus>(emptyStatus);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [testMode, setTestModeState] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        setStatus(parseStoredStatus(window.localStorage.getItem(STORAGE_KEY)));
        setTestModeState(window.localStorage.getItem(TEST_MODE_KEY) === "true");
      } catch {
        setStatus(emptyStatus);
      }
      setReady(true);
    });
    const synchronize = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setStatus(parseStoredStatus(event.newValue));
      if (event.key === TEST_MODE_KEY) setTestModeState(event.newValue === "true");
    };
    window.addEventListener("storage", synchronize);
    return () => {
      active = false;
      window.removeEventListener("storage", synchronize);
    };
  }, []);

  const update = useCallback((key: StatusListKey, slug: string) => {
    setStatus((current) => {
      // A GPS-earned stamp is the stronger record: it must not be removed by
      // the lightweight manual "visit memo" toggle.
      if (key === "visited" && current.stamps[slug]) return current;
      const values = current[key].includes(slug)
        ? current[key].filter((value) => value !== slug)
        : [...current[key], slug];
      const visits = key === "visited" && current.visited.includes(slug)
        ? Object.fromEntries(Object.entries(current.visits).filter(([keySlug]) => keySlug !== slug))
        : current.visits;
      const next = { ...current, [key]: values, visits };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setStorageError(false);
      } catch {
        setStorageError(true);
      }
      return next;
    });
  }, []);

  const persist = useCallback((next: StoredStatus) => {
    setStatus(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, []);

  const updateVisit = useCallback((slug: string, visit: VisitRecord) => {
    setStatus((current) => {
      const next = {
        ...current,
        visited: current.visited.includes(slug) ? current.visited : [...current.visited, slug],
        visits: { ...current.visits, [slug]: validVisitRecord(visit) },
      };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setStorageError(false);
      } catch {
        setStorageError(true);
      }
      return next;
    });
  }, []);

  const obtainStamp = useCallback((slug: string, stamp: StampRecord) => {
    const valid = validStampRecord(stamp);
    if (!valid) return false;
    if (status.stamps[slug]) return true;
    const next = {
      ...status,
      visited: status.visited.includes(slug) ? status.visited : [...status.visited, slug],
      visits: status.visits[slug] ? status.visits : {
        ...status.visits,
        [slug]: { date: localDate(new Date(valid.obtainedAt)), note: "" },
      },
      stamps: { ...status.stamps, [slug]: valid },
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStatus(next);
      setStorageError(false);
      return true;
    } catch {
      setStorageError(true);
      return false;
    }
  }, [status]);

  const obtainTestStamp = useCallback((slug: string) => obtainStamp(slug, {
    obtainedAt: new Date().toISOString(),
    distanceM: 0,
    accuracyM: 0,
    source: "test",
    addedVisit: !status.visited.includes(slug),
  }), [obtainStamp, status.visited]);

  const clearTestStamps = useCallback(() => {
    setStatus((current) => {
      const testEntries = Object.entries(current.stamps).filter(([, stamp]) => stamp.source === "test");
      if (testEntries.length === 0) return current;
      const removableVisits = new Set(testEntries.flatMap(([slug, stamp]) => {
        const visit = current.visits[slug];
        const isUntouchedAutomaticVisit = stamp.addedVisit === true
          && visit?.note === ""
          && visit.date === localDate(new Date(stamp.obtainedAt));
        return isUntouchedAutomaticVisit ? [slug] : [];
      }));
      const next: StoredStatus = {
        ...current,
        stamps: Object.fromEntries(Object.entries(current.stamps).filter(([, stamp]) => stamp.source !== "test")),
        visited: current.visited.filter((slug) => !removableVisits.has(slug)),
        visits: Object.fromEntries(Object.entries(current.visits).filter(([slug]) => !removableVisits.has(slug))),
      };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setStorageError(false);
      } catch {
        setStorageError(true);
        return current;
      }
      return next;
    });
  }, []);

  const setTestMode = useCallback((enabled: boolean) => {
    try {
      window.localStorage.setItem(TEST_MODE_KEY, String(enabled));
      setTestModeState(enabled);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, []);

  const value = useMemo<LighthouseStatusContextValue>(() => ({
    ...status,
    ready,
    storageError,
    testMode,
    toggleFavorite: (slug) => update("favorites", slug),
    toggleVisited: (slug) => update("visited", slug),
    updateVisit,
    obtainStamp,
    obtainTestStamp,
    clearTestStamps,
    setTestMode,
    replaceStatus: persist,
  }), [clearTestStamps, obtainStamp, obtainTestStamp, persist, ready, setTestMode, status, storageError, testMode, update, updateVisit]);

  return <LighthouseStatusContext.Provider value={value}>
    {children}
    {storageError && <p className="storage-error" role="status">このブラウザに記録を保存できませんでした。空き容量やプライベートブラウズ設定をご確認ください。</p>}
  </LighthouseStatusContext.Provider>;
}

export function useLighthouseStatus() {
  return useContext(LighthouseStatusContext);
}

export { STORAGE_KEY, TEST_MODE_KEY };
