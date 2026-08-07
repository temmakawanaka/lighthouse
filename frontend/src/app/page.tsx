import { redirect } from "next/navigation";

import { getLighthouses } from "@/api/lighthouses";
import { EmptyState } from "@/components/empty-state";
import { LighthouseCard } from "@/components/lighthouse-card";
import { LighthouseVisual } from "@/components/lighthouse-visual";
import { Pagination } from "@/components/pagination";
import { SearchFilterForm } from "@/components/search-filter-form";
import { SearchNavigationProvider } from "@/components/search-navigation-provider";
import { SortSelect } from "@/components/sort-select";
import { PAGE_SIZE } from "@/lib/constants";
import { buildPageHref, parseListQuery, type RawSearchParams } from "@/lib/query-params";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<RawSearchParams>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const query = parseListQuery(await searchParams);
  const result = await getLighthouses(query);
  const totalPages = Math.ceil(result.total / PAGE_SIZE);

  if (totalPages > 0 && query.page > totalPages) {
    redirect(buildPageHref(query, totalPages));
  }

  const activeConditions = [
    query.q ? `「${query.q}」` : null,
    query.prefecture || null,
    query.visitable ? "登れる灯台" : null,
  ].filter(Boolean);
  const initialHref = buildPageHref(query, query.page);
  const initialQueryString = initialHref.startsWith("/?") ? initialHref.slice(2) : "";

  return (
    <SearchNavigationProvider key={initialQueryString} initialQueryString={initialQueryString}>
      <main id="main-content">
      <section className="hero">
        <div className="shell hero__inner">
          <div className="hero__copy">
            <p className="kicker">LIGHTHOUSE JOURNEY</p>
            <h1>
              海の道しるべを、
              <br />
              次の旅の目的地に。
            </h1>
            <p className="hero__lead">
              日本各地の参観できる灯台から、歴史や景色に触れられる一基を探せます。
            </p>
            <div className="hero__facts" aria-label="収録情報">
              <span>
                <strong>16</strong> のぼれる灯台
              </span>
              <span>
                <strong>全国</strong> 地域から検索
              </span>
            </div>
          </div>
          <div className="hero__art">
            <LighthouseVisual
              visualId="home-hero"
              size="hero"
              label="海辺に立つ灯台のイラスト"
            />
            <div className="hero__note">
              <span aria-hidden="true">✦</span>
              <p>
                <small>FEATURED</small>
                歴史と景色を楽しむ灯台めぐり
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="search-section" aria-labelledby="search-heading">
        <div className="shell">
          <div className="section-heading section-heading--compact">
            <p className="kicker">FIND A LIGHTHOUSE</p>
            <h2 id="search-heading">のぼれる灯台を探す</h2>
          </div>
          <SearchFilterForm />
        </div>
      </section>

      <section className="results-section" aria-labelledby="results-heading">
        <div className="shell">
          <div className="results-toolbar">
            <div>
              <p className="kicker">SEARCH RESULTS</p>
              <h2 id="results-heading">
                灯台一覧 <span>{result.total}件</span>
              </h2>
              {activeConditions.length > 0 && (
                <p className="active-conditions">条件：{activeConditions.join("・")}</p>
              )}
            </div>
            <SortSelect />
          </div>

          <p className="sr-only" aria-live="polite">
            {result.total}件の灯台が見つかりました。
          </p>

          {result.items.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="lighthouse-grid">
                {result.items.map((lighthouse) => (
                  <LighthouseCard key={lighthouse.id} lighthouse={lighthouse} />
                ))}
              </div>
              <Pagination query={query} totalPages={totalPages} />
            </>
          )}
        </div>
      </section>
      </main>
    </SearchNavigationProvider>
  );
}
