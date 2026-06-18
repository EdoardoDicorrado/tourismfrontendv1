import { NextResponse, type NextRequest } from "next/server";

import { customerLogin } from "@/lib/account/client";
import { setSession } from "@/lib/account/session";
import { BackendError } from "@/lib/api/client";
import { isLocale, type Locale } from "@/lib/i18n/config";

/**
 * Customer login BFF (`POST /api/auth/customer/login`, email + password).
 *
 * ARCHITECTURE (CLAUDE.md): the browser never sees the bearer token. Validates the
 * payload, authenticates via the account seam, and on success stores the session
 * in the httpOnly cookie via `setSession()` (only possible in a Route Handler).
 * The response carries NO token — just `{ ok: true }` plus the role.
 *
 * Error mapping: `null` from `customerLogin` → 401 `bad_credentials`; the seam
 * rethrows a `403` when the email isn't verified yet (double opt-in) — surfaced as
 * `email_not_verified` so the form can offer to resend the link — or when the
 * account is suspended (`account_suspended`).
 */

export const dynamic = "force-dynamic";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** Read the backend domain error code out of a BackendError envelope, if present. */
function backendErrorCode(error: BackendError): string | undefined {
  const body = error.body;
  if (body && typeof body === "object" && "error" in body) {
    const code = (body as { error?: { code?: unknown } }).error?.code;
    if (typeof code === "string") return code;
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const data = (body ?? {}) as { email?: unknown; password?: unknown; locale?: unknown };
  if (!isNonEmptyString(data.email)) {
    return NextResponse.json({ ok: false, error: "missing_email" }, { status: 400 });
  }
  if (!isNonEmptyString(data.password)) {
    return NextResponse.json({ ok: false, error: "missing_password" }, { status: 400 });
  }
  const locale: Locale | undefined =
    typeof data.locale === "string" && isLocale(data.locale) ? data.locale : undefined;

  try {
    const result = await customerLogin(data.email, data.password, locale);
    if (!result) {
      return NextResponse.json({ ok: false, error: "bad_credentials" }, { status: 401 });
    }
    await setSession(result);
    return NextResponse.json({ ok: true, role: result.role });
  } catch (error) {
    if (error instanceof BackendError && error.status === 403) {
      const code = backendErrorCode(error);
      if (code === "account_suspended") {
        return NextResponse.json({ ok: false, error: "account_suspended" }, { status: 403 });
      }
      return NextResponse.json({ ok: false, error: "email_not_verified" }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "auth_failed" }, { status: 502 });
  }
}
