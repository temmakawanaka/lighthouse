import { EmptyState } from "./empty-state";
import { LighthouseCard } from "./lighthouse-card";
import { Pagination } from "./pagination";
import { SearchFilterForm } from "./search-filter-form";
import { SearchNavigationProvider } from "./search-navigation-provider";
import { SortSelect } from "./sort-select";
import { PAGE_SIZE } from "@/lib/constants";
import { catalog } from "@/lib/catalog";
import { buildPageHref, type ListQuery } from "@/lib/query-params";
import type { LighthouseListResponse } from "@/types/lighthouse";
import Link from "next/link";

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
                <p className="kicker">GPS LIGHTHOUSE RALLY</p>
                <h1 id="search-heading">灯台を訪ね、スタンプを集める</h1>
                <p>地図で見つけて、現地でチェックイン。海辺の旅を自分だけのコレクションに。</p>
              </div>
              <p className="directory-edition">収録 {catalog.length}基｜のぼれる灯台16＋日本の灯台50選</p>
            </div>
            <div className="rally-shortcuts"><Link className="rally-shortcuts__primary" href="/map/"><strong>GPSマップを開く</strong><span>現在地と灯台ピンを見る →</span></Link><Link href="/stamps/"><strong>スタンプ帳</strong><span>獲得状況を見る →</span></Link></div>
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
