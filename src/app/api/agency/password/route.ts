import { NextResponse, type NextRequest } from "next/server";

import { changeAgencyPassword } from "@/lib/account/client";
import { getSession } from "@/lib/account/session";
import { isNonEmptyString } from "@/lib/validation";

/**
 * Agency password BFF — change the logged-in agency user's password.
 *
 * Mirrors tatanka2's UpdatePasswordForm: requires the current password plus a
 * matching new/confirm pair. The seam returns `false` when the current password
 * is wrong (→ 422 `wrong_current`); a confirm mismatch is caught here (→ 422
 * `mismatch`) without hitting the seam.
 *
 * Auth: agency session from the httpOnly cookie; its bearer token is forwarded
 * to `@/lib/account/client` → `backendFetch` (single writer).
 */

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "agency") {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

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

  try {
    const ok = await changeAgencyPassword(data.current_password, data.new_password, session.token);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "wrong_current" }, { status: 422 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "password_failed" }, { status: 502 });
  }
}
