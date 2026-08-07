export default function HomeLoading() {
  return (
    <main id="main-content">
      <div className="loading-hero" aria-hidden="true" />
      <section className="results-section shell" aria-label="灯台情報を読み込み中">
        <div className="skeleton skeleton--heading" />
        <div className="lighthouse-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="skeleton-card" key={index} aria-hidden="true">
              <div className="skeleton skeleton--image" />
              <div className="skeleton-card__body">
                <div className="skeleton skeleton--line-short" />
                <div className="skeleton skeleton--title" />
                <div className="skeleton skeleton--line" />
                <div className="skeleton skeleton--line" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
