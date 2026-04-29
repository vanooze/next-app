"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthWatcher() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/me"); // lightweight endpoint

        if (res.status === 401) {
          // token expired or invalid
          router.push("/login");
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
    }, 60 * 1000); // check every 1 min

    return () => clearInterval(interval);
  }, []);

  return null;
}
