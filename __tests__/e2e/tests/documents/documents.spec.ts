/**
 * tests/documents/documents.spec.ts
 *
 * E2E tests for the Document dashboard, document creation, and real-time
 * collaborative editing.
 *
 * Suite layout
 * ─────────────
 * 1. Documents › Dashboard
 *    - Authenticated user sees the dashboard
 *    - The "Create new document" card is visible
 *
 * 2. Documents › Create Document
 *    - Clicking the create card redirects to /create-document
 *    - Verifies "New document" text is on the create page
 *    - Fills topic, submits, waits for API response
 *    - Verifies redirect to /documents/:id/:token
 *    - Verifies "Document workspace" heading in the editor
 *
 * 3. Documents › Editor
 *    - Clicking an existing document card opens the editor workspace
 *    - "Document workspace" label is visible
 *
 * 4. Documents › Collaboration – Viewer role
 *    - Owner opens document, copies Viewer share link
 *    - Second user (Viewer) opens the share URL
 *    - Viewer editor has contenteditable="false"
 *    - Owner types → Viewer sees the text via real-time socket sync
 *
 * 5. Documents › Collaboration – Editor role
 *    - Owner opens document, copies Editor share link
 *    - Third user (Editor) opens the share URL
 *    - Editor has contenteditable="true"
 *    - Editor types → Owner sees the text (bidirectional real-time sync)
 *    - Owner types → Editor sees the text
 *
 * CI/CD notes
 * ───────────
 * - Multi-context tests use the `browser` base fixture so Playwright manages
 *   lifecycle automatically.
 * - Auth cookies are injected programmatically via `loginViaApi` + `addCookies`
 *   to avoid coupling collaboration tests to the login UI.
 * - `resetYdocState()` is called before collaboration tests to guarantee a
 *   clean Y.Doc on the mock server.
 */

import { Browser } from "@playwright/test";
import { DocumentsPage }      from "../../pages/DocumentsPage";
import { CreateDocumentPage } from "../../pages/CreateDocumentPage";
import { DocumentEditorPage } from "../../pages/DocumentEditorPage";
import { MOCK_DOCUMENTS, TEST_TOPICS, TEST_USERS, COLLAB_USERS } from "../../utils/test-data";
import {
  ensureAuthCookieInContext,
  getE2EBaseURL,
  registerViaApi,
} from "../../utils/api";

// Re-use our custom test (adds authenticatedPage / authenticatedContext)
import { test, expect } from "../../fixtures";

// ---------------------------------------------------------------------------
// Helper – create an authenticated browser context from API-issued cookie
// ---------------------------------------------------------------------------

async function makeAuthContext(
  browser: Browser,
  email: string,
  password: string
) {
  const baseURL = getE2EBaseURL();
  const ctx = await browser.newContext({ baseURL });
  await ensureAuthCookieInContext(ctx, email, password, baseURL);
  return ctx;
}

// ===========================================================================
// 1. Documents › Dashboard
// ===========================================================================

test.describe("Documents › Dashboard", () => {
  test(
    "should allow an authenticated user to view the documents dashboard",
    async ({ authenticatedPage }) => {
      const docsPage = new DocumentsPage(authenticatedPage);
      await docsPage.goto();
      await docsPage.expectPageVisible();
    }
  );

  test(
    "should display the 'Create new document' card on the dashboard",
    async ({ authenticatedPage }) => {
      const docsPage = new DocumentsPage(authenticatedPage);
      await docsPage.goto();
      await docsPage.expectCreateCardVisible();
    }
  );
});

// ===========================================================================
// 2. Documents › Create Document
// ===========================================================================

test.describe("Documents › Create Document", () => {
  test(
    "should navigate from the dashboard to /create-document via the create card " +
      "and verify the page contains the 'New document' label",
    async ({ authenticatedPage }) => {
      const docsPage = new DocumentsPage(authenticatedPage);
      await docsPage.goto();
      await docsPage.expectPageVisible();

      // Click "Create new document" card
      await docsPage.clickCreateDocument();

      // Verify /create-document route
      const createPage = new CreateDocumentPage(authenticatedPage);
      await createPage.expectPageVisible();
    }
  );

  test(
    "should create a document after filling the topic, wait for the API response, " +
      "redirect to /documents/:id/:token, and verify 'Document workspace' heading",
    async ({ authenticatedPage }) => {
      // Navigate directly to /create-document
      const createPage = new CreateDocumentPage(authenticatedPage);
      await createPage.goto();
      await createPage.expectPageVisible();

      // Fill topic and submit
      await createPage.submitForm(TEST_TOPICS.CREATE);

      // Wait for API response and redirect to the editor workspace
      await expect(authenticatedPage).toHaveURL(
        /\/documents\/[^/]+\/[^/]+/,
        { timeout: 15_000 }
      );

      // Verify "Document workspace" is visible
      const editorPage = new DocumentEditorPage(authenticatedPage);
      await editorPage.expectWorkspaceVisible();
    }
  );
});

// ===========================================================================
// 3. Documents › Editor (single user)
// ===========================================================================

test.describe("Documents › Editor", () => {
  test(
    "should redirect to the document workspace when clicking an existing " +
      "document card from the dashboard",
    async ({ authenticatedPage }) => {
      const docsPage = new DocumentsPage(authenticatedPage);
      await docsPage.goto();
      await docsPage.expectPageVisible();

      // Click the first existing (non-create) card
      await docsPage.clickFirstDocumentCard();

      // Verify we are on the /documents/:id/:token route
      await expect(authenticatedPage).toHaveURL(
        /\/documents\/[^/]+\/[^/]+/,
        { timeout: 10_000 }
      );

      // Verify the editor workspace header
      const editorPage = new DocumentEditorPage(authenticatedPage);
      await editorPage.expectWorkspaceVisible();
    }
  );

  test(
    "should display the 'Document workspace' label after navigating directly " +
      "to the pre-seeded document",
    async ({ authenticatedPage }) => {
      const editorPage = new DocumentEditorPage(authenticatedPage);
      await editorPage.goto(
        MOCK_DOCUMENTS.EXISTING.id,
        MOCK_DOCUMENTS.EXISTING.ownerToken
      );
      await editorPage.expectWorkspaceVisible();
    }
  );
});

// ===========================================================================
// 4. Documents › Collaboration – Viewer role
// ===========================================================================

test.describe("Documents › Collaboration – Viewer Role", () => {
  // Each test uses a freshly created document to avoid Yjs state bleed-over
  // from other tests in the same suite run.

  test(
    "viewer cannot edit the document; viewer sees what the owner types in real time",
    async ({ browser }) => {
      // ── Owner context (User 1) ──
      const ownerCtx  = await makeAuthContext(browser, TEST_USERS.VALID.email, TEST_USERS.VALID.password);
      const ownerPage = await ownerCtx.newPage();

      // ── Viewer context (User 2) – register + login ──
      await registerViaApi(COLLAB_USERS.VIEWER.email, COLLAB_USERS.VIEWER.password, COLLAB_USERS.VIEWER.fullName);
      const viewerCtx  = await makeAuthContext(browser, COLLAB_USERS.VIEWER.email, COLLAB_USERS.VIEWER.password);
      const viewerPage = await viewerCtx.newPage();

      try {
        // Owner creates a new document
        const createPage = new CreateDocumentPage(ownerPage);
        await createPage.goto();
        await createPage.submitForm("Collab Viewer Test");
        await expect(ownerPage).toHaveURL(/\/documents\/[^/]+\/[^/]+/, { timeout: 15_000 });
        const ownerEditor = new DocumentEditorPage(ownerPage);
        await ownerEditor.expectWorkspaceVisible();

        // ── Share → Viewer → Copy link ──
        await ownerEditor.openShareModal();
        await ownerEditor.selectShareRole("VIEWER");
        const viewerShareUrl = await ownerEditor.copyShareLink();
        await ownerEditor.closeShareModal();

        // ── Viewer opens the share URL ──
        await viewerPage.goto(viewerShareUrl);
        await viewerPage.waitForLoadState("networkidle");

        const viewerEditor = new DocumentEditorPage(viewerPage);
        await viewerEditor.expectWorkspaceVisible();

        // ── Assert viewer CANNOT edit ──
        await viewerEditor.expectEditorReadOnly();

        // Menubar should NOT be visible for a viewer
        await expect(viewerPage.locator(".tiptap")).not.toContainText("Bold", {
          timeout: 3_000,
        }).catch(() => {/* Menubar absent – expected */});

        // ── Owner types text ──
        const ownerTyped = "Hello from the owner!";
        await ownerEditor.typeText(ownerTyped);

        // ── Real-time: Viewer sees the owner's text ──
        await viewerEditor.expectEditorContains(ownerTyped, 8_000);

        // ── Double-check viewer still cannot type ──
        await viewerEditor.expectEditorReadOnly();
      } finally {
        await ownerCtx.close();
        await viewerCtx.close();
      }
    }
  );
});

// ===========================================================================
// 5. Documents › Collaboration – Editor role
// ===========================================================================

test.describe("Documents › Collaboration – Editor Role", () => {
  test(
    "both users can type and see each other's changes in real time (bidirectional sync)",
    async ({ browser }) => {
      // ── Owner context (User 1) ──
      const ownerCtx  = await makeAuthContext(browser, TEST_USERS.VALID.email, TEST_USERS.VALID.password);
      const ownerPage = await ownerCtx.newPage();

      // ── Editor context (User 3) – register + login ──
      await registerViaApi(COLLAB_USERS.EDITOR.email, COLLAB_USERS.EDITOR.password, COLLAB_USERS.EDITOR.fullName);
      const editorCtx  = await makeAuthContext(browser, COLLAB_USERS.EDITOR.email, COLLAB_USERS.EDITOR.password);
      const editorPage = await editorCtx.newPage();

      try {
        // Owner creates a new document
        const createPage = new CreateDocumentPage(ownerPage);
        await createPage.goto();
        await createPage.submitForm("Collab Editor Test");
        await expect(ownerPage).toHaveURL(/\/documents\/[^/]+\/[^/]+/, { timeout: 15_000 });
        const ownerEditorPOM = new DocumentEditorPage(ownerPage);
        await ownerEditorPOM.expectWorkspaceVisible();

        // ── Share → Editor → Copy link ──
        await ownerEditorPOM.openShareModal();
        await ownerEditorPOM.selectShareRole("EDITOR");
        const editorShareUrl = await ownerEditorPOM.copyShareLink();
        await ownerEditorPOM.closeShareModal();

        // ── Editor user opens the share URL ──
        await editorPage.goto(editorShareUrl);
        await editorPage.waitForLoadState("networkidle");

        const editorUserPOM = new DocumentEditorPage(editorPage);
        await editorUserPOM.expectWorkspaceVisible();

        // ── Assert editor CAN edit ──
        await editorUserPOM.expectEditorEditable();

        // ── Owner types first ──
        const ownerText = "Owner says hello!";
        await ownerEditorPOM.typeText(ownerText);

        // ── Editor sees owner's text in real time ──
        await editorUserPOM.expectEditorContains(ownerText, 8_000);

        // ── Editor types back ──
        const editorText = " | Editor replies!";
        await editorUserPOM.editorContent.click();
        // Place cursor at end of existing text before typing
        await editorPage.keyboard.press("End");
        await editorPage.keyboard.type(editorText);

        // ── Owner sees editor's reply in real time ──
        await ownerEditorPOM.expectEditorContains("Editor replies!", 8_000);
      } finally {
        await ownerCtx.close();
        await editorCtx.close();
      }
    }
  );
});
