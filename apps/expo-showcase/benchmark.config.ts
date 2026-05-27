import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./benchmarks",
  outputDir: "./benchmark-results",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",
  timeout: 60_000,
  expect: {
    timeout: 10_000
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
