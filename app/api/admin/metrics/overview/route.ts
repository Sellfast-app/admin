import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

/**
 * GET /api/admin/metrics/overview?period=30d
 * Upstream: GET {ADMIN_API_BASE_URL}/admin/metrics/overview
 *
 * Returns platform KPIs: totalUsers, activeUsers, ordersProcessed,
 * subscribers, gmv, transactionVolume, successfulTransactions,
 * failedTransactions, usersAccumulated.
 */
export async function GET(request: NextRequest) {
  return forwardToUpstream(request);
}
