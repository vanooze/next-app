import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, JWTPayload } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key",
);

async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isPublicUploadPage = /^\/contract\/upload\/[^\/]+$/.test(pathname);

  // ✅ Allow public routes immediately
  if (isPublicUploadPage) return NextResponse.next();

  // ✅ IMPORTANT: Do NOT verify token on auth pages
  if (isAuthPage) {
    if (!token) return NextResponse.next();

    const user = await verifyToken(token);
    if (user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // expired token on login → just delete & continue
    const res = NextResponse.next();
    res.cookies.delete("token");
    return res;
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = await verifyToken(token);
  if (!user) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete("token");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * All non-static app pages; excludes API and Next internals so navigation
     * and full reloads always re-check the session (including nested routes).
     */
    "/((?!api|_next/|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|svg|webp|gif)$).*)",
  ],
};
