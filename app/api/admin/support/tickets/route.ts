import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

/**
 * GET /api/admin/support/tickets?page=1&limit=20&status=&priority=
 * Upstream: GET {ADMIN_API_BASE_URL}/admin/support/tickets
 */
export async function GET(request: NextRequest) {
  return forwardToUpstream(request);
}
