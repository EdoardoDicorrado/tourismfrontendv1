import { NextResponse, type NextRequest } from "next/server";

import { isNonEmptyString } from "@/lib/validation";

/**
 * Affiliate password BFF — change the affiliate's password.
 *
 * PREVIEW: there is no affiliate session/endpoint on the storefront API yet
 * (affiliate auth is full-stack #37), so this only validates the payload shape and
 * mock-confirms — no session gate (the affiliate is a client-only demo flag today).
 * Swap the mock for a real `changeAffiliatePassword(...)` seam call + a session
 * gate once the affiliate backend lands.
 */

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const data = (body ?? {}) as {
    current_password?: unknown;
    new_password?: unknown;
    new_password_confirm?: unknown;
  };

  if (!isNonEmptyString(data.current_password)) {
    return NextResponse.json({ ok: false, error: "missing_current" }, { status: 422 });
  }
  if (!isNonEmptyString(data.new_password)) {
    return NextResponse.json({ ok: false, error: "missing_new" }, { status: 422 });
  }
  if (data.new_password !== data.new_password_confirm) {
    return NextResponse.json({ ok: false, error: "mismatch" }, { status: 422 });
  }

  // PREVIEW: no backend — accept any non-empty current password.
  return NextResponse.json({ ok: true });
}
