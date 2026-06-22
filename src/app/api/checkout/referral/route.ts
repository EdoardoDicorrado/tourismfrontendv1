import { NextResponse, type NextRequest } from "next/server";

import { submitReferral } from "@/lib/checkout/server";
import { isLocale } from "@/lib/i18n/config";

/**
 * Referral BFF (`POST /api/checkout/referral`) — records the post-order
 * "how did you find us?" answer. Body: `{ reference?, referral, email?, locale? }`.
 *
 * The storefront feedback endpoint is not defined yet (CLAUDE.md): until
 * `CHECKOUT_AUTH_LIVE=true` `submitReferral` accepts and drops the answer (preview),
 * so the confirmation survey works without a backend.
 */

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const data = (body ?? {}) as { reference?: unknown; referral?: unknown; email?: unknown; locale?: unknown };
  const referral = typeof data.referral === "string" ? data.referral.trim() : "";
  if (!referral) {
    return NextResponse.json({ ok: false, error: "missing_referral" }, { status: 400 });
  }
  const reference = typeof data.reference === "string" ? data.reference : undefined;
  const email = typeof data.email === "string" ? data.email : undefined;
  const locale = typeof data.locale === "string" && isLocale(data.locale) ? data.locale : undefined;

  try {
    const { ok } = await submitReferral({ reference, referral, email, locale });
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false, error: "referral_failed" }, { status: 502 });
  }
}
