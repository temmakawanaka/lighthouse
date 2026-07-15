export default function LighthouseDetailLoading() {
  return (
    <main id="main-content" className="detail-page shell" aria-label="灯台の詳細を読み込み中">
      <div className="skeleton skeleton--back" />
      <div className="detail-hero">
        <div className="skeleton skeleton--detail-image" />
        <div>
          <div className="skeleton skeleton--line-short" />
          <div className="skeleton skeleton--detail-title" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line" />
        </div>
      </div>
    </main>
  );
}
