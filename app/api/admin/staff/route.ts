import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

/**
 * GET /api/admin/staff?page=1&limit=20&search=&role=&status=
 * Upstream: GET {ADMIN_API_BASE_URL}/admin/staff
 */
export async function GET(request: NextRequest) {
  return forwardToUpstream(request);
}

/**
 * POST /api/admin/staff
 * Upstream: POST {ADMIN_API_BASE_URL}/admin/staff
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  return forwardToUpstream(request, { body });
}
