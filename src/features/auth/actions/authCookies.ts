"use server";

import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "token";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day — matches backend cookie expiry

export async function setAuthToken(token: string): Promise<void> {
  if (!token) {
    throw new Error("Missing auth token");
  }

  const cookieStore = await cookies();

  // httpOnly: false so client axios can read the cookie and attach it as headers
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
}

export async function clearAuthToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
