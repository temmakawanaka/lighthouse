import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig({
  ...base,
  testDir: "./e2e-static",
  outputDir: "test-results/static",
  webServer: {
    name: "Static lighthouse catalog",
    command: "npm run test:static && npm run preview:static",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
