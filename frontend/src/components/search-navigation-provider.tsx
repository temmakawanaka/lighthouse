"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type SearchParamUpdates = Record<string, string | null>;

interface SearchNavigationContextValue {
  clearSearchParams: () => void;
  isPending: boolean;
  params: URLSearchParams;
  updateSearchParams: (updates: SearchParamUpdates) => void;
}

const SearchNavigationContext = createContext<SearchNavigationContextValue | null>(null);

interface SearchNavigationProviderProps {
  children: ReactNode;
  initialQueryString: string;
}

export function SearchNavigationProvider({
  children,
  initialQueryString,
}: SearchNavigationProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [optimisticQueryString, setOptimisticQueryString] = useState(initialQueryString);
  const latestQueryString = useRef(initialQueryString);
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (params: URLSearchParams) => {
      const queryString = params.toString();
      latestQueryString.current = queryString;
      setOptimisticQueryString(queryString);

      startTransition(() => {
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
      });
    },
    [pathname, router],
  );

  const updateSearchParams = useCallback(
    (updates: SearchParamUpdates) => {
      const params = new URLSearchParams(latestQueryString.current);

      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      params.delete("page");
      navigate(params);
    },
    [navigate],
  );

  const clearSearchParams = useCallback(() => navigate(new URLSearchParams()), [navigate]);
  const params = useMemo(() => new URLSearchParams(optimisticQueryString), [optimisticQueryString]);
  const value = useMemo(
    () => ({ clearSearchParams, isPending, params, updateSearchParams }),
    [clearSearchParams, isPending, params, updateSearchParams],
  );

  return (
    <SearchNavigationContext.Provider value={value}>
      {children}
    </SearchNavigationContext.Provider>
  );
}

export function useSearchNavigation() {
  const context = useContext(SearchNavigationContext);
  if (!context) {
    throw new Error("useSearchNavigation must be used within SearchNavigationProvider");
  }
  return context;
}
