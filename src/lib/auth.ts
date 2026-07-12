
import { ROUTES } from "@/constants/routes";

export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
];

export const PROTECTED_ROUTES = [
  ROUTES.DOCUMENTS,
  ROUTES.CREATE_DOCUMENT,
];

export function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function getSafePostLoginRedirect(returnTo?: string) {
  if (!returnTo?.startsWith("/") || returnTo.startsWith("//")) {
    return ROUTES.DOCUMENTS;
  }

  try {
    const baseUrl = new URL("http://localhost");
    const destination = new URL(returnTo, baseUrl);

    if (
      destination.origin !== baseUrl.origin ||
      !isProtectedRoute(destination.pathname)
    ) {
      return ROUTES.DOCUMENTS;
    }

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return ROUTES.DOCUMENTS;
  }
}
