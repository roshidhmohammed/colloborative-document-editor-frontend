/**
 * LoginPage – Page Object Model for /login.
 *
 * All selectors are derived from real HTML attributes (id, type, role) so
 * they remain resilient to CSS class-name changes.
 */
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { E2E_ROUTES } from "../utils/routes";

export class LoginPage extends BasePage {
  // -------------------------------------------------------------------------
  // Locators
  // -------------------------------------------------------------------------
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly passwordToggleBtn: Locator;
  readonly registerLink: Locator;

  /** Inline validation error under the email FormField */
  readonly emailError: Locator;
  /** Inline validation error under the password FormField */
  readonly passwordError: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator("input#email");
    this.passwordInput = page.locator("input#password");
    this.submitButton = page.locator("button[type='submit']");
    // The eye-toggle sits as a sibling button inside the PasswordInput wrapper
    this.passwordToggleBtn = page.locator("input#password ~ button");
    this.registerLink = page.getByRole("link", { name: "Create Account" });

    // Error paragraphs are rendered by the Input / PasswordInput components
    // as a <p className="… text-red-500"> immediately after the <input>.
    this.emailError = page.locator(
      "div:has(> label[for='email']) p.text-red-500"
    );
    this.passwordError = page.locator(
      "div:has(> label[for='password']) p.text-red-500"
    );
  }

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  /** Go to /login (optionally with a ?returnTo= query param). */
  async goto(returnTo?: string): Promise<void> {
    const path = returnTo
      ? `${E2E_ROUTES.LOGIN}?returnTo=${encodeURIComponent(returnTo)}`
      : E2E_ROUTES.LOGIN;
    await this.navigate(path);
  }

  // -------------------------------------------------------------------------
  // Interactions
  // -------------------------------------------------------------------------

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  /** Fill both fields and click submit in one call. */
  async submitForm( email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
 // Wait for the login API to complete before returning
  }

  /** Click the eye-toggle and return the new input type. */
  async togglePasswordVisibility(): Promise<string | null> {
    await this.passwordToggleBtn.click();
    return this.passwordInput.getAttribute("type");
  }

  /** Navigate to /register via the footer link. */
  async clickRegisterLink(): Promise<void> {
    await this.registerLink.click();
    await this.waitForHydration();
  }

  // -------------------------------------------------------------------------
  // Assertions (page-scoped, composable with global assertions.ts)
  // -------------------------------------------------------------------------

  async expectSubmitLoading(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
    await expect(this.submitButton).toHaveText("Loading...");
  }

  async expectSubmitReady(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
    await expect(this.submitButton).toHaveText("Login");
  }

  async expectEmailError(text: string): Promise<void> {
    await expect(this.emailError).toBeVisible();
    await expect(this.emailError).toContainText(text);
  }

  async expectPasswordError(text: string): Promise<void> {
    await expect(this.passwordError).toBeVisible();
    await expect(this.passwordError).toContainText(text);
  }
}
