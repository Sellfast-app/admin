import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

/**
 * GET /api/admin/audit-log?page=1&limit=50&module=&staffId=&from=&to=
 * Upstream: GET {ADMIN_API_BASE_URL}/admin/audit-log
 *
 * Immutable audit ledger (PRD 5.2): timestamp, staffId, staffName,
 * actionType, module, ipAddress, beforeState, afterState.
 */
export async function GET(request: NextRequest) {
  return forwardToUpstream(request);
}
