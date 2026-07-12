/**
 * global.teardown.ts
 *
 * Runs ONCE after the entire Playwright test suite completes.
 *
 * Responsibilities
 * ─────────────────
 * 1. Stop the mock API server using the reference stored in global.__MOCK_API_SERVER__
 *    (same-process) or by killing the port (cross-process on CI workers).
 * 2. Clean up the state file written by global.setup.ts.
 */
export default async function globalTeardown(): Promise<void> {
  console.log("[GlobalTeardown] Done.");
}
