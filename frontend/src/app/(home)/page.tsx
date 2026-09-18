import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getLighthouses } from "@/api/lighthouses";
import { CatalogDirectory } from "@/components/catalog-directory";
import { LighthouseDirectory } from "@/components/lighthouse-directory";
import { searchCatalog } from "@/lib/catalog";
import { usesCatalog } from "@/lib/data-source";
import { PAGE_SIZE } from "@/lib/constants";
import { buildPageHref, parseListQuery, type RawSearchParams } from "@/lib/query-params";
import { siteUrl } from "@/lib/site-path";

type HomePageProps = { searchParams: Promise<RawSearchParams> };

export const metadata: Metadata = { alternates: { canonical: siteUrl("/") } };

export default async function HomePage({ searchParams }: HomePageProps) {
  // Server deployments may select their data source at runtime; exports are fully static.
  if (process.env.LIGHTHOUSE_STATIC_EXPORT !== "true") await connection();
  if (usesCatalog()) {
    const initialQuery = parseListQuery({});
    return (
      <Suspense fallback={<LighthouseDirectory query={initialQuery} result={searchCatalog(initialQuery)} />}>
        <CatalogDirectory />
      </Suspense>
    );
  }
  const query = parseListQuery(await searchParams);
  const result = await getLighthouses(query);
  const lastPage = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  if (query.page > lastPage) redirect(buildPageHref(query, lastPage));
  return <LighthouseDirectory query={query} result={result} />;
}
