import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(process.env.LIGHTHOUSE_STATIC_EXPORT === "true" ? {
    output: "export",
    trailingSlash: true,
    basePath,
  } : {}),
};

export default nextConfig;
