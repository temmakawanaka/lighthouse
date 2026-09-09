"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "lighthouse-field-guide:user-state:v1";

interface StoredStatus {
  version?: 1;
  favorites: string[];
  visited: string[];
}
type StatusListKey = "favorites" | "visited";

interface LighthouseStatusContextValue extends StoredStatus {
  ready: boolean;
  toggleFavorite: (slug: string) => void;
  toggleVisited: (slug: string) => void;
}

const emptyStatus: StoredStatus = { version: 1, favorites: [], visited: [] };
const LighthouseStatusContext = createContext<LighthouseStatusContextValue>({
  ...emptyStatus,
  ready: false,
  toggleFavorite: () => undefined,
  toggleVisited: () => undefined,
});

function parseStoredStatus(value: string | null): StoredStatus {
  if (!value) return emptyStatus;
  try {
    const parsed = JSON.parse(value) as Partial<StoredStatus>;
    const strings = (items: unknown) => Array.isArray(items)
      ? [...new Set(items.filter((item): item is string => typeof item === "string" && item.length <= 80))]
      : [];
    return { version: 1, favorites: strings(parsed.favorites).slice(0, 250), visited: strings(parsed.visited).slice(0, 250) };
  } catch {
    return emptyStatus;
  }
}

export function LighthouseStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<StoredStatus>(emptyStatus);
  const [ready, setReady] = useState(false);

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
      const next = { ...current, [key]: values };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Keep the current-tab state usable when storage is unavailable or full.
      }
      return next;
    });
  }, []);

  const value = useMemo<LighthouseStatusContextValue>(() => ({
    ...status,
    ready,
    toggleFavorite: (slug) => update("favorites", slug),
    toggleVisited: (slug) => update("visited", slug),
  }), [ready, status, update]);

  return <LighthouseStatusContext.Provider value={value}>{children}</LighthouseStatusContext.Provider>;
}

export function useLighthouseStatus() {
  return useContext(LighthouseStatusContext);
}

export { parseStoredStatus, STORAGE_KEY };
