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

type HomePageProps = {
  searchParams: Promise<RawSearchParams>;
};

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
              <p className="hero__edition">
                <span>FIELD GUIDE 01</span>
                日本の海辺をめぐる案内帖
              </p>
              <h1>
                海の道しるべを、
                <br />
                次の旅の目的地に。
              </h1>
              <p className="hero__lead">
                日本各地の灯台を、土地の歴史や海の景色とともに。名前や地域から、次に訪れたい一基を探せます。
              </p>
              <a className="hero__link" href="#search-heading">
                灯台を探す
                <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="hero__art">
              <div className="hero__art-header" aria-hidden="true">
                <span>LIGHTHOUSE PLATE</span>
                <span>JP / 01</span>
              </div>
              <LighthouseVisual
                visualId="home-hero"
                size="hero"
                label="海辺に立つ灯台の図版"
              />
              <div className="hero__art-caption">
                <p>海辺に立つ、白い塔。</p>
                <span>Illustrated field note</span>
              </div>
            </div>
          </div>

          <div className="shell hero__facts" aria-label="収録情報">
            <div>
              <strong>16</strong>
              <span>
                <b>のぼれる灯台</b>
                <small>全国の参観灯台を収録</small>
              </span>
            </div>
            <div>
              <strong>全国</strong>
              <span>
                <b>地域から検索</b>
                <small>旅先に合わせて絞り込み</small>
              </span>
            </div>
            <p>歴史・諸元・参観情報を、一つの案内帖に。</p>
          </div>
        </section>

        <section className="search-section" aria-labelledby="search-heading">
          <div className="shell">
            <div className="section-heading section-heading--compact">
              <span className="section-number" aria-hidden="true">01</span>
              <div>
                <p className="kicker">FIND A LIGHTHOUSE</p>
                <h2 id="search-heading">のぼれる灯台を探す</h2>
                <p className="section-heading__lead">灯台名、地域、参観の可否から絞り込めます。</p>
              </div>
            </div>
            <SearchFilterForm />
          </div>
        </section>

        <section className="results-section" aria-labelledby="results-heading">
          <div className="shell">
            <div className="results-toolbar">
              <div className="results-toolbar__heading">
                <span className="section-number" aria-hidden="true">02</span>
                <div>
                  <p className="kicker">LIGHTHOUSE DIRECTORY</p>
                  <h2 id="results-heading">
                    灯台一覧 <span>{result.total}件</span>
                  </h2>
                  {activeConditions.length > 0 && (
                    <p className="active-conditions">条件：{activeConditions.join("・")}</p>
                  )}
                </div>
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
                  {result.items.map((lighthouse, index) => (
                    <LighthouseCard
                      key={lighthouse.id}
                      lighthouse={lighthouse}
                      sequence={(query.page - 1) * PAGE_SIZE + index + 1}
                    />
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
