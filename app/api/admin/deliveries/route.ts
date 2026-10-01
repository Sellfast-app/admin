import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

/**
 * GET /api/admin/deliveries?page=1&limit=20&provider=gigl|sendbox|bolt|manual&status=
 * Upstream: GET {ADMIN_API_BASE_URL}/admin/deliveries
 */
export async function GET(request: NextRequest) {
  return forwardToUpstream(request);
}
