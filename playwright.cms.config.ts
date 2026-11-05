import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/cms",
  outputDir: "test-results-cms",
  use: { baseURL: "http://localhost:5174", channel: "chrome" },
  webServer: {
    command:
      "VITE_CONTENT_SOURCE=sanity VITE_SANITY_PROJECT_ID=localtest VITE_SANITY_DATASET=production npm run dev -- --port 5174",
    url: "http://localhost:5174",
    reuseExistingServer: false,
  },
  reporter: "list",
});
