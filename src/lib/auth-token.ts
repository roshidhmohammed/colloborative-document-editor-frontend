import type { AxiosRequestConfig } from "axios";

/**
 * Shared auth header helpers.
 * Token cookie is set via next/headers after login (httpOnly: false).
 */
export function getClientAuthToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function authHeaders(
  token?: string | null,
  {
    includeCookie = typeof window === "undefined",
  }: { includeCookie?: boolean } = {},
): Record<string, string> {
  if (!token) {
    return {};
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (includeCookie) {
    headers.Cookie = `token=${token}`;
  }

  return headers;
}

export type AuthRequestConfig = Pick<AxiosRequestConfig, "headers">;

export function withAuthHeaders(): AuthRequestConfig {
  return {
    headers: authHeaders(getClientAuthToken()),
  };
}

/**
 * Wrap a service call as a TanStack `queryFn` that always sends
 * Authorization (and relies on same-origin `/api-proxy` for Cookie).
 */
export function authedQueryFn<T>(
  fn: (auth: AuthRequestConfig) => Promise<T>,
): () => Promise<T> {
  return () => fn(withAuthHeaders());
}
