import { NextRequest, NextResponse } from "next/server";
import axiosInstance from "@/lib/axios";

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

  const cookieHeader = request.headers.get("cookie");

  let isAuthenticated = false;

  console.log("Cookie Header:", cookieHeader);
  console.log("Request Cookie:", request.cookies.get("token"));

  try {
    const response = await axiosInstance.get(
      "/auth/check-user-auth",
      {
        headers: {
          Cookie: cookieHeader ?? "",
        },
      }
    );

    console.log("Auth Status:", response.status);

    isAuthenticated = response.data.success;
  } catch (error: any) {
    console.error(
      "Auth verification failed:",
      error.response?.status,
      error.message
    );
    isAuthenticated = false;
  }

  if (!isAuthenticated && protectedRoute) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set(
      "returnTo",
      `${pathname}${request.nextUrl.search}`
    );

    return NextResponse.redirect(loginUrl);
  }

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