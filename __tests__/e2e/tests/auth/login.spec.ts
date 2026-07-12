/**
 * tests/auth/login.spec.ts
 *
 * E2E tests for the Login page (/login).
 *
 * Covers
 * ───────
 * ✓ Successful login → API response waited → redirect to /documents → content verified
 * ✓ "Create Account" link → redirect to /register → register page content verified
 */
import { test, expect } from "../../fixtures";
import { LoginPage } from "../../pages/LoginPage";
import { RegisterPage } from "../../pages/RegisterPage";
import { DocumentsPage } from "../../pages/DocumentsPage";
import { TEST_USERS, PAGE_CONTENT } from "../../utils/test-data";
import {
  assertOnLoginPage,
  assertOnRegisterPage,
  assertOnDocumentsPage,
  expectToast,
} from "../../utils/assertions";
import { E2E_ROUTES } from "../../utils/routes";

import {
  ensureAuthCookieInContext,
  getE2EBaseURL,
  isRemoteApiBase,
  registerViaApi,
} from "../../utils/api";

test.describe("Auth › Login", () => {
  let loginPage: LoginPage;

  test.beforeAll(async () => {
    // Ensure the user exists in the real backend database
    await registerViaApi(
      TEST_USERS.VALID.email,
      TEST_USERS.VALID.password,
      TEST_USERS.VALID.fullName
    );
  });

  test.beforeEach(async ({ page, context }) => {
    // Ensure no leftover auth cookie from a previous test
    await context.clearCookies();
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // -------------------------------------------------------------------------
  // Happy path – fill form, wait for API, verify documents dashboard
  // -------------------------------------------------------------------------
  test(
    "should log in with valid credentials, wait for the API response, " +
      "redirect to /documents, and verify the documents page content",
    async ({ page, context }) => {
      // 1. Verify we are on the login page
      await assertOnLoginPage(page);

      // 2. Fill form and submit
      await loginPage.submitForm(
        TEST_USERS.VALID.email,
        TEST_USERS.VALID.password
      );

      // Remote backends set the JWT on the API domain (Secure; SameSite=None).
      // Also seed a localhost cookie so Next.js middleware can forward it.
      if (isRemoteApiBase()) {
        await ensureAuthCookieInContext(
          context,
          TEST_USERS.VALID.email,
          TEST_USERS.VALID.password,
          getE2EBaseURL()
        );
      }

      // 3. Wait for a success toast (description is hardcoded in LoginForm.tsx).
      //    The title comes from backend's response.message, so we only assert the description.
      await expectToast(page, undefined, "You have successfully logged in.");
      // 4. Verify redirect to /documents and page content
      const documentsPage = new DocumentsPage(page);
      await documentsPage.expectPageVisible();
    }
  );

  // -------------------------------------------------------------------------
  // Navigation – register link
  // -------------------------------------------------------------------------
  test(
    "should navigate to /register when the 'Create Account' link is clicked " +
      "and verify the register page content",
    async ({ page }) => {
      // 1. Verify we start on the login page
      await assertOnLoginPage(page);

      // 2. Click the register link
      await loginPage.clickRegisterLink();

      // 3. Verify we land on the register page with the correct content
      await assertOnRegisterPage(page);

      const registerPage = new RegisterPage(page);
      await registerPage.expectHeadingVisible();
      await registerPage.expectSubheadingVisible();

      // Verify the back-to-login link is present
      await expect(registerPage.loginLink).toBeVisible();
    }
  );
});
