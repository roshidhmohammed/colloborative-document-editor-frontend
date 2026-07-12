/**
 * tests/auth/register.spec.ts
 *
 * E2E tests for the Registration page (/register).
 *
 * Covers
 * ───────
 * ✓ Fill all fields → wait for API response → success toast is displayed
 */
import { test, expect } from "../../fixtures";
import { RegisterPage } from "../../pages/RegisterPage";
import { TEST_USERS, PAGE_CONTENT } from "../../utils/test-data";
import { assertOnRegisterPage, expectToast } from "../../utils/assertions";
import { E2E_ROUTES } from "../../utils/routes";

test.describe("Auth › Register", () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  // -------------------------------------------------------------------------
  // Happy path – fill all fields, wait for API, assert toast
  // -------------------------------------------------------------------------
  test(
    "should fill all registration fields, wait for the API response, " +
      "and display the success AppToast",
    async ({ page }) => {
      // 1. Verify starting page
      await assertOnRegisterPage(page);

      // Use a unique email per run — the real backend is stateful and rejects
      // duplicate emails with 409, which would prevent the success-toast/redirect flow.
      const uniqueEmail = `tester_${Date.now()}@example.com`;
      const uniqueUser = {
        ...TEST_USERS.REGISTER,
        email: uniqueEmail,
      };

      // 2. Fill the form with valid registration data
      await registerPage.submitForm(uniqueUser);

      // 3. Wait for and verify the success toast (AppToast.success).
      //    Title comes from backend's response.message — only assert visibility.
      await expectToast(
        page,
        undefined,
        undefined
      );

      // 4. After registration, the app redirects to /login
      await expect(page).toHaveURL(new RegExp(E2E_ROUTES.LOGIN), {
        timeout: 10_000,
      });
    }
  );

  // -------------------------------------------------------------------------
  // Page structure verification
  // -------------------------------------------------------------------------
  test("should render all required form fields on the register page", async () => {
    await expect(registerPage.fullNameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
    await expect(registerPage.submitButton).toBeVisible();
    await expect(registerPage.submitButton).toHaveText("Register");
    // Back-to-login link
    await expect(registerPage.loginLink).toBeVisible();
  });
});
