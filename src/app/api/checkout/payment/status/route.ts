import { NextResponse, type NextRequest } from "next/server";

import { getSession } from "@/lib/account/session";
import { checkRedsysStatus } from "@/lib/checkout/server";
import { isLocale } from "@/lib/i18n/config";

/**
 * Payment status BFF — the post-challenge poll (3DS2). After the ACS iframe is
 * mounted, the client polls this until the charge leaves `pending`: `authorized`
 * routes to confirmation, `failed` re-arms the card form. The challenge itself is
 * closed server-side on the shared `/payments/redsys/3ds-callback` leg; here we only
 * relay the outcome. Read-only — no idempotency, no body.
 */

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const transactionId = request.nextUrl.searchParams.get("transactionId");
  if (!transactionId || transactionId.trim().length === 0) {
    return NextResponse.json({ ok: false, error: "missing_transaction" }, { status: 400 });
  }

  const langParam = request.nextUrl.searchParams.get("lang");
  const locale = langParam && isLocale(langParam) ? langParam : undefined;

  try {
    // Customer (B2C) or agency (B2B) token both forward; guest when absent.
    const session = await getSession();
    const token = session?.token;
    const result = await checkRedsysStatus({ transactionId, token, locale });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ok: false, error: "status_failed" }, { status: 502 });
  }
}
