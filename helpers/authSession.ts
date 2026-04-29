/**
 * Patches `window.fetch` (browser only) so 401s from same-origin `/api/*` clear
 * the session and send the user to login. Auth endpoints that legitimately
 * return 401 (login, register, logout) are excluded.
 * Import from `app/layout.tsx` so the patch runs before other client code.
 */

let nativeFetchRef: typeof fetch | null = null;
let sessionRedirectInFlight = false;

function resolveApiPathname(input: RequestInfo | URL, init?: RequestInit): string {
  if (typeof window === "undefined") return "";
  try {
    if (typeof input === "string") {
      return new URL(input, window.location.origin).pathname;
    }
    if (input instanceof URL) {
      return input.pathname;
    }
    if (typeof Request !== "undefined" && input instanceof Request) {
      return new URL(input.url).pathname;
    }
  } catch {
    /* ignore */
  }
  return "";
}

function isSameOriginApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

function shouldIgnoreUnauthorizedRedirect(pathname: string): boolean {
  return (
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/register" ||
    pathname === "/api/auth/logout"
  );
}

export function getNativeFetch(): typeof fetch {
  return nativeFetchRef ?? globalThis.fetch.bind(globalThis);
}

export async function signOutAndRedirectToLogin(): Promise<void> {
  if (typeof window === "undefined") return;
  if (sessionRedirectInFlight) return;
  sessionRedirectInFlight = true;
  try {
    await getNativeFetch()("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {
    /* ignore */
  }
  window.location.replace("/login");
}

function installAuthFetchInterceptor(): void {
  if (typeof window === "undefined") return;
  const w = window as Window & { __bmsAuthFetchPatched?: boolean };
  if (w.__bmsAuthFetchPatched) return;

  nativeFetchRef = window.fetch.bind(window);
  w.__bmsAuthFetchPatched = true;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const res = await nativeFetchRef!(input, {
      credentials: "include",
      ...init,
    });
    if (res.status !== 401) return res;

    const pathname = resolveApiPathname(input, init);
    if (
      !isSameOriginApiPath(pathname) ||
      shouldIgnoreUnauthorizedRedirect(pathname)
    ) {
      return res;
    }

    void signOutAndRedirectToLogin();
    return res;
  };
}

if (typeof window !== "undefined") {
  installAuthFetchInterceptor();
}
