"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { searchCatalog } from "@/lib/catalog";
import { PAGE_SIZE } from "@/lib/constants";
import { buildPageHref, parseListQuery } from "@/lib/query-params";
import { LighthouseDirectory } from "./lighthouse-directory";

export function CatalogDirectory() {
  const params = useSearchParams();
  const router = useRouter();
  const raw = Object.fromEntries([...params.keys()].map((key) => [key, params.getAll(key)]));
  const requested = parseListQuery(raw);
  const firstResult = searchCatalog(requested);
  const lastPage = Math.max(1, Math.ceil(firstResult.total / PAGE_SIZE));
  const query = { ...requested, page: Math.min(requested.page, lastPage) };
  const result = query.page === requested.page ? firstResult : searchCatalog(query);
  const correctedHref = query.page !== requested.page ? buildPageHref(query, query.page) : null;
  useEffect(() => {
    if (correctedHref) router.replace(correctedHref, { scroll: false });
  }, [correctedHref, router]);
  return <LighthouseDirectory query={query} result={result} />;
}
