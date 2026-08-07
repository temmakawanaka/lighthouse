import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LighthouseVisual } from "./lighthouse-visual";

describe("LighthouseVisual", () => {
  it("uses unique gradient ids for each visual", () => {
    const view = render(
      <>
        <LighthouseVisual visualId="inubosaki" />
        <LighthouseVisual visualId="kannonzaki" />
      </>,
    );

    const ids = Array.from(view.container.querySelectorAll("linearGradient"), (node) => node.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      "sky-card-inubosaki",
      "sea-card-inubosaki",
      "sky-card-kannonzaki",
      "sea-card-kannonzaki",
    ]);
  });
});
