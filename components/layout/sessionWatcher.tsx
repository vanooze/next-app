"use client";

import useAutoLogout from "../hooks/useAutoLogout";

export default function SessionWatcher() {
  // Get the token from cookies
  const token =
    typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || null
      : null;

  // Call your hook
  useAutoLogout(token);

  return null;
}
