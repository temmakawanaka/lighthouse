import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LighthouseStatusProvider, STORAGE_KEY } from "./lighthouse-status-provider";
import { TripPlanner } from "./trip-planner";
import { TRIP_STORAGE_KEY } from "@/lib/trip-plan";

describe("TripPlanner", () => {
  beforeEach(() => window.localStorage.clear());

  it("creates, orders, and restores a route without a server", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ favorites: ["omaesaki"], visited: [] }));
    render(<LighthouseStatusProvider><TripPlanner /></LighthouseStatusProvider>);

    fireEvent.click(await screen.findByRole("button", { name: "御前埼灯台を旅程に追加" }));
    fireEvent.click(screen.getByRole("button", { name: "犬吠埼灯台を旅程に追加" }));
    const route = await screen.findByRole("link", { name: /Google Mapsでルートを開く/ });
    expect(route).toHaveAttribute("href", expect.stringContaining("travelmode=driving"));

    fireEvent.click(screen.getByRole("button", { name: "犬吠埼灯台を1つ上へ" }));
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem(TRIP_STORAGE_KEY) ?? "{}").stops)
      .toEqual(["inubosaki", "omaesaki"]));
  });
});
