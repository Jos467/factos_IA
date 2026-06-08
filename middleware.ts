import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/facturas", "/envios", "/perfil"];
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("__Secure-authjs.session-token")?.value ??
    req.cookies.get("authjs.session-token")?.value;

  const isLoggedIn = !!token;
  const path = req.nextUrl.pathname;

  const isProtected = PROTECTED_ROUTES.some((r) =>
    path.startsWith(r)
  );

  const isAuthRoute = AUTH_ROUTES.some((r) =>
    path.startsWith(r)
  );

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(
      new URL("/dashboard", req.nextUrl.origin)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|assets).*)",
  ],
};