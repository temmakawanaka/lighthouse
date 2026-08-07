import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("builds previous and next links while retaining search state", () => {
    render(
      <Pagination
        query={{
          q: "灯台",
          prefecture: "静岡県",
          visitable: true,
          sort: "name",
          page: 2,
        }}
        totalPages={3}
      />,
    );

    expect(screen.getByRole("link", { name: /前へ/ })).toHaveAttribute(
      "href",
      "/?q=%E7%81%AF%E5%8F%B0&prefecture=%E9%9D%99%E5%B2%A1%E7%9C%8C&visitable=true&sort=name",
    );
    expect(screen.getByRole("link", { name: /次へ/ })).toHaveAttribute(
      "href",
      "/?q=%E7%81%AF%E5%8F%B0&prefecture=%E9%9D%99%E5%B2%A1%E7%9C%8C&visitable=true&sort=name&page=3",
    );
  });
});
