import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-api";

export async function POST() {
  const response = NextResponse.json({
    status: "success",
    message: "Logged out",
    data: null,
  });

  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
