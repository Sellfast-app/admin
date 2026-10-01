import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

/**
 * GET /api/admin/subscriptions?page=1&limit=20&plan=subscription|markup&status=
 * Upstream: GET {ADMIN_API_BASE_URL}/admin/subscriptions
 */
export async function GET(request: NextRequest) {
  return forwardToUpstream(request);
}
