/**
 * DocumentsPage – Page Object Model for /documents.
 *
 * Covers:
 *   - Dashboard heading assertion
 *   - Locating and clicking the "Create new document" card
 *   - Locating and clicking an existing document card by name (or first found)
 */
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { E2E_ROUTES } from "../utils/routes";

export class DocumentsPage extends BasePage {
  // -------------------------------------------------------------------------
  // Locators
  // -------------------------------------------------------------------------

  /** <h1>Your documents</h1> rendered by DocumentsHeader.tsx */
  readonly pageHeading: Locator;

  /** The "Create new document" card link  */
  readonly createDocumentCard: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole("heading", { name: /your documents/i });
    // CreateDocumentCard.tsx renders an <h2>Create new document</h2> inside a <Link>
    this.createDocumentCard = page.getByRole("link", {
      name: /create new document/i,
    });
  }

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  async goto(): Promise<void> {
    await this.navigate(E2E_ROUTES.DOCUMENTS);
  }

  // -------------------------------------------------------------------------
  // Interactions
  // -------------------------------------------------------------------------

  /** Click the "Create new document" card and wait for navigation. */
  async clickCreateDocument(): Promise<void> {
    await this.createDocumentCard.click();
    await this.waitForHydration();
  }

  /**
   * Click the first existing document card (i.e. a card that is NOT the
   * "Create new document" card).  Waits for the document list to be loaded
   * before clicking.
   */
  async clickFirstDocumentCard(): Promise<void> {
    // DocumentCard is rendered as <article> inside a <Link>
    const firstCard = this.page
      .locator("a:has(article)")
      .first();
    await firstCard.waitFor({ state: "visible", timeout: 10_000 });
    await firstCard.click();
    await this.waitForHydration();
  }

  /**
   * Click a document card that contains the given name text.
   */
  async clickDocumentCardByName(name: string): Promise<void> {
    const card = this.page.locator("a:has(article)").filter({ hasText: name });
    await card.waitFor({ state: "visible", timeout: 10_000 });
    await card.click();
    await this.waitForHydration();
  }

  // -------------------------------------------------------------------------
  // Assertions
  // -------------------------------------------------------------------------

  /** Assert the Documents dashboard is fully rendered. */
  async expectPageVisible(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(E2E_ROUTES.DOCUMENTS), {
      timeout: 10_000,
    });
    await expect(this.pageHeading).toBeVisible({ timeout: 10_000 });
  }

  async expectCreateCardVisible(): Promise<void> {
    await expect(this.createDocumentCard).toBeVisible({ timeout: 10_000 });
  }
}
