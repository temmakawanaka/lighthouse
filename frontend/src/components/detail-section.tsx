import type { ReactNode } from "react";

export interface DetailItem {
  label: string;
  value: ReactNode | null | undefined;
}

interface DetailSectionProps {
  title: string;
  eyebrow: string;
  items: DetailItem[];
}

export function DetailSection({ title, eyebrow, items }: DetailSectionProps) {
  const visibleItems = items.filter((item) => item.value !== null && item.value !== undefined);
  if (visibleItems.length === 0) return null;

  return (
    <section className="detail-section">
      <div className="detail-section__heading">
        <p className="kicker">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <dl className="detail-list">
        {visibleItems.map((item) => (
          <div className="detail-list__row" key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
