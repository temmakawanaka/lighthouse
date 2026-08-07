import Link from "next/link";

export function EmptyState() {
  return (
    <div className="status-panel">
      <span className="status-panel__icon" aria-hidden="true">
        <svg viewBox="0 0 48 48">
          <path d="M18 39h12l-2.5-24h-7L18 39Z" />
          <path d="M16 12h16v5H16zM14 10l10-6 10 6H14Z" />
        </svg>
      </span>
      <h2>条件に一致する灯台が見つかりませんでした</h2>
      <p>キーワードや地域を変えて、もう一度探してみてください。</p>
      <Link className="button button--primary" href="/">
        条件をクリア
      </Link>
    </div>
  );
}
