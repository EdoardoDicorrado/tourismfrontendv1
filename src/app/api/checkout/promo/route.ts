import { NextResponse, type NextRequest } from "next/server";

import { quotePromo } from "@/lib/checkout/server";
import { isLocale } from "@/lib/i18n/config";

/**
 * Promo BFF — validates a promo code against the cart and returns the discount the
 * backend WOULD apply.
 *
 * OFFER INTEGRITY (CLAUDE.md): the discount is computed server-side only; this route
 * never derives one. The response is a non-binding quote for the summary — the
 * authoritative apply happens at order creation (`promoCode` in `POST /api/checkout`),
 * where the backend re-validates under a lock. Until the storefront promo endpoint is
 * live, `quotePromo` degrades to `applied: false, reason: "unavailable"`.
 */

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const data = (body ?? {}) as { code?: unknown; items?: unknown; locale?: unknown };
  const code = typeof data.code === "string" ? data.code.trim() : "";
  if (!code) {
    return NextResponse.json({ ok: false, error: "missing_code" }, { status: 400 });
  }
  const items = Array.isArray(data.items) ? data.items : [];
  if (items.length === 0) {
    return NextResponse.json({ ok: false, error: "empty_cart" }, { status: 400 });
  }

  try {
    const locale = typeof data.locale === "string" && isLocale(data.locale) ? data.locale : undefined;
    const result = await quotePromo({ code, items, locale });
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ ok: false, error: "promo_failed" }, { status: 502 });
  }
}
