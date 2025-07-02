import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key"
);

async function verifyToken(token: string) {
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
  const isProtectedPage = pathname === "/";

  const user = token ? await verifyToken(token) : null;

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isProtectedPage && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/tasks", "/login", "/register"],
};
