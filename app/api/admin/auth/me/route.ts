import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, fetchAdminProfile } from "@/lib/admin-api";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { status: "error", message: "Admin authentication required", data: null },
      { status: 401 }
    );
  }

  const profile = await fetchAdminProfile(token);

  if (!profile.ok) {
    const response = NextResponse.json(
      { status: "error", message: profile.message ?? "Session invalid", data: null },
      { status: profile.status }
    );
    if (profile.status === 401) {
      response.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
    }
    return response;
  }

  return NextResponse.json({
    status: "success",
    message: "OK",
    data: { user: profile.user },
  });
}
