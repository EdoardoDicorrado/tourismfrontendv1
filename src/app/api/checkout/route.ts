import { NextResponse, type NextRequest } from "next/server";

import { getSession } from "@/lib/account/session";
import { createOrder } from "@/lib/checkout/server";
import type { CreateOrderInput } from "@/lib/checkout/types";
import { isLocale } from "@/lib/i18n/config";
import { isEmail, isNonEmptyString } from "@/lib/validation";

/**
 * Checkout BFF — creates an order from the cart.
 *
 * ARCHITECTURE (CLAUDE.md): the tatanka3 backend is the SINGLE writer for orders
 * and bookings. This route validates the payload server-side and delegates the
 * write to `createOrder` (the swap point in `@/lib/checkout/server`). It must NEVER
 * persist orders itself (no DB, no dual-write).
 *
 * Payment is a separate, opt-in step: after the order exists the client opens a
 * gateway session via `POST /api/checkout/payment/session`. When no gateway is
 * configured that call returns `provider: "none"` and the client finalizes the
 * (mock) order — the current "nothing charged" preview.
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
    items?: unknown;
    customer?: unknown;
    participants?: unknown;
    invoice?: unknown;
    promoCode?: unknown;
    locale?: unknown;
  };
  const items = Array.isArray(data.items) ? data.items : [];
  const customer = (data.customer ?? {}) as Record<string, unknown>;
  // Optional, frontend-ready-ahead fields: passed through to the (preview) writer.
  const participants = Array.isArray(data.participants)
    ? (data.participants as CreateOrderInput["participants"])
    : undefined;
  const invoice =
    data.invoice && typeof data.invoice === "object"
      ? (data.invoice as CreateOrderInput["invoice"])
      : undefined;
  // Promo code is re-validated + applied server-side at order creation (offer integrity).
  const promoCode =
    typeof data.promoCode === "string" && data.promoCode.trim() ? data.promoCode.trim() : undefined;

  if (items.length === 0) {
    return NextResponse.json({ ok: false, error: "empty_cart" }, { status: 400 });
  }
  for (const field of ["firstName", "lastName", "email"] as const) {
    if (!isNonEmptyString(customer[field])) {
      return NextResponse.json({ ok: false, error: `missing_${field}` }, { status: 400 });
    }
  }
  if (!isEmail(customer.email as string)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  try {
    const locale = typeof data.locale === "string" && isLocale(data.locale) ? data.locale : undefined;
    // Bind the order to the logged-in account when there is one — customer (B2C)
    // or agency (B2B: the backend applies agency pricing/commission off the same
    // token). Guest checkout (contact inline) when there's no session.
    const session = await getSession();
    const token = session?.token;
    const order = await createOrder({ items, customer, participants, invoice, promoCode, token, locale });
    return NextResponse.json({ ok: true, reference: order.reference });
  } catch {
    return NextResponse.json({ ok: false, error: "order_failed" }, { status: 502 });
  }
}
