import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="shell error-page">
      <div className="status-panel">
        <span className="status-code">404</span>
        <h1>灯台が見つかりませんでした</h1>
        <p>URLが変わったか、灯台情報が公開されていない可能性があります。</p>
        <Link className="button button--primary" href="/">
          灯台一覧へ戻る
        </Link>
      </div>
    </main>
  );
}
