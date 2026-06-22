import { NextResponse, type NextRequest } from "next/server";

import { isEmail, isNonEmptyString } from "@/lib/validation";

/**
 * Email-existence BFF (`POST /api/auth/customer/exists`) — drives the email-first
 * login branch: an existing account → password (sign in); a new email →
 * registration. Response: `{ ok, exists }`.
 *
 * PREVIEW: the storefront customer-auth API is still being defined (CLAUDE.md) and
 * an email-lookup endpoint may not be exposed at all (account enumeration is a real
 * concern — many auth APIs answer uniformly and only reveal the branch after the
 * password/OTP step). Until that's decided with the backend team, any address on
 * `@tourismotion.it` is treated as existing so BOTH branches stay demoable. Swap
 * the heuristic for the real check (or fold the branch into the next step) when the
 * contract lands — the form reads `exists` and won't change.
 */

export const dynamic = "force-dynamic";

function existsPreview(email: string): boolean {
  return email.trim().toLowerCase().endsWith("@tourismotion.it");
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const data = (body ?? {}) as { email?: unknown };
  if (!isNonEmptyString(data.email) || !isEmail(data.email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, exists: existsPreview(data.email) });
}
