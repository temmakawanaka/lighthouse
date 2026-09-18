import { describe, expect, it } from "vitest";
import { catalog } from "./catalog";
import { getLighthouseRegion, LIGHTHOUSE_REGIONS } from "./regions";

describe("lighthouse regions", () => {
  it("assigns every catalog lighthouse to one of eight regions", () => {
    expect(LIGHTHOUSE_REGIONS).toHaveLength(8);
    expect(catalog.map((item) => getLighthouseRegion(item.prefecture))).not.toContain("その他");
  });

  it("uses the expected regional grouping", () => {
    expect(getLighthouseRegion("北海道")).toBe("北海道");
    expect(getLighthouseRegion("静岡県")).toBe("中部");
    expect(getLighthouseRegion("沖縄県")).toBe("九州・沖縄");
  });
});
