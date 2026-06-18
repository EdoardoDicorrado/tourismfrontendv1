import { NextResponse, type NextRequest } from "next/server";

import { requestPasswordReset, resetPassword } from "@/lib/account/client";
import { isLocale, type Locale } from "@/lib/i18n/config";

/**
 * Password recovery BFF (agency + customer). Two actions on one route, discriminated by
 * the `action` field:
 *   - `action: "forgot"` → request a reset email. ALWAYS responds `{ ok: true }`
 *     (anti-enumeration: never reveal whether the email exists).
 *   - `action: "reset"`  → complete the reset with the emailed token + new
 *     password. Returns `{ ok: false, error: "invalid_token" }` (400) when the
 *     token is invalid/expired, or `{ ok: false, error: "password_mismatch" }`.
 *
 * Both actions go through the account-client seam (`requestPasswordReset` /
 * `resetPassword`), each carrying its own TODO(storefront-api) backendFetch call.
 * No session is created — after a successful reset the user logs in normally.
 */

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const data = (body ?? {}) as {
    action?: unknown;
    email?: unknown;
    token?: unknown;
    password?: unknown;
    password_confirm?: unknown;
    locale?: unknown;
  };
  const locale: Locale | undefined =
    typeof data.locale === "string" && isLocale(data.locale) ? data.locale : undefined;

  if (data.action === "forgot") {
    if (!isNonEmptyString(data.email) || !EMAIL_RE.test(data.email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }
    // Anti-enumeration: never reveal whether the email is known.
    await requestPasswordReset(data.email, locale);
    return NextResponse.json({ ok: true });
  }

  if (data.action === "reset") {
    // The Laravel broker keys on email + token, so both come back in the reset
    // link (`?token=…&email=…`) and must be replayed here.
    if (!isNonEmptyString(data.email) || !EMAIL_RE.test(data.email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }
    if (!isNonEmptyString(data.token)) {
      return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 });
    }
    if (!isNonEmptyString(data.password) || data.password.length < 8) {
      return NextResponse.json({ ok: false, error: "weak_password" }, { status: 400 });
    }
    if (data.password !== data.password_confirm) {
      return NextResponse.json({ ok: false, error: "password_mismatch" }, { status: 400 });
    }
    const ok = await resetPassword(data.email, data.token, data.password, locale);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "invalid_action" }, { status: 400 });
}
