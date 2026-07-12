/**
 * RegisterPage – Page Object Model for /register.
 */
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { E2E_ROUTES } from "../utils/routes";

export class RegisterPage extends BasePage {
  // -------------------------------------------------------------------------
  // Locators
  // -------------------------------------------------------------------------
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.fullNameInput = page.locator("input#fullName");
    this.emailInput = page.locator("input#email");
    this.passwordInput = page.locator("input#password");
    this.confirmPasswordInput = page.locator("input#confirmPassword");
    this.submitButton = page.locator("button[type='submit']");
    this.loginLink = page.getByRole("link", { name: "Login" });
    this.heading = page.getByRole("heading", { name: "Create Account" });
  }

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  async goto(): Promise<void> {
    await this.navigate(E2E_ROUTES.REGISTER);
  }

  // -------------------------------------------------------------------------
  // Interactions
  // -------------------------------------------------------------------------

  async fillFullName(name: string): Promise<void> {
    await this.fullNameInput.fill(name);
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async fillConfirmPassword(password: string): Promise<void> {
    await this.confirmPasswordInput.fill(password);
  }

  /** Fill every field and submit in one call. */
  async submitForm(data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<void> {
    await this.fillFullName(data.fullName);
    await this.fillEmail(data.email);
    await this.fillPassword(data.password);
    await this.fillConfirmPassword(data.confirmPassword);
    await this.submitButton.click();
  }

  // -------------------------------------------------------------------------
  // Assertions
  // -------------------------------------------------------------------------

  async expectHeadingVisible(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async expectSubheadingVisible(): Promise<void> {
    await expect(
      this.page.getByText("Register to continue")
    ).toBeVisible();
  }

  async expectSubmitLoading(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
    await expect(this.submitButton).toHaveText("Loading...");
  }
}
