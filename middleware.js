// node_modules
import { NextResponse } from "next/server";

/**
 * Middleware for logging all requests from the NextJS server to the log. We use this for IGVF-851
 * and we'll see if we should remove this after solving the issue or if we should keep this for
 * future debugging.
 * https://nextjs.org/docs/pages/building-your-application/routing/middleware
 */
export function middleware(req) {
  const {
    method,
    headers,
    nextUrl: { pathname, search },
  } = req;

  const ip = headers.get("x-forwarded-for") || headers.get("host") || "";
  const date = new Date().toISOString();

  console.log(`NJSREQ [${date}] ${ip} ${method} ${pathname}${search}`);

  return NextResponse.next();
}

/**
 * This filters out requests for chunks of the build and the favicon to help keep the log clean.
 */
export const config = {
  matcher: "/((?!_next|favicon.ico).*)",
};
