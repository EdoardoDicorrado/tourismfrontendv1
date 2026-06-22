import { NextResponse, type NextRequest } from "next/server";

import { customerResendVerification } from "@/lib/account/client";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { isEmail, isNonEmptyString } from "@/lib/validation";

/**
 * Resend verification email BFF (`POST /api/auth/customer/resend-verification`).
 *
 * ALWAYS responds `{ ok: true }` (anti-enumeration: never reveal whether the email
 * exists or is already verified). Proxies to the account seam.
 */

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const data = (body ?? {}) as { email?: unknown; locale?: unknown };
  if (!isNonEmptyString(data.email) || !isEmail(data.email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  const locale: Locale | undefined =
    typeof data.locale === "string" && isLocale(data.locale) ? data.locale : undefined;

  // Anti-enumeration: never reveal whether the email is known/unverified.
  await customerResendVerification(data.email, locale);
  return NextResponse.json({ ok: true });
}
