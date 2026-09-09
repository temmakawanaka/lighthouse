import { describe, expect, it } from "vitest";
import { officialVisitUrl, directionsUrl } from "./visit-links";
import { safeReturnHref, parseListQuery } from "./query-params";

describe("visiting and return links", () => {
  it("selects the individual official page", () => {
    expect(officialVisitUrl(["https://www.tokokai.org/tourlight/", "javascript:alert(1)", "https://www.tokokai.org/tourlight/tourlight07/"])).toBe("https://www.tokokai.org/tourlight/tourlight07/");
    expect(officialVisitUrl(["https://www.tokokai.org.evil.test/tourlight/tourlight07/"])).toBeUndefined();
  });
  it("opens directions to the actual coordinates without forcing a travel mode", () => {
    const url = new URL(directionsUrl({ latitude: "34.595833", longitude: "138.225833" }));
    expect(url.pathname).toBe("/maps/dir/");
    expect(url.searchParams.get("destination")).toBe("34.595833,138.225833");
    expect(url.searchParams.has("travelmode")).toBe(false);
  });
  it("restores only allowed list conditions, rejecting external destinations", () => {
    expect(safeReturnHref("/?q=灯台&page=2&admin=true")).toBe("/?q=%E7%81%AF%E5%8F%B0&page=2");
    for (const value of [null, "https://evil.test", "//evil.test", "/lighthouses/a", "javascript:alert(1)"]) expect(safeReturnHref(value)).toBe("/");
  });
  it.each(["2abc", "2.5", "1e3", "9999999999999999999999"])("rejects malformed page %s", (page) => {
    expect(parseListQuery({ page }).page).toBe(1);
  });
});
