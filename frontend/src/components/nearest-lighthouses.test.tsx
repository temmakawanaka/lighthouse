import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NearestLighthouses } from "./nearest-lighthouses";

describe("NearestLighthouses", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows nearby lighthouses after a user requests location", async () => {
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: {
      getCurrentPosition: vi.fn((success) => success({ coords: { latitude: 34.6, longitude: 138.2 } })),
    } });
    render(<NearestLighthouses />);
    fireEvent.click(screen.getByRole("button", { name: "現在地から探す" }));
    expect(await screen.findByText("現在地に近い順で表示しました。")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  it("explains when location permission is denied", async () => {
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: {
      getCurrentPosition: vi.fn((_success, error) => error({ code: 1, PERMISSION_DENIED: 1 })),
    } });
    render(<NearestLighthouses />);
    fireEvent.click(screen.getByRole("button", { name: "現在地から探す" }));
    expect(await screen.findByText(/現在地の利用が許可されませんでした/)).toBeInTheDocument();
  });
});
