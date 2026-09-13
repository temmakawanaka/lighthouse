import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog";
import photoSources from "./photo-sources.json";

describe("photo sources", () => {
  it("covers every climbable lighthouse and validates every reusable photo source", () => {
    const photographedSlugs = Object.keys(photoSources);
    expect(photographedSlugs).toHaveLength(51);
    for (const lighthouse of catalog.filter(({ is_visitable }) => is_visitable)) {
      expect(photographedSlugs).toContain(lighthouse.slug);
    }
    for (const slug of photographedSlugs) {
      const lighthouse = catalog.find((record) => record.slug === slug);
      expect(lighthouse).toBeDefined();
      const photo = photoSources[slug as keyof typeof photoSources];
      expect(photo.source_url).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      if (photo.license === "Public Domain") {
        expect(photo.license_url).toBe(photo.source_url);
      } else {
        expect(photo.license_url).toMatch(/^https:\/\/creativecommons\.org\//);
      }
      expect(photo.alt.length).toBeGreaterThan(12);
    }
  });
});
