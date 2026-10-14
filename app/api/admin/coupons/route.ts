import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

/**
 * GET /api/admin/coupons
 * Upstream: GET {ADMIN_API_BASE_URL}/api/coupons
 *
 * Returns all platform coupons (food vendor stores only) for admin management.
 * Response shape: { status, message, data: [{ code, store_name, startDate, expiryDate, usageLimit }] }
 */
export async function GET(request: NextRequest) {
  return forwardToUpstream(request);
}
