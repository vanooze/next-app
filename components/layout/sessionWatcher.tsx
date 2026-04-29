"use client";

import { usePathname } from "next/navigation";
import useAutoLogout from "../hooks/useAutoLogout";

function isPublicRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/login" || pathname === "/register") return true;
  if (/^\/contract\/upload\/[^/]+$/.test(pathname)) return true;
  return false;
}

export default function SessionWatcher() {
  const pathname = usePathname();
  useAutoLogout(!isPublicRoute(pathname));

  return null;
}
