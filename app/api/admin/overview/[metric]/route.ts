import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

export async function GET(request: NextRequest) {
  return forwardToUpstream(request);
}
