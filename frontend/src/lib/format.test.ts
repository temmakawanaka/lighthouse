import { describe, expect, it } from "vitest";

import { formatDate, formatLocation, formatNumber, formatYear, sourceLabel } from "./format";

describe("format helpers", () => {
  it("formats lighthouse dates and years for Japanese users", () => {
    expect(formatDate("1874-11-15")).toBe("1874年11月15日");
    expect(formatYear("1874-11-15", 1874)).toBe("1874年");
    expect(formatYear(null, 1960)).toBe("1960年");
  });

  it("formats values with units and omits missing values", () => {
    expect(formatNumber("31.30", "m")).toBe("31.3m");
    expect(formatNumber(1100000, " cd")).toBe("1,100,000 cd");
    expect(formatNumber(null, "m")).toBeNull();
  });

  it("formats locations and source hosts", () => {
    expect(formatLocation("千葉県", "銚子市")).toBe("千葉県 銚子市");
    expect(formatLocation(null, null)).toBe("所在地情報なし");
    expect(sourceLabel("https://www.kaiho.mlit.go.jp/example", 0)).toBe(
      "kaiho.mlit.go.jp",
    );
  });
});
