
import { PAGEROUTES } from "@/constants/apiRoutes";

export const PUBLIC_ROUTES = [
  PAGEROUTES.LOGIN,
  PAGEROUTES.REGISTER,
];

export const PROTECTED_ROUTES = [
  PAGEROUTES.DOCUMENTS,
  PAGEROUTES.CREATE_DOCUMENT,
];

export function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function getSafePostLoginRedirect(returnTo?: string) {
  if (!returnTo?.startsWith("/") || returnTo.startsWith("//")) {
    return PAGEROUTES.DOCUMENTS;
  }

  try {
    const baseUrl = new URL("http://localhost");
    const destination = new URL(returnTo, baseUrl);

    if (
      destination.origin !== baseUrl.origin ||
      !isProtectedRoute(destination.pathname)
    ) {
      return PAGEROUTES.DOCUMENTS;
    }

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return PAGEROUTES.DOCUMENTS;
  }
}
