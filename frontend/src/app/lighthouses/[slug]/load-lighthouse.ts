import { notFound } from "next/navigation";
import { cache } from "react";

import { getLighthouseBySlug, LighthouseApiError } from "@/api/lighthouses";

export const loadLighthouse = cache(async (slug: string) => {
  try {
    return await getLighthouseBySlug(slug);
  } catch (error) {
    if (error instanceof LighthouseApiError && error.status === 404) notFound();
    throw error;
  }
});
