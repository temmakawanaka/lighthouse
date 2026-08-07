import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DetailSection } from "./detail-section";

describe("DetailSection", () => {
  it("shows only rows that have values", () => {
    render(
      <DetailSection
        title="歴史・基本情報"
        eyebrow="HISTORY"
        items={[
          { label: "建設年", value: "1874年" },
          { label: "レンズ", value: null },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "歴史・基本情報" })).toBeInTheDocument();
    expect(screen.getByText("建設年")).toBeInTheDocument();
    expect(screen.queryByText("レンズ")).not.toBeInTheDocument();
  });

  it("does not render an empty section", () => {
    const view = render(
      <DetailSection
        title="灯台の諸元"
        eyebrow="SPECIFICATIONS"
        items={[{ label: "灯質", value: null }]}
      />,
    );

    expect(view.container).toBeEmptyDOMElement();
  });

  it.each([null, undefined, "", "   "])("hides an empty value: %p", (value) => {
    const view = render(
      <DetailSection
        title="歴史・基本情報"
        eyebrow="HISTORY"
        items={[{ label: "管理者", value }]}
      />,
    );

    expect(view.container).toBeEmptyDOMElement();
  });

  it("trims a displayed string value", () => {
    render(
      <DetailSection
        title="歴史・基本情報"
        eyebrow="HISTORY"
        items={[{ label: "管理者", value: "  海上保安庁  " }]}
      />,
    );

    expect(screen.getByText("海上保安庁")).toBeInTheDocument();
  });
});
