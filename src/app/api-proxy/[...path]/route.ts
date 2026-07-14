import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { env } from "@/config/env";
import { authHeaders } from "@/lib/auth-token";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function forwardToBackend(
  request: NextRequest,
  context: RouteContext,
) {
  const apiUrl = env.API_URL?.replace(/\/$/, "");

  if (!apiUrl) {
    return NextResponse.json(
      { message: "API URL is not configured" },
      { status: 500 },
    );
  }

  const { path } = await context.params;
  const targetUrl = `${apiUrl}/${path.join("/")}${request.nextUrl.search}`;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  const accept = request.headers.get("accept");
  if (accept) {
    headers.set("accept", accept);
  }

  // Server-side fetch can set Cookie; browsers cannot.
  for (const [key, value] of Object.entries(
    authHeaders(token, { includeCookie: true }),
  )) {
    headers.set(key, value);
  }

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  const upstream = await fetch(targetUrl, {
    method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const upstreamContentType = upstream.headers.get("content-type");
  if (upstreamContentType) {
    responseHeaders.set("content-type", upstreamContentType);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = forwardToBackend;
export const POST = forwardToBackend;
export const PUT = forwardToBackend;
export const PATCH = forwardToBackend;
export const DELETE = forwardToBackend;
