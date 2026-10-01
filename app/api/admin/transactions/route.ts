import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

/**
 * GET /api/admin/transactions?page=1&limit=20&gateway=&status=&from=&to=
 * Upstream: GET {ADMIN_API_BASE_URL}/admin/transactions
 *
 * Each row should include the split-payment breakdown:
 * vendorAmount + platformFee (₦500 markup + transaction %) = total.
 */
export async function GET(request: NextRequest) {
  return forwardToUpstream(request);
}
