import { NextResponse, type NextRequest } from "next/server";

import { getSession } from "@/lib/account/session";
import { isNonEmptyString } from "@/lib/validation";

/**
 * Customer password BFF — change the logged-in customer's password.
 *
 * PREVIEW: there is no customer password endpoint on the storefront API yet (only
 * the agency has `POST /agency/password`). This validates shape + customer session
 * and mock-confirms. Swap the mock for a real `changeCustomerPassword(...)` seam
 * call once the backend lands (full-stack task #37/#44 seam family).
 *
 * Auth: customer session from the httpOnly cookie.
 */

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "customer") {
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

  // PREVIEW: no backend — accept any non-empty current password.
  return NextResponse.json({ ok: true });
}
