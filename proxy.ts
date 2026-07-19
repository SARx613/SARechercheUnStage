import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";

const PUBLIC_PATHS = ["/login"];
const PUBLIC_API_PREFIXES = ["/api/auth/login", "/api/cron"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isPublic =
    PUBLIC_PATHS.includes(path) ||
    PUBLIC_API_PREFIXES.some((prefix) => path.startsWith(prefix));

  if (isPublic) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get("session")?.value;
  const authenticated = await verifySession(cookie);

  if (!authenticated) {
    const loginUrl = new URL("/login", req.nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|manifest.json|sw.js|icon-.*\\.png|favicon.ico).*)"],
};
