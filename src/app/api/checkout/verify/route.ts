import { NextResponse, type NextRequest } from "next/server";

import { checkVerificationCode, sendVerificationCode } from "@/lib/checkout/server";
import { isLocale } from "@/lib/i18n/config";

/**
 * Email-verification BFF (`POST /api/checkout/verify`).
 *
 * Two actions off one route (the lead booker's email is verified before payment):
 *   - `{ action: "send",  email }`        → emails a one-time code  → `{ ok, sent }`
 *   - `{ action: "check", email, code }`  → validates the code      → `{ ok, verified, reason? }`
 *
 * The storefront customer-auth endpoint is not defined yet (CLAUDE.md): until
 * `CHECKOUT_AUTH_LIVE=true` the server primitives degrade to a preview that
 * accepts any non-empty code, so the checkout stays testable end-to-end.
 */

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const data = (body ?? {}) as { action?: unknown; email?: unknown; code?: unknown; locale?: unknown };
  const email = typeof data.email === "string" ? data.email.trim() : "";
  if (!email) {
    return NextResponse.json({ ok: false, error: "missing_email" }, { status: 400 });
  }
  const locale = typeof data.locale === "string" && isLocale(data.locale) ? data.locale : undefined;

  try {
    if (data.action === "send") {
      const { sent } = await sendVerificationCode({ email, locale });
      return NextResponse.json({ ok: true, sent });
    }
    if (data.action === "check") {
      const code = typeof data.code === "string" ? data.code : "";
      const result = await checkVerificationCode({ email, code, locale });
      return NextResponse.json({ ok: true, ...result });
    }
    return NextResponse.json({ ok: false, error: "invalid_action" }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "verify_failed" }, { status: 502 });
  }
}
