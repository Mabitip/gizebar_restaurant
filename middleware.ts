import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import type { Role } from "@prisma/client";
import { can, homePathForRole, resourceForPath } from "@/lib/permissions";

const COOKIE_NAME = "gize_admin_token";

async function readSession(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const role = payload.role as Role | undefined;
    const userId = payload.userId as string | undefined;
    const email = payload.email as string | undefined;
    const name = payload.name as string | undefined;
    if (!role || !userId || !email) return null;
    return { userId, email, name: name || "", role };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login") {
    const session = await readSession(request);
    if (session) {
      return NextResponse.redirect(new URL(homePathForRole(session.role), request.url));
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const session = await readSession(request);
  if (!session) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  const resource = resourceForPath(pathname);
  if (resource && !can(session, resource, "read")) {
    return NextResponse.redirect(new URL(homePathForRole(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
