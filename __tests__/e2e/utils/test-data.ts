/**
 * Static test-data fixtures used across all E2E test suites.
 *
 * - VALID credentials match the mock API server's accepted values.
 * - INVALID / ERROR variants exercise error-handling paths.
 * - REGISTER_USER uses a unique e-mail so the mock returns a clean success.
 * - MOCK_DOCUMENTS exposes the pre-seeded document tokens that are baked into
 *   the mock server so collaboration tests can open known document URLs without
 *   going through the creation UI.
 * - COLLAB_USERS are dedicated, disposable accounts used in the real-time
 *   collaboration tests (Viewer / Editor roles).
 *
 * Keep this file the single source of truth – never scatter literal strings
 * inside individual spec files.
 */

export const TEST_USERS = {
  /** Credentials accepted by the mock API → login succeeds → sets JWT cookie */
  VALID: {
    email: "tester1@example.com",
    password: "Tester1123@",
    fullName: "tester1",
  },

  /** Wrong credentials → mock returns 401 */
  INVALID: {
    email: "wrong@example.com",
    password: "wrongpassword",
  },

  /** Triggers a 500 Internal Server Error in the mock */
  ERROR: {
    email: "error@example.com",
    password: "password123",
  },

  /** Used for the registration happy-path spec */
  REGISTER: {
    fullName: "tester4",
    email: "tester4@example.com",
    password: "Tester4123@",
    confirmPassword: "Tester4123@",
  },
} as const;

/** Dedicated accounts for collaboration specs – each opens a separate browser context. */
export const COLLAB_USERS = {
  VIEWER: {
    fullName: "Viewer User",
    email: "viewer@collab-test.com",
    password: "Password1!",
    confirmPassword: "Password1!",
  },
  EDITOR: {
    fullName: "Editor User",
    email: "editor@collab-test.com",
    password: "Password1!",
    confirmPassword: "Password1!",
  },
} as const;

/**
 * Pre-seeded document that exists as soon as the mock server starts.
 * Tokens are kept in sync with `helpers/mockApiServer.ts`.
 */
export const MOCK_DOCUMENTS = {
  EXISTING: {
    id: "mock-doc-123",
    name: "Test Document",
    ownerToken:  "owner-token-abc",
    viewerToken: "viewer-token-xyz",
    editorToken: "editor-token-def",
  },
} as const;

/** Topic strings used in document-creation tests. */
export const TEST_TOPICS = {
  CREATE: "E2E Create Document Test",
} as const;

/** Headings / labels that must appear on each page — kept central so a
 *  future content-change only needs one edit here. */
export const PAGE_CONTENT = {
  LOGIN: {
    heading: "Welcome Back",
    subheading: "Sign in to continue to your workspace.",
    registerLink: "Create Account",
  },
  REGISTER: {
    heading: "Create Account",
    subheading: "Register to continue",
    loginLink: "Login",
  },
  DOCUMENTS: {
    indicatorText: "Your documents",
  },
  CREATE_DOCUMENT: {
    label: "New document",
    heading: "Create your next idea",
    createCardText: "Create new document",
  },
  EDITOR: {
    workspaceLabel: "Document workspace",
  },
} as const;
