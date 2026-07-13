
import { NextRequest, NextResponse } from "next/server";

import {
  isProtectedRoute,
  PUBLIC_ROUTES,
} from "@/lib/auth";
import { ROUTES } from "@/constants/routes";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const protectedRoute = isProtectedRoute(pathname);

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Get incoming cookie
  const cookieHeader = request.headers.get("cookie");

  let isAuthenticated = false;
  console.log(cookieHeader)
  console.log("Request Cookie:", request.cookies.get("token"));

  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(
      `${apiBaseUrl}/auth/check-user-auth`,
      {
        method: "GET",
        headers: {
          cookie: cookieHeader ?? "",
        },
        cache: "no-store",
      }
    );
    console.log("Auth Status:", response.status)

    if (response.ok) {
      const data = await response.json()
      isAuthenticated = data.success;
    }
  } catch (error) {
    console.error("Auth verification failed:", error);
    isAuthenticated = false;
  }

  /**
   * User is NOT authenticated
   */
  if (!isAuthenticated && protectedRoute) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    const returnTo = `${pathname}${request.nextUrl.search}`;

    loginUrl.searchParams.set("returnTo", returnTo);

    return NextResponse.redirect(loginUrl);
  }

  /**
   * User is authenticated
   */
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(
      new URL(ROUTES.DOCUMENTS, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/documents/:path*",
    "/create-document",
    "/login",
    "/register",
  ],
};
