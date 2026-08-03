import { defineConfig, devices } from "@playwright/test";

// Smoke tests against a running `next dev`/`next start` instance. Requires
// a reachable Supabase project (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY) with
// the migrations + seed applied — see docs/GUIDE_ADMINISTRATEUR.md.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
