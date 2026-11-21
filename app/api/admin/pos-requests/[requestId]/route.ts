import { NextRequest } from "next/server";
import { forwardToUpstream } from "@/lib/admin-api";

export const PATCH = (request: NextRequest) => forwardToUpstream(request);
