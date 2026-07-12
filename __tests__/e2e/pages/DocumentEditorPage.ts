/**
 * DocumentEditorPage – Page Object Model for /documents/[id]/[token].
 *
 * Encapsulates all interactions with:
 *   - The document workspace header  ("Document workspace" label)
 *   - The TipTap / ProseMirror rich-text editor
 *   - The Share modal (open → pick role → copy link → close)
 *
 * Real-time collaboration note
 * ────────────────────────────
 * TipTap renders a `<div class="ProseMirror" contenteditable="true|false">`.
 * When the role returned by the API is VIEWER, the editor calls
 * `editor.setEditable(false)` which sets `contenteditable="false"`.
 * Tests verify editability by reading this attribute directly.
 */
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class DocumentEditorPage extends BasePage {
  // -------------------------------------------------------------------------
  // Locators
  // -------------------------------------------------------------------------

  /** "Document workspace" uppercase label in DocumentsEditorHeader.tsx */
  readonly workspaceLabel: Locator;

  /** TipTap ProseMirror div – the actual editable/read-only content area */
  readonly editorContent: Locator;

  /** "Share link" button in DocumentsEditorHeader.tsx */
  readonly shareButton: Locator;

  // Share modal (ShareModal.tsx inside Modal.tsx)

  /** <select> inside the share modal */
  readonly roleSelect: Locator;

  /** "Copy link" button */
  readonly copyLinkButton: Locator;

  /** "Close" button rendered by Modal.tsx */
  readonly closeModalButton: Locator;

  /** Modal container (to assert it is no longer visible after closing) */
  readonly shareModalContainer: Locator;
  readonly shareModal: Locator;

  constructor(page: Page) {
    super(page);
    this.workspaceLabel       = page.getByText("Document workspace", { exact: false });
    this.editorContent        = page.locator(".ProseMirror");
    this.shareButton          = page.getByRole("button", { name: /share link/i });
    this.roleSelect           = page.locator("select");
    this.shareModal = page.getByRole("dialog");
    this.copyLinkButton       = this.shareModal.getByRole("button", {name: /copy link/i,});
    this.closeModalButton     = this.shareModal.getByRole("button", {name: "Close",exact: true});
    this.shareModalContainer  = page.getByRole("heading", { name: /share document/i });
  }

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  /** Navigate directly to a document by its ID and token. */
  async goto(documentId: string, documentToken: string): Promise<void> {
    await this.navigate(`/documents/${documentId}/${documentToken}`);
  }

  // -------------------------------------------------------------------------
  // Assertions
  // -------------------------------------------------------------------------

  async expectWorkspaceVisible(): Promise<void> {
    await expect(this.workspaceLabel).toBeVisible({ timeout: 10_000 });
  }

  async expectEditorEditable(): Promise<void> {
    await expect(this.editorContent).toHaveAttribute("contenteditable", "true", {
      timeout: 10_000,
    });
  }

  async expectEditorReadOnly(): Promise<void> {
    await expect(this.editorContent).toHaveAttribute("contenteditable", "false", {
      timeout: 10_000,
    });
  }

  // -------------------------------------------------------------------------
  // Share modal interactions
  // -------------------------------------------------------------------------

  /** Click "Share link" and wait for the modal to appear. */
  async openShareModal(): Promise<void> {
    await this.shareButton.click();
    await expect(this.shareModalContainer).toBeVisible({ timeout: 8_000 });
  }

  /**
   * Select a role from the Access level dropdown.
   * Values accepted by the real <select>: 'VIEWER' | 'EDITOR'
   */
  async selectShareRole(role: "VIEWER" | "EDITOR"): Promise<void> {
    await this.roleSelect.selectOption(role);
  }

  /**
   * Override the browser clipboard API with a lightweight spy, click
   * "Copy link", then return the captured URL.
   *
   * This avoids clipboard-permission prompts in all browsers and is fully
   * deterministic.
   */
  async copyShareLink(): Promise<string> {
    // Inject spy BEFORE clicking so the async writeText is intercepted
    await this.page.evaluate(() => {
      (window as unknown as Record<string, unknown>).__capturedShareUrl = null;
      navigator.clipboard.writeText = async (text: string) => {
        (window as unknown as Record<string, unknown>).__capturedShareUrl = text;
        return Promise.resolve();
      };
    });

    await this.copyLinkButton.click();
    // Allow the Promise-based writeText to settle
    // await this.page.waitForTimeout(600);
    await expect
  .poll(async () => {
    return await this.page.evaluate(() =>
      (window as unknown as Record<string, unknown>).__capturedShareUrl
    );
  })
  .not.toBeNull();

    const url = await this.page.evaluate(
      () => (window as unknown as Record<string, unknown>).__capturedShareUrl
    );

    if (!url || typeof url !== "string") {
      throw new Error(
        "copyShareLink: no URL was captured — the share link may not have been generated yet."
      );
    }
    return url;
  }

  /** Click "Close" to dismiss the share modal. */
  async closeShareModal(): Promise<void> {
    await this.closeModalButton.click();
    await expect(this.shareModalContainer).not.toBeVisible({ timeout: 5000 });
  }

  // -------------------------------------------------------------------------
  // Editor interactions
  // -------------------------------------------------------------------------

  /** Click into the editor and type the given text. */
  async typeText(text: string): Promise<void> {
    await this.editorContent.click();
    await this.page.keyboard.type(text);
  }

  /** Return the visible text content of the editor. */
  async getEditorText(): Promise<string> {
    return (await this.editorContent.textContent()) ?? "";
  }

  /**
   * Wait until the editor contains the expected text (handles socket delay).
   */
  async expectEditorContains(text: string, timeoutMs = 8_000): Promise<void> {
    await expect(this.editorContent).toContainText(text, { timeout: timeoutMs });
  }
}
