/**
 * Shared auth header helpers.
 * Token cookie is set via next/headers after login (httpOnly: false)
 * so the client can read it and attach it on every API request.
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

/** Axios request config with the auth cookie/token headers attached. */
export function withAuthHeaders(): { headers: Record<string, string> } {
  return {
    headers: authHeaders(getClientAuthToken()),
  };
}
