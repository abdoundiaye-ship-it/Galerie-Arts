import { defineConfig } from "vitest/config";
import path from "node:path";

// Separate config from vitest.config.ts: these are integration tests that
// need a real (local) Supabase instance and the Node environment, not
// jsdom + the React plugin used for component/unit tests.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/rls/**/*.test.ts"],
    testTimeout: 20_000,
    globals: true,
  },
});
