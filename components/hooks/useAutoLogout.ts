"use client";

import { useEffect, useCallback, useRef } from "react";
import {
  getNativeFetch,
  signOutAndRedirectToLogin,
} from "@/helpers/authSession";

const POLL_MS = 60 * 1000;

async function sessionInvalid(): Promise<boolean> {
  const res = await getNativeFetch()("/api/auth/me", {
    credentials: "include",
  });
  return res.status === 401;
}

/**
 * Keeps client state in sync with the httpOnly session cookie by asking the
 * server. Client-side JWT decoding is unreliable here because the token is
 * not readable from document.cookie.
 */
export default function useAutoLogout(enabled: boolean) {
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const redirectToLogin = useCallback(async () => {
    await signOutAndRedirectToLogin();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const tick = async () => {
      if (!enabledRef.current || cancelled) return;
      if (await sessionInvalid()) {
        await redirectToLogin();
      }
    };

    void tick();
    const interval = setInterval(() => void tick(), POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") void tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, redirectToLogin]);
}
