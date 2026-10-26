import { defineConfig } from "@playwright/test";

const basePath = process.env.SITE_BASE_PATH || "/personal-tracker/";
export default defineConfig({
  testDir: "./browser",
  fullyParallel: false,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:4179${basePath}`,
    trace: "retain-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}
  },
  webServer: {
    command: "npm run preview -- --port 4179 --strictPort",
    cwd: new URL("../", import.meta.url).pathname,
    url: `http://127.0.0.1:4179${basePath}`,
    reuseExistingServer: false
  }
});
