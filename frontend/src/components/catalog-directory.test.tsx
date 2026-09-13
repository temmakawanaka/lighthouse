import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CatalogDirectory } from "./catalog-directory";

const navigation = vi.hoisted(() => ({ query: "", push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigation.query),
  usePathname: () => "/",
  useRouter: () => ({ push: navigation.push, replace: navigation.replace }),
}));
beforeEach(() => { navigation.query = ""; vi.clearAllMocks(); });
afterEach(cleanup);

describe("static directory URL state", () => {
  it("renders the requested filter and a return URL on detail links", () => {
    navigation.query = "q=御前崎&prefecture=静岡県";
    render(<CatalogDirectory />);
    expect(screen.getByRole("heading", { name: "灯台一覧 1件" })).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /灯台の記録を見る/ });
    const url = new URL(link.getAttribute("href")!, "https://example.test");
    const back = new URL(url.searchParams.get("from")!, "https://example.test");
    expect(back.searchParams.get("q")).toBe("御前崎");
    expect(back.searchParams.get("prefecture")).toBe("静岡県");
  });
  it("reconciles results and form values when browser history changes", () => {
    navigation.query = "prefecture=千葉県";
    const { rerender } = render(<CatalogDirectory />);
    expect(screen.getByLabelText("都道府県")).toHaveValue("千葉県");
    navigation.query = "prefecture=静岡県";
    rerender(<CatalogDirectory />);
    expect(screen.getByLabelText("都道府県")).toHaveValue("静岡県");
    expect(screen.getByRole("heading", { name: "御前埼灯台" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "犬吠埼灯台" })).not.toBeInTheDocument();
  });
  it("corrects an out-of-range page without losing filters", async () => {
    navigation.query = "prefecture=静岡県&page=999";
    render(<CatalogDirectory />);
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/?prefecture=%E9%9D%99%E5%B2%A1%E7%9C%8C", { scroll: false }));
    expect(screen.getByRole("heading", { name: "灯台一覧 4件" })).toBeInTheDocument();
  });
  it("handles no results and repeated query parameters consistently with the server", () => {
    navigation.query = "q=存在しない灯台&q=犬吠埼";
    render(<CatalogDirectory />);
    expect(screen.getByRole("heading", { name: "条件に一致する灯台が見つかりませんでした" })).toBeInTheDocument();
  });
});
