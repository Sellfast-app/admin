import { NextRequest, NextResponse } from "next/server";

/**
 * Shared helper for all /api/admin/* routes.
 *
 * Every admin endpoint:
 *  1. Requires an admin session cookie (set by /api/admin/auth/login).
 *  2. Forwards the request to the Swiftree backend using ADMIN_API_BASE_URL,
 *     mapping `/api/admin/<path>` -> `<base>/admin/<path>` by default.
 *  3. Normalizes upstream responses to `{ status, message, data }`.
 *
 * Upstream responses must return HTTP 401/403 for unauthorized/forbidden
 * requests; this layer never makes authorization decisions itself.
 */

export const ADMIN_COOKIE = "admin_token";

export interface UpstreamUser {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

export interface LoginResult {
  ok: boolean;
  status: number;
  token?: string;
  user?: UpstreamUser;
  message?: string;
}

export function getApiBaseUrl(): string | null {
  return (
    process.env.ADMIN_API_BASE_URL?.trim().replace(/\/+$/, "") ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "") ||
    null
  );
}

/** True when the request carries a non-empty admin_token cookie. */
export function hasAdminSession(request: NextRequest): boolean {
  return Boolean(request.cookies.get(ADMIN_COOKIE)?.value);
}

/**
 * Forward an authenticated request to the Swiftree backend.
 * Returns null with a 401 JSON response when the admin session is missing.
 */
export async function forwardToUpstream(
  request: NextRequest,
  options: { body?: unknown; timeoutMs?: number } = {}
): Promise<NextResponse> {
  const { body, timeoutMs = 15000 } = options;

  if (!hasAdminSession(request)) {
    return NextResponse.json(
      { status: "error", message: "Admin authentication required", data: null },
      { status: 401 }
    );
  }

  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      {
        status: "error",
        message: "ADMIN_API_BASE_URL is not configured on this deployment",
        data: null,
      },
      { status: 503 }
    );
  }

  // /api/admin/<path> -> <base>/admin/<path>
  const adminPath = request.nextUrl.pathname.replace(/^\/api\/admin\/?/, "");
  const search = request.nextUrl.search;
  const upstreamUrl = `${baseUrl}/admin/${adminPath}${search}`;

  const token = request.cookies.get(ADMIN_COOKIE)!.value;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    const internalSecret = process.env.INTERNAL_SECRET;
    if (internalSecret) {
      headers["X-Internal-Secret"] = internalSecret;
    }

    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body:
        body !== undefined
          ? JSON.stringify(body)
          : request.method !== "GET" && request.method !== "HEAD"
            ? await request.text()
            : undefined,
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    const responseText = await upstreamResponse.text();

    if (!upstreamResponse.ok) {
      let message =
        `Upstream error ${upstreamResponse.status} ${upstreamResponse.statusText}`;
      try {
        const parsed = JSON.parse(responseText);
        message = parsed.message || parsed.error || message;
      } catch {
        if (responseText) message = responseText.slice(0, 300);
      }

      return NextResponse.json(
        { status: "error", message, data: null },
        { status: upstreamResponse.status }
      );
    }

    if (!responseText) {
      return NextResponse.json({ status: "success", message: "OK", data: null });
    }

    try {
      const parsed = JSON.parse(responseText);
      const envelope: Record<string, unknown> = {
        status: parsed.status ?? "success",
        message: parsed.message ?? "OK",
        data: parsed.data ?? parsed,
      };
      // Standard list contract: pass pagination meta through untouched.
      if (parsed.meta !== undefined) envelope.meta = parsed.meta;
      return NextResponse.json(envelope);
    } catch {
      return NextResponse.json({
        status: "success",
        message: "OK",
        data: responseText,
      });
    }
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { status: "error", message: "Upstream request timed out", data: null },
        { status: 504 }
      );
    }

    console.error("[ADMIN_API] upstream failure:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to reach upstream admin API", data: null },
      { status: 502 }
    );
  }
}

/**
 * Exchange admin credentials for a token. Uses /auth/admin/login when the
 * backend exposes it, otherwise falls back to the standard vendor
 * /auth/login contract and requires `data.role` to be an admin role.
 */
export async function loginAdmin(
  email: string,
  password: string
): Promise<LoginResult> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return { ok: false, status: 503, message: "ADMIN_API_BASE_URL is not configured" };
  }

  const attempts: Array<{ url: string; requireAdminRole: boolean }> = [
    { url: `${baseUrl}/auth/admin/login`, requireAdminRole: false },
    { url: `${baseUrl}/auth/login`, requireAdminRole: true },
  ];

  let lastMessage = "Invalid email or password";
  let lastStatus = 401;

  for (const attempt of attempts) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(attempt.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const text = await response.text();

      if (!response.ok) {
        try {
          lastMessage = JSON.parse(text).message || lastMessage;
        } catch {
          /* keep default message */
        }
        lastStatus = response.status;
        continue;
      }

      let parsed: {
        data?: { token?: string; role?: string; user?: UpstreamUser } & Record<string, unknown>;
        message?: string;
      };
      try {
        parsed = JSON.parse(text);
      } catch {
        lastMessage = "Authentication service returned an invalid response";
        lastStatus = 502;
        continue;
      }

      const token = parsed.data?.token;
      if (!token) {
        lastMessage = "Authentication response did not include a token";
        lastStatus = 502;
        continue;
      }

      if (attempt.requireAdminRole) {
        const role = String(parsed.data?.role ?? parsed.data?.user?.role ?? "").toLowerCase();
        if (!role.includes("admin")) {
          lastMessage = "This account does not have admin access";
          lastStatus = 403;
          continue;
        }
      }

      return {
        ok: true,
        status: 200,
        token,
        user: (parsed.data?.user as UpstreamUser) ?? {
          email,
          role: parsed.data?.role ?? "admin",
        },
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        lastMessage = "Authentication service timed out";
        lastStatus = 504;
      } else {
        lastMessage = "Unable to reach authentication service";
        lastStatus = 502;
      }
    }
  }

  return { ok: false, status: lastStatus, message: lastMessage };
}

/**
 * Fetch the profile for the current admin token so the client can verify
 * the session without trusting client-side state.
 */
export async function fetchAdminProfile(
  token: string
): Promise<{ ok: boolean; status: number; user?: UpstreamUser; message?: string }> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return { ok: false, status: 503, message: "ADMIN_API_BASE_URL is not configured" };
  }

  const candidates = [`${baseUrl}/auth/admin/me`, `${baseUrl}/auth/me`];

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!response.ok) continue;

      const parsed = await response.json();
      const user = (parsed.data?.user ?? parsed.data ?? parsed) as UpstreamUser;
      return { ok: true, status: 200, user };
    } catch {
      continue;
    }
  }

  return { ok: false, status: 401, message: "Session is no longer valid" };
}
