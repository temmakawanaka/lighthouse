import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog";
import photoSources from "./photo-sources.json";

describe("photo sources", () => {
  it("covers every catalog lighthouse with a reusable source and useful alt text", () => {
    expect(Object.keys(photoSources).sort()).toEqual(catalog.map(({ slug }) => slug).sort());
    for (const lighthouse of catalog) {
      const photo = photoSources[lighthouse.slug as keyof typeof photoSources];
      expect(photo.source_url).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(photo.license_url).toMatch(/^https:\/\/creativecommons\.org\//);
      expect(photo.alt.length).toBeGreaterThan(12);
    }
  });
});
