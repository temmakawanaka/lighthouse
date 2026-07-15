import Link from "next/link";

import { buildPageHref, type ListQuery } from "@/lib/query-params";

interface PaginationProps {
  query: ListQuery;
  totalPages: number;
}

export function Pagination({ query, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const previousPage = Math.max(1, query.page - 1);
  const nextPage = Math.min(totalPages, query.page + 1);

  return (
    <nav className="pagination" aria-label="検索結果のページ">
      {query.page > 1 ? (
        <Link className="pagination__link" href={buildPageHref(query, previousPage)}>
          <span aria-hidden="true">←</span> 前へ
        </Link>
      ) : (
        <span className="pagination__link pagination__link--disabled" aria-disabled="true">
          <span aria-hidden="true">←</span> 前へ
        </span>
      )}

      <span className="pagination__status" aria-current="page">
        <strong>{query.page}</strong>
        <span> / {totalPages}ページ</span>
      </span>

      {query.page < totalPages ? (
        <Link className="pagination__link" href={buildPageHref(query, nextPage)}>
          次へ <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span className="pagination__link pagination__link--disabled" aria-disabled="true">
          次へ <span aria-hidden="true">→</span>
        </span>
      )}
    </nav>
  );
}
