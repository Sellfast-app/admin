import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

/**
 * GET /api/admin/finance/summary?period=30d
 * Upstream: GET {ADMIN_API_BASE_URL}/admin/finance/summary
 *
 * Platform revenue, markup fees, transaction fees, pending settlements,
 * per-gateway reconciliation.
 */
export async function GET(request: NextRequest) {
  return forwardToUpstream(request);
}
