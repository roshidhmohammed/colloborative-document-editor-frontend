/**
 * tests/auth/authorization.spec.ts
 *
 * E2E tests for middleware-level route protection.
 *
 * Covers
 * ───────
 * ✓ Unauthenticated user visiting /documents is redirected to /login
 * ✓ The redirect URL carries the correct ?returnTo param
 * ✓ Unauthenticated user visiting /create-document is also redirected
 */
import { test, expect } from "../../fixtures";
import { E2E_ROUTES } from "../../utils/routes";
import { assertOnLoginPage } from "../../utils/assertions";

test.describe("Auth › Authorization (Route Protection)", () => {
  test.beforeEach(async ({ context }) => {
    // Guarantee no auth cookie is present for every test in this suite
    await context.clearCookies();
  });

  // -------------------------------------------------------------------------
  // Core guard: /documents requires authentication
  // -------------------------------------------------------------------------
  test(
    "should redirect an unauthenticated user from /documents to /login",
    async ({ page }) => {
      // Navigate to the protected route without any auth cookie
      await page.goto(E2E_ROUTES.DOCUMENTS);
      await page.waitForLoadState("networkidle");

      // The middleware (proxy.ts) should have redirected to /login
      await assertOnLoginPage(page);
    }
  );

  test(
    "should append a ?returnTo=/documents query param on the redirect " +
      "so users return to their intended destination after login",
    async ({ page }) => {
      await page.goto(E2E_ROUTES.DOCUMENTS);
      await page.waitForLoadState("networkidle");

      // URL must match /login?returnTo=%2Fdocuments (or /login?returnTo=/documents)
      await expect(page).toHaveURL(
        new RegExp(`${E2E_ROUTES.LOGIN}.*returnTo`),
        { timeout: 8_000 }
      );

      const url = new URL(page.url());
      expect(url.searchParams.get("returnTo")).toBe(E2E_ROUTES.DOCUMENTS);
    }
  );

  // -------------------------------------------------------------------------
  // Secondary protected route
  // -------------------------------------------------------------------------
  test(
    "should redirect an unauthenticated user from /create-document to /login",
    async ({ page }) => {
      await page.goto(E2E_ROUTES.CREATE_DOCUMENT);
      await page.waitForLoadState("networkidle");

      await assertOnLoginPage(page);
    }
  );

  // -------------------------------------------------------------------------
  // Public routes remain accessible without authentication
  // -------------------------------------------------------------------------
  test(
    "should allow an unauthenticated user to access /login without redirect",
    async ({ page }) => {
      await page.goto(E2E_ROUTES.LOGIN);
      await page.waitForLoadState("networkidle");

      // Must NOT be redirected elsewhere
      await expect(page).toHaveURL(new RegExp(E2E_ROUTES.LOGIN));
    }
  );

  test(
    "should allow an unauthenticated user to access /register without redirect",
    async ({ page }) => {
      await page.goto(E2E_ROUTES.REGISTER);
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveURL(new RegExp(E2E_ROUTES.REGISTER));
    }
  );
});
