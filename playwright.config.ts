import { defineConfig, devices } from "@playwright/test";
import path from "path";

const PORT = process.env.PORT ?? "3000";
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? `http://localhost:${PORT}`;
const NODE_ENV = process.env.NODE_ENV ?? "testing"
const NEXT_PUBLIC_APP_ENV = process.env.NEXT_PUBLIC_APP_ENV ?? "testing"
const NEXT_PUBLIC_API_URL =process.env.NEXT_PUBLIC_API_URL ?? "https://colloborative-doc-editor-backend.onrender.com/api"
const NEXT_PUBLIC_SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "https://colloborative-doc-editor-backend.onrender.com/"
const NEXT_PUBLIC_MOCK_API_PORT = process.env.NEXT_PUBLIC_MOCK_API_PORT ?? "8001"
const MOCK_API_URL = process.env.MOCK_API_URL ?? NEXT_PUBLIC_API_URL
const IS_E2E_ENV = (NEXT_PUBLIC_APP_ENV ?? "testing") === "testing"

export default defineConfig({
  testDir: "./__tests__/e2e",

  globalSetup: path.resolve(__dirname, "./__tests__/e2e/global.setup.ts"),
  globalTeardown: path.resolve(__dirname, "./__tests__/e2e/global.teardown.ts"),

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,

  reporter: process.env.CI
    ? [
        ["html", { open: "never", outputFolder: "playwright-report" }],
        ["junit", { outputFile: "test-results/junit.xml" }],
        ["github"],
      ]
    : [
        ["html", { open: "on-failure" }],
        ["list"],
      ],

  use: {
    baseURL: BASE_URL,

    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    // {
    //   name: "webkit",
    //   use: {
    //     ...devices["Desktop Safari"],
    //   },
    // },
  ],

  webServer: {
    command: `npm run dev -- -p ${PORT }`,

    url: BASE_URL,

    // Always start a fresh dev server for e2e so API env matches .env.testing.
    reuseExistingServer: !process.env.CI && !IS_E2E_ENV,

    timeout: 60_000,

    env: {
      PORT: PORT,

      NODE_ENV: NODE_ENV,

      NEXT_PUBLIC_APP_ENV: NEXT_PUBLIC_APP_ENV,

      NEXT_PUBLIC_BASE_URL: BASE_URL,

      NEXT_PUBLIC_API_URL,

      NEXT_PUBLIC_SOCKET_URL: NEXT_PUBLIC_SOCKET_URL,

      NEXT_PUBLIC_MOCK_API_PORT: NEXT_PUBLIC_MOCK_API_PORT,

      NEXT_PUBLIC_MOCK_API_URL: NEXT_PUBLIC_API_URL,

      MOCK_API_URL,
    },
  },

  outputDir: "test-results",

  expect: {
    timeout: 10_000,
  },
});