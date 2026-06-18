import { NextResponse } from "next/server";

import { logout } from "@/lib/account/client";
import { clearSession, getSession } from "@/lib/account/session";

/**
 * Logout BFF — revokes the bearer token upstream, then clears the httpOnly
 * session cookie.
 *
 * `clearSession()` deletes the cookie (only possible inside a Route Handler /
 * Server Action, never during render). The client `LogoutButton` POSTs here and
 * then navigates to the login page itself, so we just return `{ ok: true }`
 * rather than issuing a redirect the fetch would silently follow.
 *
 * Upstream revocation is best-effort: `/auth/logout` is NOT idempotency-guarded
 * and the seam swallows a 401 (token already expired/revoked), so a failure here
 * never blocks the local logout.
 */

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  if (session) {
    try {
      await logout(session.token);
    } catch {
      // Network/5xx upstream — we still drop the cookie locally below.
    }
  }
  await clearSession();
  return NextResponse.json({ ok: true });
}
