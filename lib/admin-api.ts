import { NextRequest, NextResponse } from "next/server";
import { requestAdminAuth, type AuthResult } from "./admin-auth";
import { adminEndpoints, normalizeAdminEnvelope } from "./admin-endpoints";

export const ADMIN_COOKIE = "admin_token";
export const isAdminAuthEnabled = () => process.env.ADMIN_AUTH_ENABLED === "true";

export function getApiBaseUrl(): string | null {
  return process.env.ADMIN_API_BASE_URL?.trim().replace(/\/+$/, "") ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "") || null;
}

export function hasAdminSession(request: NextRequest): boolean {
  return Boolean(request.cookies.get(ADMIN_COOKIE)?.value);
}

export async function loginAdmin(email: string, password: string): Promise<AuthResult> {
  const base = getApiBaseUrl();
  return base ? requestAdminAuth(base, "login", { email, password }) :
    { ok: false, status: 503, message: "Admin authentication is not configured." };
}

export async function fetchAdminProfile(token: string): Promise<AuthResult> {
  const base = getApiBaseUrl();
  return base ? requestAdminAuth(base, "me", { token }) :
    { ok: false, status: 503, message: "Admin authentication is not configured." };
}

/** Tokens and internal secrets stay in the server-side proxy. */
export async function forwardToUpstream(
  request: NextRequest,
  options: { body?: unknown; timeoutMs?: number } = {},
): Promise<NextResponse> {
  const fail = (status: number, message: string) =>
    NextResponse.json({ status: "error", message, data: null }, { status });
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!isAdminAuthEnabled() && !["GET", "HEAD"].includes(request.method)) return fail(503, "Admin writes require authentication");
  if (isAdminAuthEnabled() && !token) return fail(401, "Admin authentication required");
  const base = getApiBaseUrl();
  if (!base) return fail(503, "Admin API is not configured");
  if (isAdminAuthEnabled()) {
    const profile = await fetchAdminProfile(token!);
    if (!profile.ok) return fail(profile.status, profile.message ?? "Admin authentication required");
  }

  const path = request.nextUrl.pathname.replace(/^\/api\/admin\/?/, "");
  const upstreamPath = adminEndpoints[path];
  if (!upstreamPath) return fail(501, "This endpoint is awaiting a confirmed backend contract");
  try {
    const response = await fetch(`${base}${upstreamPath}${request.nextUrl.search}`, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        ...(isAdminAuthEnabled() && token ? { Authorization: `Bearer ${token}` } : {}),
        ...(process.env.INTERNAL_SECRET ? { "X-Internal-Secret": process.env.INTERNAL_SECRET } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) :
        !["GET", "HEAD"].includes(request.method) ? await request.text() : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(options.timeoutMs ?? 15000),
    });
    if (!response.ok) return fail(response.status, `Admin API request failed (${response.status})`);
    const text = await response.text();
    if (!text) return NextResponse.json({ status: "success", message: "OK", data: null });
    const parsed = normalizeAdminEnvelope(JSON.parse(text));
    if (parsed.status && parsed.status !== "success") return fail(502, "Admin API reported a failed request");
    return NextResponse.json({
      status: parsed.status ?? "success",
      message: parsed.message ?? "OK",
      data: Object.prototype.hasOwnProperty.call(parsed, "data") ? parsed.data : parsed,
      ...(parsed.meta !== undefined ? { meta: parsed.meta } : {}),
    });
  } catch (error) {
    const timeout = error instanceof Error && ["AbortError", "TimeoutError"].includes(error.name);
    return fail(timeout ? 504 : 502, timeout ? "Admin API request timed out" : "Unable to read the admin API response");
  }
}
