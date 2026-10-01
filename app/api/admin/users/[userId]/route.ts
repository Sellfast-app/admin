import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

/**
 * GET /api/admin/users/{userId}
 * Upstream: GET {ADMIN_API_BASE_URL}/admin/users/{userId}
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  await params;
  return forwardToUpstream(request);
}
