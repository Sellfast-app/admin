import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

/**
 * GET /api/admin/orders?page=1&limit=20&status=&channel=website|whatsapp|webchat&store=&from=&to=
 * Upstream: GET {ADMIN_API_BASE_URL}/admin/orders
 */
export async function GET(request: NextRequest) {
  return forwardToUpstream(request);
}
