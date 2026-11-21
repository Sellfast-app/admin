import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

export const GET = (request: NextRequest) => forwardToUpstream(request);
