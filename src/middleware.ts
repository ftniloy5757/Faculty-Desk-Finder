import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth routes, API routes, and static assets in the public folder
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/dev/mapper") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  // Allow development testing without Google OAuth block if BYPASS_AUTH=true
  if (process.env.NODE_ENV === "development" && process.env.BYPASS_AUTH === "true") {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "faculty-desk-finder-dev-secret",
  });

  if (!token) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Ensure authenticated user strictly has an email ending with bracu.ac.bd
  const email = (token.email as string)?.toLowerCase().trim();
  const isAuthorized = email && (email.endsWith("@bracu.ac.bd") || email.endsWith(".bracu.ac.bd"));
  if (!isAuthorized) {
    const errorUrl = new URL("/auth/error?error=AccessDenied", request.url);
    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
