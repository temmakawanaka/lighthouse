import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(process.env.LIGHTHOUSE_STATIC_EXPORT === "true" ? {
    output: "export",
    trailingSlash: true,
  } : {}),
};

export default nextConfig;
