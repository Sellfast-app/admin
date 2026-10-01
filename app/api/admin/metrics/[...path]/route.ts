import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

/**
 * GET /api/admin/metrics/{signups|retention|growth|channels}?granularity=month&period=12m
 * Upstream: GET {ADMIN_API_BASE_URL}/admin/metrics/{...path}
 */
export async function GET(request: NextRequest) {
  return forwardToUpstream(request);
}
