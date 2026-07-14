/**
 * Low-level API helpers consumed by fixtures and global setup/teardown.
 *
 * These functions talk directly to the backend API via Node's `axios` so
 * they work in Playwright's Node-based setup/teardown contexts (no browser).
 */
import axios from "axios";
import type { BrowserContext } from "@playwright/test";

const DEFAULT_API_BASE = "https://colloborative-doc-editor-backend.onrender.com/api";

function getApiBase(): string {
  return (
    process.env.MOCK_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_API_BASE
  );
}

export interface ApiUser {
  _id: string;
  fullName: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: ApiUser;
}

export type PlaywrightCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Lax" | "Strict" | "None";
  expires?: number;
};

/** Base URL of the Next.js app under test. */
export function getE2EBaseURL(): string {
  return (
    process.env.BASE_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    "http://localhost:3000"
  );
}

/** True when e2e helpers should talk to a remote (non-localhost) backend. */
export function isRemoteApiBase(apiBase?: string): boolean {
  const resolved = apiBase ?? getApiBase();
  try {
    const hostname = new URL(resolved).hostname;
    return hostname !== "localhost" && hostname !== "127.0.0.1";
  } catch {
    return false;
  }
}

/**
 * Build a Set-Cookie-compatible string from a JWT so fixtures can seed
 * Playwright contexts when the API returns the token in the JSON body
 * instead of a Set-Cookie header.
 */
function cookieFromToken(token: string): string {
  return `token=${token}; Path=/; SameSite=Lax`;
}

/**
 * Extract a JWT from an API login response body.
 * Supports `token`, `data.token`, or nested `data` shapes.
 */
function extractTokenFromBody(body: Record<string, unknown> | undefined): string | null {
  if (!body) return null;

  if (typeof body.token === "string" && body.token) {
    return body.token;
  }

  const data = body.data;
  if (data && typeof data === "object") {
    const nested = data as Record<string, unknown>;
    if (typeof nested.token === "string" && nested.token) {
      return nested.token;
    }
  }

  return null;
}

/**
 * Programmatically log in and return a Set-Cookie-compatible string so
 * fixtures can pre-seed a browser context without going through the UI.
 *
 * Prefers the Set-Cookie header when present; otherwise builds a cookie from
 * the JWT returned in the response body (current remote backend behavior).
 */
export async function loginViaApi(
  email: string,
  password: string
): Promise<{ cookie: string; user: ApiUser }> {
  let res;
  try {
    res = await axios.post(
      `${getApiBase()}/auth/login`,
      { email, password },
      { withCredentials: true }
    );
  } catch (err: any) {
    const status = err.response?.status ?? "unknown";
    const msg = err.response?.data?.message ?? err.message ?? "unknown error";
    throw new Error(`loginViaApi failed [${status}]: ${msg}`);
  }

  const setCookie = res.headers["set-cookie"];
  let cookie = "";
  if (Array.isArray(setCookie)) {
    cookie = setCookie[0] ?? "";
  } else if (typeof setCookie === "string") {
    cookie = setCookie;
  }

  const body = res.data as Record<string, unknown> | undefined;

  if (!cookie) {
    const token = extractTokenFromBody(body);
    if (!token) {
      throw new Error(
        "loginViaApi: login succeeded but no Set-Cookie header or token was returned"
      );
    }
    cookie = cookieFromToken(token);
  }

  // Real backends may wrap the user under `data` (e.g. { success, message, data: { user } })
  // or place it at the top level (e.g. { success, message, user }).
  // Some also return the user fields directly on `data`.
  const rawUser =
    body?.user ??
    (body?.data as { user?: unknown } | undefined)?.user ??
    body?.data ??
    undefined;

  if (!rawUser || typeof rawUser !== "object") {
    throw new Error("loginViaApi: no user in response");
  }

  const userRecord = rawUser as Record<string, unknown>;
  const user: ApiUser = {
    _id: String(userRecord._id ?? userRecord.id ?? ""),
    fullName: String(userRecord.fullName ?? ""),
    email: String(userRecord.email ?? ""),
  };

  return { cookie, user };
}

/**
 * Programmatically register a new user. Errors are silently swallowed so the
 * same account can be used across multiple runs (idempotent in the mock).
 */
export async function registerViaApi(
  email: string,
  password: string,
  fullName: string
): Promise<void> {
  try {
    await axios.post(`${getApiBase()}/auth/`, {
      email,
      password,
      confirmPassword: password,
      fullName,
    });
  } catch (err: any) {
    const status = err.response?.status ?? "unknown";
    // 409 = email already registered — treat as success (idempotent against real backend)
    if (status === 409) return;
    const msg = err.response?.data?.message ?? err.message ?? "unknown";
    throw new Error(`[registerViaApi] ${msg} (${status})`);
  }
}

/**
 * Parse a raw `Set-Cookie` header value into the cookie object format expected
 * by `BrowserContext.addCookies()`.
 *
 * Remote backends (e.g. Render) issue `Secure; SameSite=None` cookies for
 * their own domain. E2E tests run the frontend on localhost, so the JWT is
 * re-homed onto the localhost domain for Next.js middleware to forward.
 */
export function parseCookieForContext(
  setCookieHeader: string,
  options: { baseURL?: string; domain?: string } = {}
): PlaywrightCookie {
  if (!setCookieHeader?.trim()) {
    throw new Error("parseCookieForContext: empty Set-Cookie header");
  }

  const parts = setCookieHeader.split(";").map((part) => part.trim());
  const [nameValue, ...attributes] = parts;

  const eqIdx = nameValue.indexOf("=");
  if (eqIdx === -1) {
    throw new Error(
      `parseCookieForContext: invalid Set-Cookie header: ${setCookieHeader}`
    );
  }

  const name = nameValue.slice(0, eqIdx).trim();
  const value = nameValue.slice(eqIdx + 1).trim();

  let path = "/";
  let httpOnly = false;
  let secure = false;
  let sameSite: "Lax" | "Strict" | "None" = "Lax";
  let expires: number | undefined;

  for (const attribute of attributes) {
    const lower = attribute.toLowerCase();

    if (lower === "httponly") {
      httpOnly = true;
    } else if (lower === "secure") {
      secure = true;
    } else if (lower.startsWith("path=")) {
      path = attribute.slice("path=".length);
    } else if (lower.startsWith("samesite=")) {
      const parsed = attribute.slice("samesite=".length).toLowerCase();
      if (parsed === "none") sameSite = "None";
      else if (parsed === "strict") sameSite = "Strict";
      else sameSite = "Lax";
    } else if (lower.startsWith("expires=")) {
      const timestamp = Date.parse(attribute.slice("expires=".length));
      if (!Number.isNaN(timestamp)) {
        expires = Math.floor(timestamp / 1000);
      }
    }
  }

  let domain = options.domain;
  if (!domain) {
    const baseURL = options.baseURL ?? getE2EBaseURL();
    const { hostname } = new URL(baseURL);
    domain =
      hostname === "localhost" || hostname === "127.0.0.1"
        ? "localhost"
        : hostname;
  }

  // SameSite=None requires Secure; localhost is treated as a secure context.
  if (sameSite === "None") {
    secure = true;
  }

  const cookie: PlaywrightCookie = {
    name,
    value,
    domain,
    path,
    httpOnly,
    secure,
    sameSite,
  };

  if (expires !== undefined) {
    cookie.expires = expires;
  }

  return cookie;
}

/** Build Playwright cookies for both localhost (middleware) and the API host. */
export function buildAuthCookiesForContext(
  setCookieHeader: string,
  baseURL: string = getE2EBaseURL()
): PlaywrightCookie[] {
  const cookies = [parseCookieForContext(setCookieHeader, { baseURL })];

  if (isRemoteApiBase()) {
    const apiHostname = new URL(getApiBase()).hostname;
    cookies.push(
      parseCookieForContext(setCookieHeader, { domain: apiHostname })
    );
  }

  return cookies;
}

/**
 * Seed the auth cookie into a browser context.
 *
 * Required for remote backends: the browser stores the JWT on the API domain
 * after UI login, but Next.js middleware reads cookies from localhost.
 */
export async function ensureAuthCookieInContext(
  context: BrowserContext,
  email: string,
  password: string,
  baseURL: string = getE2EBaseURL()
): Promise<void> {
  const { cookie } = await loginViaApi(email, password);
  await context.addCookies(buildAuthCookiesForContext(cookie, baseURL));
}

/**
 * Verify the API server is reachable. Used in global setup to gate the
 * test run until the server is healthy.
 */
export async function waitForApiReady(
  retries = 20,
  delayMs = 500
): Promise<void> {
  const probePaths = ["/health", "/auth/check-user-auth"];

  for (let i = 0; i < retries; i++) {
    for (const probePath of probePaths) {
      try {
        const res = await axios.get(`${getApiBase()}${probePath}`, {
          validateStatus: () => true,
        });
        if (res.status < 500) return;
      } catch {
        // server not up yet
      }
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }

  throw new Error(
    `API at ${getApiBase()} did not become reachable after ${retries} retries.`
  );
}

/**
 * Reset the Yjs document state for a given document ID. Call this in test
 * beforeEach hooks to ensure a clean editor state for collaboration tests.
 */
export async function resetYdocState(docId: string): Promise<void> {
  await axios
    .post(`${getApiBase()}/_test/reset-ydoc/${docId}`)
    .catch(() => {
      /* ignore if server is not up */
    });
}
