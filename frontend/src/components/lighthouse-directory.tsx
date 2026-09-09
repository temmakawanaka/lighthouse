import { EmptyState } from "./empty-state";
import { LighthouseCard } from "./lighthouse-card";
import { Pagination } from "./pagination";
import { SearchFilterForm } from "./search-filter-form";
import { SearchNavigationProvider } from "./search-navigation-provider";
import { SortSelect } from "./sort-select";
import { PAGE_SIZE } from "@/lib/constants";
import { buildPageHref, type ListQuery } from "@/lib/query-params";
import type { LighthouseListResponse } from "@/types/lighthouse";

export function LighthouseDirectory({ query, result }: { query: ListQuery; result: LighthouseListResponse }) {
  const href = buildPageHref(query, query.page);
  const initialQueryString = href.startsWith("/?") ? href.slice(2) : "";
  const activeConditions = [query.q ? `「${query.q}」` : null, query.prefecture, query.visitable ? "登れる灯台" : null].filter(Boolean);
  return (
    <SearchNavigationProvider key={initialQueryString} initialQueryString={initialQueryString}>
      <main id="main-content" className="directory-page">
        <section className="search-section" aria-labelledby="search-heading">
          <div className="shell">
            <div className="directory-heading">
              <div>
                <p className="kicker">日本の海辺をめぐる案内帖</p>
                <h1 id="search-heading">のぼれる灯台を探す</h1>
                <p>名前や地域から、次に訪れる一基を。</p>
              </div>
              <p className="directory-edition">収録：燈光会「のぼれる灯台16」</p>
            </div>
            <SearchFilterForm />
          </div>
        </section>
        <section className="results-section" aria-labelledby="results-heading">
          <div className="shell">
            <div className="results-toolbar">
              <div className="results-toolbar__heading"><div>
                <h2 id="results-heading">灯台一覧 <span>{result.total}件</span></h2>
                {activeConditions.length > 0 && <p className="active-conditions">条件：{activeConditions.join("・")}</p>}
              </div></div>
              <SortSelect />
            </div>
            <p className="sr-only" aria-live="polite">{result.total}件の灯台が見つかりました。</p>
            {result.items.length === 0 ? <EmptyState /> : <>
              <div className="lighthouse-grid">
                {result.items.map((lighthouse, index) => <LighthouseCard key={lighthouse.id} lighthouse={lighthouse}
                  returnHref={href} sequence={(query.page - 1) * PAGE_SIZE + index + 1} />)}
              </div>
              <Pagination query={query} totalPages={Math.ceil(result.total / PAGE_SIZE)} />
            </>}
          </div>
        </section>
      </main>
    </SearchNavigationProvider>
  );
}
