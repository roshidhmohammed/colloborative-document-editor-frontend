/**
 * global.setup.ts
 *
 * Runs ONCE before the entire Playwright test suite (configured via
 * `globalSetup` in playwright.config.ts).
 *
 * Responsibilities
 * ─────────────────
 * 1. Resolve the backend API URL (local mock or remote deployed server).
 * 2. Health-check the backend before handing control back to the runner.
 *
 * CI notes
 * ────────
 * • Set MOCK_API_URL in .env.testing to point at the deployed backend.
 * • stdout output uses the [GlobalSetup] prefix so it is easy to grep in logs.
 */

import { waitForApiReady } from "./utils/api";

export default async function globalSetup(): Promise<void> {
  const localPort = process.env.MOCK_API_PORT ?? 8001;
  const apiUrl =
    process.env.MOCK_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    `https://colloborative-doc-editor-backend.onrender.com/api`;

  process.env.MOCK_API_URL = apiUrl;

  const isRemote =
    !apiUrl.includes("localhost") && !apiUrl.includes("127.0.0.1");

  if (isRemote) {
    console.log(`[GlobalSetup] Using remote backend API at ${apiUrl}`);
    await waitForApiReady(30, 1_000);
    console.log(`[GlobalSetup] Remote backend API is reachable`);
    return;
  }

  console.log(`[GlobalSetup] Using local backend API at ${apiUrl}`);
  await waitForApiReady();
  console.log(`[GlobalSetup] Local backend API is reachable`);
}
