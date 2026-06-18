import "server-only";

import { backendFetch, BackendError } from "@/lib/api/client";
import { STOREFRONT_BRAND } from "@/lib/api/storefront";
import type { Locale } from "@/lib/i18n/config";
import type {
  BrowserData,
  CreateOrderInput,
  PaymentAuthorizeResponse,
  PaymentStatusResponse,
  PromoQuote,
  RedsysInSiteSession,
} from "@/lib/checkout/types";

/**
 * Server-only checkout primitives — the single place the checkout BFF talks to the
 * tatanka3 backend. The backend is the SOLE writer for orders/charges (CLAUDE.md):
 * these functions only validate + proxy and keep tokens off the client.
 *
 * Status (2026-06-15): the public storefront order/payment endpoints are not defined
 * yet, so the swap points below degrade gracefully:
 *   - `createOrder` returns a mock reference (preview).
 *   - `startPaymentSession` is gated by `CHECKOUT_PAYMENT_PROVIDER` and falls back to
 *     the preview path on any failure, so production stays on the "nothing charged"
 *     flow until the gateway is wired.
 * When the endpoints land, fill in the marked `backendFetch` calls — nothing else
 * (component, route shapes) changes. See `docs/redsys-insite-sandbox-runbook.md`.
 */

/**
 * Customer-facing storefront checkout surface, under the live `/api/storefront/v1`
 * mount (brand-scoped, JWT-or-guest, idempotent on writes). The backend maps each
 * to an existing operator service — see `docs/checkout-payment-contract.md`:
 *   orders    → ReservationService::createOctoHold / createConfirmedReservation
 *   promo     → OfferApplicationService (server-side apply, TOCTOU lock)
 *   session   → PaymentInitiationService::start(Reservation, Partner, idempotencyKey)
 *   authorize → AuthorizationService::authorize(PaymentTransaction, sdkParams, idempotencyKey)
 * Until they ship, the seams below degrade to the safe preview (nothing charged).
 */
const ORDER_PATH = "/api/storefront/v1/checkout/orders";
const PROMO_PATH = "/api/storefront/v1/checkout/promo";
const REDSYS_SESSION_PATH = "/api/storefront/v1/checkout/redsys/session";
const REDSYS_AUTHORIZE_PATH = "/api/storefront/v1/checkout/redsys/authorize";
const REDSYS_STATUS_PATH = "/api/storefront/v1/checkout/redsys/status";

type PaymentProvider = "none" | "redsys";

/** Active gateway. Server-only env (never `NEXT_PUBLIC_*`); defaults to the safe preview. */
function paymentProvider(): PaymentProvider {
  return process.env.CHECKOUT_PAYMENT_PROVIDER === "redsys" ? "redsys" : "none";
}

/**
 * Append the `?brand=` scope every storefront checkout endpoint requires (the
 * backend resolves brand → partner from it; without it the request 422s). Same
 * brand the read/availability seams send.
 */
function withBrand(path: string): string {
  return `${path}?brand=${encodeURIComponent(STOREFRONT_BRAND)}`;
}

/**
 * One booked slot as the backend order/promo endpoints expect it: a real slot id
 * plus the unit references + quantities. Prices are intentionally NOT sent — the
 * backend re-derives the authoritative total from the slot (offer integrity).
 */
interface OrderItem {
  slotId: string;
  units: { reference: string; quantity: number }[];
}

/** Cart line as carried client-side (subset we read). `key` is the unit reference. */
interface RawCartLine {
  key?: unknown;
  qty?: unknown;
}
/** Cart item as carried client-side (subset we read). */
interface RawCartItem {
  slotId?: unknown;
  lines?: unknown;
}

/**
 * Map raw cart items (forwarded by the BFF route) to the backend order shape.
 * Drops lines with no reference or non-positive qty; keeps the slot id verbatim
 * (empty until live availability ships → backend rejects, preview never sends).
 */
function toOrderItems(items: unknown[]): OrderItem[] {
  return items.map((raw) => {
    const it = (raw ?? {}) as RawCartItem;
    const lines = Array.isArray(it.lines) ? (it.lines as RawCartLine[]) : [];
    const units = lines
      .map((l) => ({ reference: String(l.key ?? ""), quantity: Number(l.qty) || 0 }))
      .filter((u) => u.reference !== "" && u.quantity > 0);
    return { slotId: typeof it.slotId === "string" ? it.slotId : "", units };
  });
}

/**
 * Stable idempotency key for an order attempt: deterministic over the booked
 * slots/units + customer email + promo, so a retry of the SAME order coalesces
 * on the backend instead of double-booking. FNV-1a (non-crypto, just stable).
 */
function orderIdempotencyKey(items: OrderItem[], customer: Record<string, unknown>, promo?: string): string {
  const seed = JSON.stringify({ items, email: customer.email ?? "", promo: promo ?? "" });
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `order-${(h >>> 0).toString(36)}`;
}

/** Card-form language: storefront locale → Redsys 2-letter code. */
const REDSYS_IDIOMA: Record<string, string> = { it: "IT", es: "ES", en: "EN" };
function idiomaFor(locale?: Locale): string {
  return (locale && REDSYS_IDIOMA[locale]) || "EN";
}

/** Placeholder order reference. The real reference will be issued by the backend. */
function makeReference(): string {
  // Runtime-only (request handler) — Date/random are fine here, unlike in SSR/render.
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  return `TM-${time}-${rand}`;
}

/**
 * Create an order (reservation) from the cart. Today: mock reference. When the
 * storefront order API lands, swap for the proxied write below — the backend then
 * owns the reference (and, with `provider=redsys`, the reservation that `start` reads).
 */
export async function createOrder(payload: CreateOrderInput): Promise<{ reference: string }> {
  // Preview gate: until the gateway is switched on (CHECKOUT_PAYMENT_PROVIDER=
  // redsys) the live site makes ZERO backend writes — it returns a mock
  // reference and nothing is reserved/charged. Flipping the env turns the whole
  // flow real (order + payment together). `participants`/`invoice`/`promoCode`
  // are collected ahead and forwarded once live.
  if (paymentProvider() !== "redsys") {
    void [ORDER_PATH, payload];
    return { reference: makeReference() };
  }

  const items = toOrderItems(payload.items);
  const raw = await backendFetch<{ reference?: string }>({
    path: withBrand(ORDER_PATH),
    method: "POST",
    headers: { "Idempotency-Key": orderIdempotencyKey(items, payload.customer, payload.promoCode) },
    // The backend re-validates + applies `promo_code` server-side here (offer
    // integrity: TOCTOU lock + per-user limits) — the step-2 quote is advisory.
    body: {
      items,
      customer: payload.customer,
      participants: payload.participants,
      invoice: payload.invoice ?? null,
      promo_code: payload.promoCode,
    },
    token: payload.token,
    locale: payload.locale,
  });
  if (!raw?.reference) throw new BackendError("order: missing reference", 502, raw);
  return { reference: raw.reference };
}

/** Server-side promo result (advisory quote). Never a client-computed discount. */
export type PromoQuoteResult =
  | { applied: true; quote: PromoQuote }
  | { applied: false; reason: "invalid" | "unavailable" };

/** Backend promo-quote response (snake_case), adapted below. `discount` in euros (cents/100). */
interface RawPromoQuote {
  code?: string;
  discount?: number;
  label?: string;
}

/**
 * Validate a promo code against the cart and return the discount the backend WOULD
 * apply (offer integrity stays server-side). This is a non-binding quote for the UI;
 * the authoritative apply happens at order creation (`promoCode` in the payload).
 * Until the endpoint is live every call degrades to `unavailable` — never a fake
 * discount. A `422` means the backend judged the code invalid for this cart.
 */
export async function quotePromo({
  code,
  items,
  locale,
}: {
  code: string;
  items: unknown[];
  locale?: Locale;
}): Promise<PromoQuoteResult> {
  try {
    const raw = await backendFetch<RawPromoQuote>({
      path: withBrand(PROMO_PATH),
      method: "POST",
      // Same `{ slotId, units }` shape the order endpoint binds, so the backend
      // quotes the discount against the exact cart it will later apply it to.
      body: { code, items: toOrderItems(items) },
      locale,
    });
    const amount = Number(raw.discount) || 0;
    if (amount <= 0) return { applied: false, reason: "invalid" };
    return { applied: true, quote: { code: raw.code ?? code, discount: amount, label: raw.label } };
  } catch (err) {
    const status = err instanceof BackendError ? err.status : 0;
    return { applied: false, reason: status === 422 ? "invalid" : "unavailable" };
  }
}

export type StartPaymentResult =
  | { provider: "redsys"; session: RedsysInSiteSession }
  | { provider: "none" };

/** Backend `start` response (snake_case), adapted below. */
interface RawRedsysSession {
  transaction_id: string;
  merchant_order: string;
  merchant_code: string;
  terminal: string;
  amount_cents: number;
  currency: string;
  signature_version: string;
  sdk_url: string;
  idioma?: string;
}

function adaptSession(raw: RawRedsysSession, locale?: Locale): RedsysInSiteSession {
  return {
    transactionId: raw.transaction_id,
    merchantOrder: raw.merchant_order,
    merchantCode: raw.merchant_code,
    terminal: raw.terminal,
    amountCents: raw.amount_cents,
    currency: raw.currency,
    signatureVersion: raw.signature_version,
    sdkUrl: raw.sdk_url,
    idioma: raw.idioma || idiomaFor(locale),
  };
}

/**
 * Open a Redsys InSite session for an existing order. Gated by the provider env so
 * that, until the gateway is live, checkout stays on the preview path with zero
 * backend traffic. Any failure (endpoint missing/unreachable) also degrades to preview.
 */
export async function startPaymentSession({
  reference,
  token,
  locale,
}: {
  reference: string;
  token?: string;
  locale?: Locale;
}): Promise<StartPaymentResult> {
  if (paymentProvider() !== "redsys") return { provider: "none" };
  try {
    // The backend resolves the reservation by `reference`, runs
    // PaymentInitiationService::start() and returns the InSite config.
    const raw = await backendFetch<RawRedsysSession>({
      path: withBrand(REDSYS_SESSION_PATH),
      method: "POST",
      body: { reference },
      token,
      locale,
    });
    return { provider: "redsys", session: adaptSession(raw, locale) };
  } catch (err) {
    console.warn(
      "[checkout] Redsys session unavailable, falling back to preview:",
      err instanceof Error ? err.message : err,
    );
    return { provider: "none" };
  }
}

/** Backend `authorize` response (snake_case), adapted below. */
interface RawAuthorize {
  status: "authorized" | "challenge" | "failed" | string;
  code?: string;
  acsURL?: string;
  creq?: string;
  protocol_version?: string;
}

/**
 * Authorize the charge with the idOper produced by the hosted card form. Mirrors
 * `AuthorizationService::authorize()`: authorized | challenge (3DS2) | failed.
 */
export async function authorizeRedsys({
  transactionId,
  idOper,
  token,
  locale,
  browser,
}: {
  transactionId: string;
  idOper: string;
  token?: string;
  locale?: Locale;
  browser?: BrowserData;
}): Promise<PaymentAuthorizeResponse> {
  // Proxy to AuthorizationService::authorize() on the backend. Body +
  // Idempotency-Key mirror the live POST /api/payments/redsys/authorize
  // contract: `sdkParams.browser` carries the EMV3DS data the 3DS2 leg requires.
  const raw = await backendFetch<RawAuthorize>({
    path: withBrand(REDSYS_AUTHORIZE_PATH),
    method: "POST",
    headers: { "Idempotency-Key": `redsys-authorize-${transactionId}` },
    body: {
      transaction_id: transactionId,
      sdkParams: { idOper, ...(browser ? { browser } : {}) },
    },
    token,
    locale,
  });

  if (raw.status === "authorized") return { ok: true, status: "authorized" };
  if (raw.status === "challenge") {
    return {
      ok: true,
      status: "challenge",
      acsURL: raw.acsURL ?? "",
      creq: raw.creq ?? "",
      protocolVersion: raw.protocol_version,
    };
  }
  return { ok: true, status: "failed", code: raw.code ?? "unknown" };
}

/** Backend `status` response (snake_case), adapted below. */
interface RawRedsysStatus {
  status: "authorized" | "failed" | "pending" | string;
  state?: string;
  reference?: string;
}

/**
 * Poll the charge outcome after a 3DS2 challenge. The customer completes the bank
 * challenge in the ACS iframe; the ACS posts `cres` server-side to the shared
 * `/payments/redsys/3ds-callback` leg, which closes the charge. This endpoint then
 * reports `authorized` | `failed` | `pending`. An unreachable backend / transient
 * error degrades to `pending` so the client keeps polling (it bounds its own retries),
 * never falsely confirming or failing a payment.
 */
export async function checkRedsysStatus({
  transactionId,
  token,
  locale,
}: {
  transactionId: string;
  token?: string;
  locale?: Locale;
}): Promise<PaymentStatusResponse> {
  try {
    const sp = new URLSearchParams({ brand: STOREFRONT_BRAND, transaction_id: transactionId });
    const raw = await backendFetch<RawRedsysStatus>({
      path: `${REDSYS_STATUS_PATH}?${sp.toString()}`,
      method: "GET",
      token,
      locale,
    });
    const status =
      raw.status === "authorized" || raw.status === "failed" ? raw.status : "pending";
    return { ok: true, status, reference: raw.reference, state: raw.state };
  } catch (err) {
    // Keep polling on transient/unknown failures — only the backend confirms/fails.
    void err;
    return { ok: true, status: "pending" };
  }
}
