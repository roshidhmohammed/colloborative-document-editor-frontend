/**
 * CreateDocumentPage – Page Object Model for /create-document.
 *
 * CreateDocument.tsx renders:
 *   <p>New document</p>                          ← pageLabel
 *   <h1>Create your next idea</h1>               ← pageHeading
 *   <input type="text" placeholder="…" …>        ← topicInput (react-hook-form, no id attr)
 *   <button type="submit">create</button>         ← submitButton
 */
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { E2E_ROUTES } from "../utils/routes";

export class CreateDocumentPage extends BasePage {
  // -------------------------------------------------------------------------
  // Locators
  // -------------------------------------------------------------------------

  /** "New document" label (uppercase text tag above the heading) */
  readonly pageLabel: Locator;

  /** "Create your next idea" h1 */
  readonly pageHeading: Locator;

  /**
   * The topic input field.
   * CreateDocument.tsx uses `{...register("topic")}` without an explicit `id`,
   * so we target it by placeholder text.
   */
  readonly topicInput: Locator;

  /** Submit button labelled "create" (lowercase in the source) */
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageLabel    = page.getByText(/new document/i, { exact: false });
    this.pageHeading  = page.getByRole("heading", { name: /create your next idea/i });
    this.topicInput   = page.getByPlaceholder(/e\.g\. Product launch plan/i);
    this.submitButton = page.locator("button[type='submit']");
  }

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  async goto(): Promise<void> {
    await this.navigate(E2E_ROUTES.CREATE_DOCUMENT);
  }

  // -------------------------------------------------------------------------
  // Interactions
  // -------------------------------------------------------------------------

  async fillTopic(topic: string): Promise<void> {
    await this.topicInput.fill(topic);
  }

  async clickCreate(): Promise<void> {
    await this.submitButton.click();
  }

  /** Fill the topic field and click create in one call. */
  async submitForm(topic: string): Promise<void> {
    await this.fillTopic(topic);
    await this.clickCreate();
  }

  // -------------------------------------------------------------------------
  // Assertions
  // -------------------------------------------------------------------------

  async expectPageVisible(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(E2E_ROUTES.CREATE_DOCUMENT), {
      timeout: 8_000,
    });
    await expect(this.pageLabel).toBeVisible({ timeout: 8_000 });
    await expect(this.pageHeading).toBeVisible({ timeout: 8_000 });
  }

  async expectSubmitLoading(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }
}
