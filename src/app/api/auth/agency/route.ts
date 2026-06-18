import { NextResponse, type NextRequest } from "next/server";

import { agencyLogin } from "@/lib/account/client";
import { setSession } from "@/lib/account/session";
import { BackendError } from "@/lib/api/client";
import { isLocale, type Locale } from "@/lib/i18n/config";

/**
 * Agency login BFF (email + password).
 *
 * ARCHITECTURE (CLAUDE.md): the browser never sees the bearer token. This route
 * validates the payload, asks the account-client seam to authenticate, and on
 * success stores the session in the httpOnly cookie via `setSession()` (only
 * possible inside a Route Handler / Server Action). The response carries NO token
 * — just `{ ok: true }` plus the role the client uses to route.
 *
 * Error mapping mirrors the contract: `null` from `agencyLogin` → 401
 * `bad_credentials`; the seam rethrows a `403` for an inactive agency, which we
 * surface as `agency_not_active` so the form shows the dedicated message.
 */

export const dynamic = "force-dynamic";

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
    const result = await agencyLogin(data.email, data.password, locale);
    if (!result) {
      // Bad credentials (the seam returns null; a real 401 maps here too).
      return NextResponse.json({ ok: false, error: "bad_credentials" }, { status: 401 });
    }
    await setSession(result);
    return NextResponse.json({ ok: true, role: result.role });
  } catch (error) {
    // The seam rethrows a 403 from the backend for an agency that exists but
    // isn't active yet (awaiting admin approval). Surface it specifically.
    if (error instanceof BackendError && error.status === 403) {
      return NextResponse.json({ ok: false, error: "agency_not_active" }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "auth_failed" }, { status: 502 });
  }
}
