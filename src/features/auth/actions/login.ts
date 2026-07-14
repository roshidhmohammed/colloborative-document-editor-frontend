"use server";

import { env } from "@/config/env";
import { API_ENDPOINTS } from "@/constants/api";

import type { LoginRequest, LoginResponse, User } from "../types/auth";
import { setAuthToken } from "./authCookies";

function extractToken(
  setCookieHeader: string | null,
  body: Record<string, unknown>
): string | null {
  if (typeof body.token === "string" && body.token) {
    return body.token;
  }

  const data = body.data;
  if (
    data &&
    typeof data === "object" &&
    typeof (data as { token?: unknown }).token === "string"
  ) {
    return (data as { token: string }).token;
  }

  if (!setCookieHeader) {
    return null;
  }

  const match = /(?:^|,)\s*token=([^;,\s]+)/i.exec(setCookieHeader);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function extractUser(body: Record<string, unknown>): User {
  const raw =
    (body.user as Record<string, unknown> | undefined) ??
    (body.data as Record<string, unknown> | undefined);

  if (!raw) {
    throw new Error("Login succeeded but no user was returned");
  }

  return {
    _id: String(raw._id ?? raw.id ?? ""),
    fullName: String(raw.fullName ?? ""),
    email: String(raw.email ?? ""),
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
  };
}

/**
 * Logs in against the API, then stores the JWT on this app's domain
 * via `cookies()` from `next/headers` so `proxy.ts` can read it.
 */
export async function loginAction(
  payload: LoginRequest
): Promise<LoginResponse> {
  const apiUrl = env.API_URL;

  if (!apiUrl) {
    throw new Error("API URL is not configured");
  }

  const response = await fetch(`${apiUrl}${API_ENDPOINTS.LOGIN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const body = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    const message =
      typeof body.message === "string"
        ? body.message
        : "An error occurred during login.";

    throw new Error(message);
  }

  const token = extractToken(response.headers.get("set-cookie"), body);

  if (!token) {
    throw new Error("Login succeeded but no auth token was returned");
  }

  await setAuthToken(token);

  return {
    success: Boolean(body.success),
    message:
      typeof body.message === "string" ? body.message : "Login successful",
    user: extractUser(body),
    token,
  };
}
