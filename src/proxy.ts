import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, verifyToken } from "@/server/auth";

export function proxy(request: NextRequest) {
  const session = request.cookies.get(AUTH_COOKIE)?.value;
  const valid = session ? verifyToken(session) : null;
  if (
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register") &&
    valid
  )
    return NextResponse.redirect(new URL("/dashboard", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/login", "/register"] };
