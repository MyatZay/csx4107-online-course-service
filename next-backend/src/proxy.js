import { NextResponse } from "next/server";
import corsHeaders from "./lib/cors";

export function proxy(request) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }
  return NextResponse.next({ headers: corsHeaders });
}

export const config = {
  matcher: ["/api/:path*"],
};
