import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./visual",
  outputDir: "./test-results",
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      threshold: 0.2
    }
  },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:6007",
    colorScheme: "light",
    deviceScaleFactor: 1,
    locale: "en-US",
    screenshot: "only-on-failure",
    viewport: {
      width: 960,
      height: 960
    }
  },
  webServer: {
    command: "node ../../scripts/serve-static.mjs dist 6007",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: "http://127.0.0.1:6007"
  }
});
