import { NextResponse, type NextRequest } from "next/server";

import { customerVerifyEmail } from "@/lib/account/client";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { isNonEmptyString } from "@/lib/validation";

/**
 * Email verification BFF (`POST /api/auth/customer/verify-email`).
 *
 * The verify page reads the `?token=` from the email link (server-side) and POSTs
 * it here; this proxies to the account seam (`GET /auth/email/verify/{token}`). NO
 * session is created — after verifying, the user logs in normally. `{ ok: true }`
 * on success, `{ ok: false, error: "invalid_token" }` (400) on a bad/expired token.
 */

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const data = (body ?? {}) as { token?: unknown; locale?: unknown };
  if (!isNonEmptyString(data.token)) {
    return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 });
  }
  const locale: Locale | undefined =
    typeof data.locale === "string" && isLocale(data.locale) ? data.locale : undefined;

  try {
    const ok = await customerVerifyEmail(data.token, locale);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "verify_failed" }, { status: 502 });
  }
}
