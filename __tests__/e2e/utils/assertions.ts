/**
 * Shared assertion helpers.
 *
 * Centralising assertions means a UI text-change only requires editing one
 * file, and specs remain readable high-level descriptions of behaviour.
 */
import { expect, Page, Locator } from "@playwright/test";
import { PAGE_CONTENT } from "./test-data";
import { E2E_ROUTES } from "./routes";

// ---------------------------------------------------------------------------
// Toast (Sonner)
// ---------------------------------------------------------------------------

/**
 * Wait for a Sonner toast to appear and assert its title (and optional
 * description).  Increases the default timeout for slow CI environments.
 */
export async function expectToast(
  page: Page,
  title?: string,
  description?: string,
  timeoutMs = 8000
): Promise<void> {
  const toast = page.locator("[data-sonner-toast]");
  await expect(toast).toBeVisible({ timeout: timeoutMs });
   if (title) {
    await expect(toast).toContainText(title);
  }

  if (description) {
    await expect(toast).toContainText(description);
  }
}


// ---------------------------------------------------------------------------
// Page-content guards
// ---------------------------------------------------------------------------

/** Assert the browser is currently on the Login page. */
export async function assertOnLoginPage(page: Page): Promise<void> {
  await expect(page).toHaveURL(new RegExp(E2E_ROUTES.LOGIN));
  await expect(
    page.getByRole("heading", { name: PAGE_CONTENT.LOGIN.heading })
  ).toBeVisible();
}

/** Assert the browser is currently on the Register page. */
export async function assertOnRegisterPage(page: Page): Promise<void> {
  await expect(page).toHaveURL(new RegExp(E2E_ROUTES.REGISTER));
  await expect(
    page.getByRole("heading", { name: PAGE_CONTENT.REGISTER.heading })
  ).toBeVisible();
}

/** Assert the browser is currently on the Documents dashboard. */
export async function assertOnDocumentsPage(page: Page): Promise<void> {
  await expect(page).toHaveURL(new RegExp(E2E_ROUTES.DOCUMENTS), {
    timeout: 10_000,
  });
}

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

/** Assert a locator shows a red validation error containing the given text. */
export async function assertFieldError(
  locator: Locator,
  expectedText: string
): Promise<void> {
  await expect(locator).toBeVisible();
  await expect(locator).toContainText(expectedText);
}
