/**
 * auth.fixture.ts
 *
 * Extends Playwright's built-in `test` object with two custom fixtures:
 *
 *  • `authenticatedPage` – a browser page that already carries the JWT cookie,
 *    letting tests bypass the login UI entirely.  Used for protected-page tests
 *    where authentication is a precondition, not the subject under test.
 *
 *  • `loginPage` / `registerPage` / `documentsPage` – pre-constructed POMs so
 *    specs never new-up page objects manually.
 *
 * Fixture setup/teardown is automatic; Playwright calls `use()` to hand the
 * fixture value to the test and tears down after the test completes.
 */
import { test as base, BrowserContext, Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { DocumentsPage } from "../pages/DocumentsPage";
import {
  ensureAuthCookieInContext,
  getE2EBaseURL,
} from "../utils/api";
import { TEST_USERS } from "../utils/test-data";

// Shape of our custom fixtures
type AuthFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  documentsPage: DocumentsPage;
  authenticatedPage: Page;
  authenticatedContext: BrowserContext;
};

export const test = base.extend<AuthFixtures>({
  // ---------------------------------------------------------------------------
  // POM fixtures (unauthenticated)
  // ---------------------------------------------------------------------------

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  documentsPage: async ({ page }, use) => {
    await use(new DocumentsPage(page));
  },

  // ---------------------------------------------------------------------------
  // Authenticated context – skips UI login by injecting the JWT cookie via
  // the Playwright storageState / cookies API.
  // ---------------------------------------------------------------------------

  authenticatedContext: async ({ browser }, use) => {
    const baseURL = getE2EBaseURL();
    const context = await browser.newContext({ baseURL });

    await ensureAuthCookieInContext(
      context,
      TEST_USERS.VALID.email,
      TEST_USERS.VALID.password,
      baseURL
    );

    await use(context);
    await context.close();
  },

  authenticatedPage: async ({ authenticatedContext }, use) => {
    const page = await authenticatedContext.newPage();
    await use(page);
    await page.close();
  },
});

export { expect } from "@playwright/test";
