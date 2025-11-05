import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, JWTPayload } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key"
);

async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isProtectedPage = ["/", "/tasks", "/project", "/inventory"].includes(
    pathname
  );
  const isPublicUploadPage = /^\/contract\/upload\/[^\/]+$/.test(pathname);

  // Allow public upload routes
  if (isPublicUploadPage) return NextResponse.next();

  const response = NextResponse.next();
  const user = token ? await verifyToken(token) : null;

  // 🔒 Token exists but invalid/expired → clear cookie and redirect
  if (token && !user) {
    response.cookies.delete("token");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🚫 Prevent logged-in users from accessing login/register
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 🔐 Prevent unauthenticated access to protected routes
  if (isProtectedPage && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/tasks",
    "/project",
    "/inventory",
    "/contract/:path*",
  ],
};
