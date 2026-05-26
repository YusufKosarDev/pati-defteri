import { defineConfig, devices } from "@playwright/test";

// E2E, varsayılan olarak yerel Vite dev sunucusuna karşı çalışır (uygulama
// .env.local'deki VITE_CONVEX_URL üzerinden Convex bulutuna bağlanır).
// Farklı bir hedef için: PLAYWRIGHT_BASE_URL=https://... npm run e2e
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  // Yalnızca yerel hedefte Vite'ı otomatik başlat.
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:5173",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
