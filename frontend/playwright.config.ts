import { defineConfig, devices } from "@playwright/test";

const host = "127.0.0.1";
const appUrl = `http://${host}:3000`;
const apiUrl = `http://${host}:8000`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["line"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: appUrl,
    locale: "ja-JP",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "tablet",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 820, height: 1180 },
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: "iphone",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
      },
    },
  ],
  webServer: [
    {
      name: "Mock lighthouse API",
      command: "node e2e/mock-api.mjs",
      url: `${apiUrl}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      name: "Next.js frontend",
      command: `npm run build && npm run start -- --hostname ${host} --port 3000`,
      url: appUrl,
      env: {
        ...process.env,
        LIGHTHOUSE_API_BASE_URL: apiUrl,
        NEXT_TELEMETRY_DISABLED: "1",
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
