import "server-only";

import { cookies } from "next/headers";

import type { AuthResult, Session, SessionRole } from "./types";

/**
 * Area Riservata — session management (httpOnly cookie).
 *
 * The cookie carries a base64-encoded JSON payload `{ role, name, token,
 * expires_at, scope }`. The `token` is the storefront JWT (HS256) issued by
 * tatanka3; it lives ONLY in this httpOnly cookie (the browser never reads it)
 * and is forwarded as `token` to `@/lib/account/client` → `backendFetch`. The
 * `role`/`name`/`scope` are decoded on the server to gate pages and branch the
 * sidebar (customer vs agency) without a round-trip.
 *
 * Next.js 16: `cookies()` is async (always `await`). `.set`/`.delete` work ONLY
 * inside a Route Handler or Server Action (not during Server Component render);
 * reads work anywhere on the server.
 */

/** httpOnly cookie name. */
export const SESSION_COOKIE = "tm_account";

/** Fallback cookie lifetime in seconds (8h — the agency token TTL) if `expires_at` is unparseable. */
const MAX_AGE = 60 * 60 * 8;

/** Login path per role, used by `requireRole` redirects. */
const LOGIN_PATH: Record<SessionRole, (lang: string) => string> = {
  customer: (lang) => `/${lang}/area/accedi`,
  agency: (lang) => `/${lang}/agenzie/accedi`,
};

/**
 * Read and decode the current session from the cookie. Returns `null` when there
 * is no cookie or it can't be decoded. Safe to call during Server Component
 * render (read-only).
 */
export async function getSession(): Promise<Session | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}

/**
 * Persist a session from an `AuthResult`. MUST be called from a Route Handler or
 * Server Action (sets a `Set-Cookie` header). The bearer `token` is stored in
 * the httpOnly cookie and the cookie lifetime is clamped to the token's expiry.
 */
export async function setSession(result: AuthResult): Promise<void> {
  const session: Session =
    result.role === "customer"
      ? {
          role: "customer",
          name:
            [result.customer.first_name, result.customer.last_name]
              .filter(Boolean)
              .join(" ")
              .trim() ||
            result.customer.email ||
            "Cliente",
          token: result.token,
          expires_at: result.expires_at,
          scope: result.scope,
        }
      : {
          role: "agency",
          name:
            result.agency.display_name ||
            result.agency.legal_name ||
            result.user.name ||
            "Agenzia",
          token: result.token,
          expires_at: result.expires_at,
          scope: result.scope,
        };

  const value = encodeSession(session);
  (await cookies()).set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: cookieMaxAge(result.expires_at),
  });
}

/** Seconds until the token expires (min 1), or the 8h fallback if unparseable. */
function cookieMaxAge(expiresAt: string): number {
  const ms = Date.parse(expiresAt);
  if (Number.isNaN(ms)) return MAX_AGE;
  return Math.max(1, Math.floor((ms - Date.now()) / 1000));
}

/** Clear the session cookie (logout). MUST be called from a Route Handler / Server Action. */
export async function clearSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * Page guard: return the session if it matches the required role, otherwise the
 * login path to redirect to. Pages call `redirect()` with the returned path
 * OUTSIDE any try/catch.
 *
 * Usage in a Server Component:
 *   const guard = await requireRole("agency", lang);
 *   if ("redirectTo" in guard) redirect(guard.redirectTo);
 *   const session = guard.session;
 */
export async function requireRole(
  role: SessionRole,
  lang: string,
): Promise<{ session: Session } | { redirectTo: string }> {
  const session = await getSession();
  if (!session || session.role !== role) {
    return { redirectTo: LOGIN_PATH[role](lang) };
  }
  return { session };
}

// ── Encoding (mock payload) ──────────────────────────────────────────────────

function encodeSession(session: Session): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64");
}

function decodeSession(raw: string): Session | null {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    if (!isSession(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.name !== "string") return false;
  if (typeof v.token !== "string" || typeof v.expires_at !== "string") return false;
  if (typeof v.scope !== "object" || v.scope === null) return false;
  const scope = v.scope as Record<string, unknown>;
  if (v.role === "customer") {
    return typeof scope.user_id === "string";
  }
  if (v.role === "agency") {
    return typeof scope.agency_id === "string";
  }
  return false;
}
