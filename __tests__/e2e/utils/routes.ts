/**
 * Centralised route constants for E2E tests.
 * Maps 1-to-1 with src/constants/routes.ts so tests never hard-code paths.
 */
export const E2E_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DOCUMENTS: "/documents",
  CREATE_DOCUMENT: "/create-document",
} as const;

export type E2ERoute = (typeof E2E_ROUTES)[keyof typeof E2E_ROUTES];
