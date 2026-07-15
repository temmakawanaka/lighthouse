"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main-content" className="shell error-page">
      <div className="status-panel status-panel--error">
        <span className="status-panel__icon" aria-hidden="true">
          !
        </span>
        <h1>灯台情報を読み込めませんでした</h1>
        <p>通信状況をご確認のうえ、少し時間を置いてもう一度お試しください。</p>
        <button className="button button--primary" type="button" onClick={reset}>
          再試行する
        </button>
      </div>
    </main>
  );
}
