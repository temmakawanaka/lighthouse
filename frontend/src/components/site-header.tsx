import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link className="brand" href="/" aria-label="灯台アプリ トップへ">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" focusable="false">
              <path d="M12 27h8l-1.5-14h-5L12 27Z" fill="currentColor" />
              <path d="M10.5 10h11v4h-11zM8 8.5 16 4l8 4.5H8Z" fill="currentColor" />
              <path d="M7 28h18" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <span>
            <strong>灯台アプリ</strong>
            <small>日本の海辺をめぐる案内帖</small>
          </span>
        </Link>
        <nav aria-label="メインナビゲーション">
          <Link className="header-link" href="/#search-heading">
            灯台を探す
            <span aria-hidden="true">↓</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
