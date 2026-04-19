import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:8082",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm.cmd --workspace @pmhc/mobile run web -- --port 8082",
    url: "http://127.0.0.1:8082",
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      CI: "1",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
