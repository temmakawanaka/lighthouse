import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SearchFilterForm } from "./search-filter-form";
import { SearchNavigationProvider } from "./search-navigation-provider";
import { SortSelect } from "./sort-select";

const navigationMock = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: navigationMock.push }),
}));

describe("SearchNavigationProvider", () => {
  beforeEach(() => {
    navigationMock.push.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("preserves every condition during rapid consecutive updates", () => {
    render(
      <SearchNavigationProvider initialQueryString="">
        <SearchFilterForm />
        <SortSelect />
      </SearchNavigationProvider>,
    );

    fireEvent.change(screen.getByLabelText("都道府県"), { target: { value: "千葉県" } });
    fireEvent.click(screen.getByLabelText("登れる灯台のみ"));
    fireEvent.change(screen.getByLabelText("並び替え"), { target: { value: "name" } });

    expect(navigationMock.push).toHaveBeenLastCalledWith(
      "/?prefecture=%E5%8D%83%E8%91%89%E7%9C%8C&visitable=true&sort=name",
    );
  });

  it("keeps existing conditions and resets the page when a filter changes", () => {
    render(
      <SearchNavigationProvider initialQueryString="q=%E7%8A%AC%E5%90%A0%E5%9F%BC&page=3">
        <SearchFilterForm />
      </SearchNavigationProvider>,
    );

    fireEvent.change(screen.getByLabelText("都道府県"), { target: { value: "千葉県" } });

    expect(navigationMock.push).toHaveBeenLastCalledWith(
      "/?q=%E7%8A%AC%E5%90%A0%E5%9F%BC&prefecture=%E5%8D%83%E8%91%89%E7%9C%8C",
    );
  });
});
