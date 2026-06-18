import { NextResponse, type NextRequest } from "next/server";

import { getSession } from "@/lib/account/session";
import { authorizeRedsys } from "@/lib/checkout/server";
import type { BrowserData } from "@/lib/checkout/types";
import { isLocale } from "@/lib/i18n/config";

/**
 * Payment authorize BFF — completes a Redsys InSite payment with the idOper token
 * produced by the hosted card form. Proxies to the backend `authorize` service and
 * relays its outcome: authorized | challenge (3DS2) | failed.
 *
 * The card PAN never reaches us — only the single-use `idOper` does (PCI SAQ-A).
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
    transactionId?: unknown;
    idOper?: unknown;
    locale?: unknown;
    browser?: unknown;
  };
  if (typeof data.transactionId !== "string" || data.transactionId.trim().length === 0) {
    return NextResponse.json({ ok: false, error: "missing_transaction" }, { status: 400 });
  }
  if (typeof data.idOper !== "string" || data.idOper.trim().length === 0) {
    return NextResponse.json({ ok: false, error: "missing_idoper" }, { status: 400 });
  }

  // EMV3DS browser block: the cardholder browser can't read its own Accept
  // header, so the BFF fills `browserAcceptHeader` from the incoming request.
  let browser: BrowserData | undefined;
  if (data.browser && typeof data.browser === "object") {
    browser = {
      ...(data.browser as BrowserData),
      browserAcceptHeader:
        (data.browser as BrowserData).browserAcceptHeader ??
        request.headers.get("accept") ??
        undefined,
    };
  }

  try {
    const locale = typeof data.locale === "string" && isLocale(data.locale) ? data.locale : undefined;
    // Customer (B2C) or agency (B2B) token both forward; guest when absent.
    const session = await getSession();
    const token = session?.token;
    const result = await authorizeRedsys({
      transactionId: data.transactionId,
      idOper: data.idOper,
      token,
      locale,
      browser,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ok: false, error: "authorize_failed" }, { status: 502 });
  }
}
