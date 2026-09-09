"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "lighthouse-field-guide:user-state:v1";

export interface VisitRecord {
  date: string;
  note: string;
}

export interface StoredStatus {
  version: 2;
  favorites: string[];
  visited: string[];
  visits: Record<string, VisitRecord>;
}
type StatusListKey = "favorites" | "visited";

interface LighthouseStatusContextValue extends StoredStatus {
  ready: boolean;
  storageError: boolean;
  toggleFavorite: (slug: string) => void;
  toggleVisited: (slug: string) => void;
  updateVisit: (slug: string, visit: VisitRecord) => void;
  replaceStatus: (status: StoredStatus) => void;
}

const emptyStatus: StoredStatus = { version: 2, favorites: [], visited: [], visits: {} };
const LighthouseStatusContext = createContext<LighthouseStatusContextValue>({
  ...emptyStatus,
  ready: false,
  storageError: false,
  toggleFavorite: () => undefined,
  toggleVisited: () => undefined,
  updateVisit: () => undefined,
  replaceStatus: () => undefined,
});

function validVisitRecord(value: unknown): VisitRecord {
  const record = value && typeof value === "object" ? value as Partial<VisitRecord> : {};
  return {
    date: typeof record.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(record.date) ? record.date : "",
    note: typeof record.note === "string" ? record.note.slice(0, 500) : "",
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
    const visited = strings(parsed.visited).slice(0, 250);
    const sourceVisits = parsed.visits && typeof parsed.visits === "object" ? parsed.visits : {};
    const visits = Object.fromEntries(visited.map((slug) => [slug, validVisitRecord(sourceVisits[slug])]));
    return { version: 2, favorites, visited, visits };
  } catch {
    return emptyStatus;
  }
}

export function LighthouseStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<StoredStatus>(emptyStatus);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        setStatus(parseStoredStatus(window.localStorage.getItem(STORAGE_KEY)));
      } catch {
        setStatus(emptyStatus);
      }
      setReady(true);
    });
    const synchronize = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setStatus(parseStoredStatus(event.newValue));
    };
    window.addEventListener("storage", synchronize);
    return () => {
      active = false;
      window.removeEventListener("storage", synchronize);
    };
  }, []);

  const update = useCallback((key: StatusListKey, slug: string) => {
    setStatus((current) => {
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

  const value = useMemo<LighthouseStatusContextValue>(() => ({
    ...status,
    ready,
    storageError,
    toggleFavorite: (slug) => update("favorites", slug),
    toggleVisited: (slug) => update("visited", slug),
    updateVisit,
    replaceStatus: persist,
  }), [persist, ready, status, storageError, update, updateVisit]);

  return <LighthouseStatusContext.Provider value={value}>
    {children}
    {storageError && <p className="storage-error" role="status">このブラウザに記録を保存できませんでした。空き容量やプライベートブラウズ設定をご確認ください。</p>}
  </LighthouseStatusContext.Provider>;
}

export function useLighthouseStatus() {
  return useContext(LighthouseStatusContext);
}

export { STORAGE_KEY };
