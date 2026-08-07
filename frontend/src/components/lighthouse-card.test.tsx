import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { lighthouseFixture } from "@/test/fixtures";

import { LighthouseCard } from "./lighthouse-card";

describe("LighthouseCard", () => {
  it("shows the main list information and links to the slug route", () => {
    render(<LighthouseCard lighthouse={lighthouseFixture} sequence={1} />);

    expect(screen.getByRole("heading", { name: "犬吠埼灯台" })).toBeInTheDocument();
    expect(screen.getByText("千葉県 銚子市")).toBeInTheDocument();
    expect(screen.getByText("登れる灯台")).toBeInTheDocument();
    expect(screen.getByText("初点灯 1874年")).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /灯台の記録を見る/ })).toHaveAttribute(
      "href",
      "/lighthouses/inubosaki",
    );
  });
});
