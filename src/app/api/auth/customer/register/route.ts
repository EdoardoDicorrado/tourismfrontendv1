import { NextResponse, type NextRequest } from "next/server";

import { customerRegister } from "@/lib/account/client";
import { BackendError } from "@/lib/api/client";
import type { CustomerRegisterPayload } from "@/lib/account/types";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { isEmail, isNonEmptyString } from "@/lib/validation";

/**
 * Customer registration BFF (`POST /api/auth/customer/register`).
 *
 * Validates the payload server-side, then asks the account seam to create the
 * customer (status `pending_verification`). NO session is created — double opt-in:
 * the user must verify the email first. Response: `{ ok: true, status:
 * "pending_verification" }`. A backend `422` (e.g. email already in use) is
 * surfaced as `validation_failed` with the field `details` so the form can map it
 * (an `email` detail → "email already in use, use Forgot password").
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
    first_name?: unknown;
    last_name?: unknown;
    email?: unknown;
    password?: unknown;
    password_confirm?: unknown;
    policy_check?: unknown;
    locale?: unknown;
  };
  const locale: Locale | undefined =
    typeof data.locale === "string" && isLocale(data.locale) ? data.locale : undefined;

  if (!isNonEmptyString(data.first_name)) {
    return NextResponse.json({ ok: false, error: "missing_first_name" }, { status: 422 });
  }
  if (!isNonEmptyString(data.last_name)) {
    return NextResponse.json({ ok: false, error: "missing_last_name" }, { status: 422 });
  }
  if (!isNonEmptyString(data.email) || !isEmail(data.email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 422 });
  }
  if (!isNonEmptyString(data.password) || data.password.length < 8) {
    return NextResponse.json({ ok: false, error: "weak_password" }, { status: 422 });
  }
  if (data.password !== data.password_confirm) {
    return NextResponse.json({ ok: false, error: "password_mismatch" }, { status: 422 });
  }
  if (data.policy_check !== true) {
    return NextResponse.json({ ok: false, error: "policy_required" }, { status: 422 });
  }

  const payload: CustomerRegisterPayload = {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    password: data.password,
    password_confirm: data.password,
    policy_check: true,
    locale: locale ?? null,
  };

  try {
    const result = await customerRegister(payload, locale);
    return NextResponse.json({ ok: true, status: result.status });
  } catch (err) {
    if (err instanceof BackendError && err.status === 422) {
      const details =
        err.body && typeof err.body === "object" && "error" in err.body
          ? (err.body as { error?: { details?: unknown } }).error?.details
          : undefined;
      return NextResponse.json({ ok: false, error: "validation_failed", details }, { status: 422 });
    }
    return NextResponse.json({ ok: false, error: "register_failed" }, { status: 502 });
  }
}
