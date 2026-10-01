import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

/**
 * GET /api/admin/users?page=1&limit=20&search=&status=&country=
 * Upstream: GET {ADMIN_API_BASE_URL}/admin/users
 */
export async function GET(request: NextRequest) {
  return forwardToUpstream(request);
}
