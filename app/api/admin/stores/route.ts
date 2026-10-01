import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

/**
 * GET /api/admin/stores?page=1&limit=20&search=&country=&plan=
 * Upstream: GET {ADMIN_API_BASE_URL}/admin/stores
 */
export async function GET(request: NextRequest) {
  return forwardToUpstream(request);
}
