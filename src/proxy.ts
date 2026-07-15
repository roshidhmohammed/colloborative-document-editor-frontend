import { NextRequest, NextResponse } from "next/server";

import { isProtectedRoute, PUBLIC_ROUTES } from "@/lib/auth";
import { PAGEROUTES } from "@/constants/apiRoutes";
import { authHeaders } from "@/lib/auth-token";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const protectedRoute = isProtectedRoute(pathname);

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  const token = request.cookies.get("token")?.value;

  let isAuthenticated = false;

  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiBaseUrl}/auth/check-user-auth`, {
      method: "GET",
      headers: {
        ...authHeaders(token),
      },
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      isAuthenticated = data.success;
    }
  } catch (error) {
    isAuthenticated = false;
  }

  /**
   * User is NOT authenticated
   */
  if (!isAuthenticated && protectedRoute) {
    const loginUrl = new URL(PAGEROUTES.LOGIN, request.url);
    const returnTo = `${pathname}${request.nextUrl.search}`;

    loginUrl.searchParams.set("returnTo", returnTo);

    return NextResponse.redirect(loginUrl);
  }

  /**
   * User is authenticated
   */
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL(PAGEROUTES.DOCUMENTS, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/documents/:path*", "/create-document", "/login", "/register"],
};
