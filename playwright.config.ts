import { defineConfig, devices } from "@playwright/test";

// Default to the local dev server. Set BASE_URL to smoke-test a live deployment,
// e.g. BASE_URL=https://financial-advise.vercel.app npx playwright test
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
const usingExternal = Boolean(process.env.BASE_URL);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: usingExternal
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
