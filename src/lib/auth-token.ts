import type { AxiosRequestConfig } from "axios";

/**
 * Shared auth header helpers.
 * Token cookie is set via next/headers after login (httpOnly: false)
 * so TanStack useQuery hooks can attach it on every request.
 */
export function getClientAuthToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function authHeaders(token?: string | null): Record<string, string> {
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
    Cookie: `token=${token}`,
  };
}

export type AuthRequestConfig = Pick<AxiosRequestConfig, "headers">;

/** Axios request config with the auth cookie/token headers attached. */
export function withAuthHeaders(): AuthRequestConfig {
  return {
    headers: authHeaders(getClientAuthToken()),
  };
}

/**
 * Wrap a service call as a TanStack `queryFn` that always sends
 * Cookie `token` + Authorization headers.
 */
export function authedQueryFn<T>(
  fn: (auth: AuthRequestConfig) => Promise<T>
): () => Promise<T> {
  return () => fn(withAuthHeaders());
}
