import { NextResponse, type NextRequest } from "next/server";

import { getSession } from "@/lib/account/session";
import { startPaymentSession } from "@/lib/checkout/server";
import { isLocale } from "@/lib/i18n/config";

/**
 * Payment session BFF — opens a card-payment session for an already-created order.
 *
 * Returns `{ provider: "redsys", session }` when a live gateway issues an InSite
 * session, or `{ provider: "none" }` when none is configured (the client then
 * finalizes the preview/mock order). Keeps any backend tokens server-side.
 */

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const data = (body ?? {}) as { reference?: unknown; locale?: unknown };
  if (typeof data.reference !== "string" || data.reference.trim().length === 0) {
    return NextResponse.json({ ok: false, error: "missing_reference" }, { status: 400 });
  }

  try {
    const locale = typeof data.locale === "string" && isLocale(data.locale) ? data.locale : undefined;
    // Customer (B2C) or agency (B2B) token both forward; guest when absent.
    const session = await getSession();
    const token = session?.token;
    const result = await startPaymentSession({ reference: data.reference, token, locale });
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ ok: false, error: "session_failed" }, { status: 502 });
  }
}
