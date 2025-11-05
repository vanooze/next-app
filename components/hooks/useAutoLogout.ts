"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  exp: number; // expiration timestamp in seconds
  [key: string]: any;
}

export default function useAutoLogout(token?: string | null) {
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded: JWTPayload = jwtDecode(token);
      const expiry = decoded.exp * 1000; // convert seconds → ms
      const now = Date.now();

      if (expiry <= now) {
        // Already expired → redirect immediately
        router.push("/login");
      } else {
        // Set a timer for auto-logout at expiry
        const timeout = setTimeout(() => {
          alert("Session expired. Please log in again.");
          router.push("/login");
        }, expiry - now);

        return () => clearTimeout(timeout);
      }
      console.log("Expires in:", (expiry - now) / 1000, "seconds");
    } catch (err) {
      console.error("Invalid or malformed token:", err);
      router.push("/login");
    }
  }, [token, router]);
}
