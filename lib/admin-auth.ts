export interface AdminUser {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

export type AuthResult = { ok: boolean; status: number; token?: string; user?: AdminUser; message?: string };

// These paths exist in the API's caleb branch, but are absent from the public docs.
// Never fall back to vendor authentication for an administrative session.
export async function requestAdminAuth(
  baseUrl: string,
  operation: "login" | "me",
  credentials: { email: string; password: string } | { token: string },
): Promise<AuthResult> {
  try {
    const response = await fetch(`${baseUrl}/auth/admin/${operation}`, {
      method: operation === "login" ? "POST" : "GET",
      headers: {
        "Content-Type": "application/json",
        ...("token" in credentials ? { Authorization: `Bearer ${credentials.token}` } : {}),
      },
      body: "password" in credentials ? JSON.stringify(credentials) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const status = response.status === 404 || response.status === 405 ? 503 : response.status;
      return { ok: false, status, message: status === 401 ? "Invalid credentials or expired session." : status === 403 ? "This account does not have admin access." : "Admin authentication is unavailable. Please contact your administrator." };
    }
    const body = await response.json();
    const data = body?.data;
    if (body?.status !== "success" || !data || typeof data !== "object") {
      return { ok: false, status: 502, message: "Invalid response from the authentication service." };
    }
    if (operation === "login") {
      if (typeof data.token !== "string" || !data.token.trim()) {
        return { ok: false, status: 502, message: "Authentication response did not include a token." };
      }
      // Confirm admin access before setting a browser session, not just possession of a JWT.
      const profile = await requestAdminAuth(baseUrl, "me", { token: data.token });
      return profile.ok ? { ...profile, token: data.token } : profile;
    }
    const user = data.user ?? data;
    if (!user || typeof user !== "object" || user.role !== "admin" || typeof user.id !== "string" || !user.id) {
      return { ok: false, status: 403, message: "This account does not have admin access." };
    }
    return { ok: true, status: 200, user };
  } catch (error) {
    const timeout = error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name);
    return { ok: false, status: timeout ? 504 : 502, message: timeout ? "Authentication timed out. Please try again." : "Unable to reach the authentication service." };
  }
}
