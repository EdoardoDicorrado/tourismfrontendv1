import type { Locale } from "@/lib/i18n/config";

/**
 * Checkout + payment contract shared by the client (CheckoutView, RedsysInSiteForm)
 * and the BFF route handlers. No `server-only` imports here so it is safe to import
 * from client components. The server-side proxies live in `@/lib/checkout/server`.
 *
 * The Redsys shapes mirror the backend services documented in
 * `docs/redsys-insite-sandbox-runbook.md`:
 *   - `PaymentInitiationService::start()` → {@link RedsysInSiteSession}
 *   - `AuthorizationService::authorize()` → {@link PaymentAuthorizeResponse}
 */

/** One participant's name, collected per booked unit. */
export interface CheckoutParticipant {
  /** Cart item this participant belongs to. */
  itemId: string;
  /** Tier label, e.g. "Adulto 1". */
  label: string;
  firstName: string;
  lastName: string;
}

/** Billing/invoice data, collected only when the customer requests an invoice. */
export interface CheckoutInvoice {
  name: string;
  taxId: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

/**
 * Validated order-creation payload forwarded to the backend (single writer).
 *
 * `participants` and `invoice` are collected client-side and sent now so the
 * frontend is ready ahead of the backend order endpoint (same pattern as the
 * EMV3DS browser block) — the preview `createOrder` accepts and ignores them
 * until the storefront order API lands and persists them.
 */
export interface CreateOrderInput {
  items: unknown[];
  customer: Record<string, unknown>;
  participants?: CheckoutParticipant[];
  invoice?: CheckoutInvoice | null;
  /**
   * Promo code to bind to the order. The backend re-validates and applies it
   * server-side at order creation (offer integrity: TOCTOU lock + per-user limits) —
   * the quote shown during checkout is advisory, never the authority.
   */
  promoCode?: string;
  /**
   * Storefront JWT (customer B2C or agency B2B), forwarded as `Authorization:
   * Bearer` so the order binds to the logged-in account — for an agency the
   * backend applies its pricing/commission off the same token. Set server-side
   * by the BFF route from the session cookie (never from the browser); absent =
   * guest checkout (contact inline).
   */
  token?: string;
  locale?: Locale;
}

/**
 * A server-validated promo quote. Display-only: the discount shown in the summary
 * comes from the backend, never computed client-side. The authoritative binding
 * happens at order creation via {@link CreateOrderInput.promoCode}.
 */
export interface PromoQuote {
  code: string;
  /**
   * Discount amount in the storefront's display unit (euros, i.e. cents/100 — the
   * same scale as cart prices and `priceFrom`), so it subtracts directly from the
   * cart total. Always server-provided.
   */
  discount: number;
  /** Optional human label for the discount line, e.g. "Sconto estate -10%". */
  label?: string;
}

/**
 * Result of `POST /api/checkout/promo`. `applied: false` carries a `reason` so the
 * UI can tell "code not valid" apart from "feature not live yet" — and in NO case
 * does the client apply a discount on its own.
 */
export type PromoApplyResponse =
  | { ok: true; applied: true; quote: PromoQuote }
  | { ok: true; applied: false; reason: "invalid" | "unavailable" }
  | { ok: false; error: string };

/**
 * EMV3DS browser data, collected client-side and forwarded to the backend as
 * `sdkParams.browser`. Required by the 3DS2 authentication leg (trataPeticion):
 * without it Redsys rejects the SCA with SIS0754. `browserAcceptHeader` is filled
 * server-side in the BFF (the browser cannot read its own Accept header).
 */
export interface BrowserData {
  threeDSCompInd: "Y" | "N" | "U";
  browserJavaEnabled: boolean;
  browserJavascriptEnabled: boolean;
  browserLanguage: string;
  browserColorDepth: string;
  browserScreenHeight: string;
  browserScreenWidth: string;
  browserTZ: string;
  browserUserAgent: string;
  browserAcceptHeader?: string;
}

/**
 * Redsys InSite session config — everything the hosted card form needs to mount
 * in the browser. Produced server-side by the backend `start` call; the card PAN
 * never touches our servers (PCI SAQ-A).
 */
export interface RedsysInSiteSession {
  /** Backend PaymentTransaction id — required to authorize the resulting idOper. */
  transactionId: string;
  /** 12-char Redsys order bound server-side to this charge (the "order" field). */
  merchantOrder: string;
  /** Redsys commerce code (FUC). */
  merchantCode: string;
  /** Redsys terminal number. */
  terminal: string;
  /** Authoritative amount in cents (display/echo only — the backend re-derives it). */
  amountCents: number;
  /** ISO 4217 numeric currency, e.g. "978" (EUR). */
  currency: string;
  /** Signature scheme negotiated with the merchant, e.g. "HMAC_SHA256_V1". */
  signatureVersion: string;
  /** Hosted-fields JS to load (the backend picks the sandbox vs prod URL). */
  sdkUrl: string;
  /** Card-form UI language, Redsys 2-letter code (e.g. "ES", "EN", "IT"). */
  idioma: string;
}

/** Result of `POST /api/checkout/payment/session`. */
export type PaymentSessionResponse =
  /** A live gateway issued a session → mount the InSite card form. */
  | { ok: true; provider: "redsys"; session: RedsysInSiteSession }
  /** No gateway configured/available yet → preview path (mock order, nothing charged). */
  | { ok: true; provider: "none" }
  | { ok: false; error: string };

/** Result of `POST /api/checkout/payment/authorize`, mirrors the backend authorize statuses. */
export type PaymentAuthorizeResponse =
  /** Signature OK + frictionless authorization. */
  | { ok: true; status: "authorized" }
  /** Signature OK, bank requires 3DS2 challenge (acsURL + creq to complete). */
  | { ok: true; status: "challenge"; acsURL: string; creq: string; protocolVersion?: string }
  /** Signature OK, card declined (Redsys response code, e.g. "0190"). */
  | { ok: true; status: "failed"; code: string }
  | { ok: false; error: string };

/**
 * Result of `GET /api/checkout/payment/status` — the post-challenge poll (3DS2).
 * After mounting the ACS iframe the client polls this until `status` leaves
 * `pending`: `authorized` → confirmation, `failed` → retry on the card form. The
 * challenge itself completes server-side (the ACS posts `cres` to the backend
 * `/payments/redsys/3ds-callback` leg); the client only reads the outcome here.
 */
export type PaymentStatusResponse =
  | { ok: true; status: "authorized" | "failed" | "pending"; reference?: string; state?: string }
  | { ok: false; error: string };

/** Result of `POST /api/checkout/verify` with `action: "send"` — OTP email dispatch. */
export type VerifySendResponse = { ok: true; sent: boolean } | { ok: false; error: string };

/** Result of `POST /api/checkout/verify` with `action: "check"` — OTP validation. */
export type VerifyCheckResponse =
  | { ok: true; verified: true }
  | { ok: true; verified: false; reason: "invalid" | "expired" | "unavailable" }
  | { ok: false; error: string };

/** Result of `POST /api/checkout/referral` — the "how did you find us" answer. */
export type ReferralResponse = { ok: boolean; error?: string };
