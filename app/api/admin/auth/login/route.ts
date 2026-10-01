import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, loginAdmin } from "@/lib/admin-api";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json().catch(() => ({}));

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return NextResponse.json(
        { status: "error", message: "Email and password are required", data: null },
        { status: 400 }
      );
    }

    const result = await loginAdmin(email.trim(), password);

    if (!result.ok) {
      return NextResponse.json(
        { status: "error", message: result.message ?? "Login failed", data: null },
        { status: result.status }
      );
    }

    const response = NextResponse.json({
      status: "success",
      message: "Login successful",
      data: { user: result.user },
    });

    response.cookies.set(ADMIN_COOKIE, result.token!, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 86400,
    });

    return response;
  } catch (error) {
    console.error("[ADMIN_LOGIN] unexpected error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error", data: null },
      { status: 500 }
    );
  }
}
