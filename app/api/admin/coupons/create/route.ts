import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

/**
 * POST /api/admin/coupons/create
 * Upstream: POST {ADMIN_API_BASE_URL}/api/coupon/create
 *
 * Creates a new coupon for a food vendor store.
 * The request body (JSON) is forwarded verbatim to the upstream API.
 */
export async function POST(request: NextRequest) {
  return forwardToUpstream(request);
}
