import type { ReactNode } from "react";

export interface DetailItem {
  label: string;
  value: ReactNode | null | undefined;
}

export function hasVisibleDetailValue(value: ReactNode | null | undefined): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "boolean") return false;
  return value !== null && value !== undefined;
}

interface DetailSectionProps {
  title: string;
  eyebrow: string;
  items: DetailItem[];
}

export function DetailSection({ title, eyebrow, items }: DetailSectionProps) {
  const visibleItems = items.filter((item) => hasVisibleDetailValue(item.value));
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
            <dd>{typeof item.value === "string" ? item.value.trim() : item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
