import "server-only";

import { backendFetch, BackendError } from "@/lib/api/client";
import type { Locale } from "@/lib/i18n/config";

import type {
  AgencyApiAccess,
  AgencyAuthResult,
  AgencyProfile,
  AgencyProfilePatch,
  AgencySignupPayload,
  AgencySignupResult,
  Booking,
  BookingPatch,
  BookingTab,
  CustomerAuthResult,
  CustomerRegisterPayload,
  CustomerRegisterResult,
  DiscountCode,
  DiscountCodeProductList,
  DiscountCodeUsage,
  Paginated,
  PaymentInfo,
  PaymentInfoPatch,
} from "./types";

/**
 * Account client — THE SEAM.
 *
 * The single module pages and BFF route handlers read account data from. Every
 * function calls the tatanka3 storefront API (`/api/storefront/v1`) via
 * `backendFetch`, keeping the bearer token server-side. The backend does NOT
 * wrap responses (`withoutWrapping()`): single resources are bare objects and
 * lists are `{ items, meta }`, so the return types here match the Resources 1:1.
 *
 * `server-only`: keeps the bearer token off the client. Tokens are read from the
 * httpOnly cookie by `./session` and passed in here as `token`.
 *
 * Error convention: read calls that can legitimately be "absent" (404, or a 403
 * out-of-scope) resolve to `null`; bad-credentials/validation on a write resolve
 * to `null`/`false` so callers can branch without a try/catch. Everything else
 * (5xx, network) propagates as `BackendError`.
 */

const BASE = "/api/storefront/v1";

function qs(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") sp.set(key, String(value));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** True when the error is a BackendError with one of the given statuses. */
function isStatus(err: unknown, ...statuses: number[]): boolean {
  return err instanceof BackendError && statuses.includes(err.status);
}

/**
 * A fresh idempotency key. The storefront `StorefrontIdempotency` middleware
 * REQUIRES an `Idempotency-Key` header on every guarded write (signup + all
 * account/agency mutations) and rejects the request 400 `idempotency_key_required`
 * without it. A new UUID per call is correct here: `backendFetch` never auto-retries,
 * so each call is one logical operation; the header just satisfies the contract and
 * makes any accidental replay (same key + same body) safe.
 */
function idempotencyKey(): string {
  return crypto.randomUUID();
}

// ── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Customer login (email + password). Returns an AuthResult on success, or `null`
 * on bad credentials (401). A `403` (email_unverified / account_suspended)
 * propagates so the BFF can surface the specific message.
 */
export async function customerLogin(
  email: string,
  password: string,
  locale?: Locale,
): Promise<CustomerAuthResult | null> {
  try {
    return await backendFetch<CustomerAuthResult>({
      path: `${BASE}/auth/customer/login`,
      method: "POST",
      body: { email, password },
      locale,
    });
  } catch (err) {
    if (isStatus(err, 401)) return null;
    throw err; // 403 email_unverified / account_suspended → BFF maps it
  }
}

/**
 * Customer registration (classic email+password). Returns `{ status:
 * "pending_verification" }` — double opt-in, no session is issued. A `422`
 * (e.g. email already in use) propagates so the BFF can read
 * `BackendError.body.error.details`.
 */
export async function customerRegister(
  payload: CustomerRegisterPayload,
  locale?: Locale,
): Promise<CustomerRegisterResult> {
  return backendFetch<CustomerRegisterResult>({
    path: `${BASE}/auth/customer/register`,
    method: "POST",
    body: payload,
    locale,
    headers: { "Idempotency-Key": idempotencyKey() },
  });
}

/**
 * Verify a customer email from the link token. Returns `true` on success, `false`
 * on an invalid/expired token (400/404).
 */
export async function customerVerifyEmail(token: string, locale?: Locale): Promise<boolean> {
  try {
    await backendFetch({
      path: `${BASE}/auth/email/verify/${encodeURIComponent(token)}`,
      locale,
    });
    return true;
  } catch (err) {
    if (isStatus(err, 400, 404)) return false;
    throw err;
  }
}

/** Resend the verification email. Always resolves (anti-enumeration). */
export async function customerResendVerification(email: string, locale?: Locale): Promise<void> {
  await backendFetch({
    path: `${BASE}/auth/email/resend`,
    method: "POST",
    body: { email },
    locale,
  });
}

/**
 * Agency login (email + password). Returns an AuthResult on success, `null` on
 * bad credentials (401). A `403 agency_not_active` propagates so the BFF can
 * surface the specific error.
 */
export async function agencyLogin(
  email: string,
  password: string,
  locale?: Locale,
): Promise<AgencyAuthResult | null> {
  try {
    return await backendFetch<AgencyAuthResult>({
      path: `${BASE}/auth/agency/login`,
      method: "POST",
      body: { email, password },
      locale,
    });
  } catch (err) {
    if (isStatus(err, 401)) return null;
    throw err; // 403 agency_not_active → BFF maps it
  }
}

/** Agency signup. Creates an inactive agency + user awaiting admin activation. */
export async function agencySignup(
  payload: AgencySignupPayload,
  locale?: Locale,
): Promise<AgencySignupResult> {
  return backendFetch<AgencySignupResult>({
    path: `${BASE}/auth/agency/signup`,
    method: "POST",
    body: payload,
    locale,
    headers: { "Idempotency-Key": idempotencyKey() },
  });
}

/** Async availability check for a signup email. `true` = free to use. */
export async function validateAgencyEmail(email: string, locale?: Locale): Promise<boolean> {
  const res = await backendFetch<{ available: boolean }>({
    path: `${BASE}/auth/agency/signup/validate-email`,
    method: "POST",
    body: { email },
    locale,
  });
  return res.available;
}

/** Request a password reset email (agency + customer). Always resolves (anti-enumeration). */
export async function requestPasswordReset(email: string, locale?: Locale): Promise<void> {
  await backendFetch({
    path: `${BASE}/auth/password/forgot`,
    method: "POST",
    body: { email },
    locale,
  });
}

/**
 * Complete a password reset. The Laravel stock broker keys on email + token, so
 * BOTH are required. Returns `false` on an invalid/expired token (400) or a
 * validation error on the new password (422).
 */
export async function resetPassword(
  email: string,
  token: string,
  password: string,
  locale?: Locale,
): Promise<boolean> {
  try {
    await backendFetch({
      path: `${BASE}/auth/password/reset`,
      method: "POST",
      body: { email, token, password, password_confirm: password },
      locale,
    });
    return true;
  } catch (err) {
    if (isStatus(err, 400, 422)) return false;
    throw err;
  }
}

/** Revoke the current token server-side (best-effort). */
export async function logout(token: string): Promise<void> {
  try {
    await backendFetch({ path: `${BASE}/auth/logout`, method: "POST", token });
  } catch (err) {
    // A revoked/expired token (401) is fine — we're logging out anyway.
    if (!isStatus(err, 401)) throw err;
  }
}

// ── Bookings ─────────────────────────────────────────────────────────────────

/**
 * List bookings for the current session scope (customer = all the user's
 * reservations, agency = all agency bookings — enforced by the token). Filters
 * by tab + free-text code/email search, paginated.
 */
export function getBookings(args: {
  token: string;
  tab?: BookingTab;
  q?: string;
  page?: number;
  perPage?: number;
}): Promise<Paginated<Booking>> {
  const { token, tab = "all", q, page, perPage } = args;
  return backendFetch<Paginated<Booking>>({
    path: `${BASE}/account/bookings${qs({ tab, q, page, per_page: perPage })}`,
    token,
  });
}

/** Single booking with full detail (lines → unit items → participants). `null` if not found. */
export async function getBooking(uuid: string, token: string): Promise<Booking | null> {
  try {
    return await backendFetch<Booking>({
      path: `${BASE}/account/bookings/${encodeURIComponent(uuid)}`,
      token,
    });
  } catch (err) {
    if (isStatus(err, 404)) return null;
    throw err;
  }
}

/**
 * Update a booking (participants + hotel + pickup/dropoff). Returns the updated
 * booking, or `null` if not found (404). A `403 booking_not_editable`
 * propagates so the caller can message it.
 */
export async function updateBooking(
  uuid: string,
  patch: BookingPatch,
  token: string,
): Promise<Booking | null> {
  try {
    return await backendFetch<Booking>({
      path: `${BASE}/account/bookings/${encodeURIComponent(uuid)}`,
      method: "PATCH",
      body: patch,
      token,
      headers: { "Idempotency-Key": idempotencyKey() },
    });
  } catch (err) {
    if (isStatus(err, 404)) return null;
    throw err;
  }
}

/**
 * Cancel a single slot line. Returns the updated booking on success, or `null`
 * when the booking/line isn't found (404). A `403 booking_not_editable`
 * propagates so the caller can message it.
 */
export async function cancelBookingLine(
  uuid: string,
  lineId: string,
  token: string,
): Promise<Booking | null> {
  try {
    return await backendFetch<Booking>({
      path: `${BASE}/account/bookings/${encodeURIComponent(uuid)}/lines/${encodeURIComponent(lineId)}`,
      method: "DELETE",
      token,
      headers: { "Idempotency-Key": idempotencyKey() },
    });
  } catch (err) {
    if (isStatus(err, 404)) return null;
    throw err;
  }
}

// ── Agency profile / payment / password ──────────────────────────────────────

/** Agency profile (user + company). */
export function getAgencyProfile(token: string): Promise<AgencyProfile> {
  return backendFetch<AgencyProfile>({ path: `${BASE}/agency/profile`, token });
}

/** Update agency profile (editable fields only). Returns the updated profile. */
export function updateAgencyProfile(
  patch: AgencyProfilePatch,
  token: string,
): Promise<AgencyProfile> {
  return backendFetch<AgencyProfile>({
    path: `${BASE}/agency/profile`,
    method: "PATCH",
    body: patch,
    token,
    headers: { "Idempotency-Key": idempotencyKey() },
  });
}

/** Agency payment info (sensitive fields masked on read). */
export function getPaymentInfo(token: string): Promise<PaymentInfo> {
  return backendFetch<PaymentInfo>({ path: `${BASE}/agency/payment`, token });
}

/** Update agency payment info (cleartext write-only). Returns the updated (masked) info. */
export function updatePaymentInfo(
  patch: PaymentInfoPatch,
  token: string,
): Promise<PaymentInfo> {
  return backendFetch<PaymentInfo>({
    path: `${BASE}/agency/payment`,
    method: "PATCH",
    body: patch,
    token,
    headers: { "Idempotency-Key": idempotencyKey() },
  });
}

/**
 * Change the agency password. Returns `true` on success, `false` when the
 * current password is wrong or the new one fails validation (422).
 */
export async function changeAgencyPassword(
  current: string,
  next: string,
  token: string,
): Promise<boolean> {
  try {
    await backendFetch({
      path: `${BASE}/agency/password`,
      method: "POST",
      body: { current_password: current, new_password: next, new_password_confirm: next },
      token,
      headers: { "Idempotency-Key": idempotencyKey() },
    });
    return true;
  } catch (err) {
    if (isStatus(err, 422)) return false;
    throw err;
  }
}

/** OCTO API access panel data. `null` when the user isn't API-enabled (403). */
export async function getAgencyApiAccess(token: string): Promise<AgencyApiAccess | null> {
  try {
    return await backendFetch<AgencyApiAccess>({ path: `${BASE}/agency/api-access`, token });
  } catch (err) {
    if (isStatus(err, 403)) return null;
    throw err;
  }
}

// ── Discount codes ────────────────────────────────────────────────────────────

/** List the agency partner's discount codes (filter by code/name, paginated). */
export function getDiscountCodes(args: {
  token: string;
  code?: string;
  name?: string;
  page?: number;
  perPage?: number;
}): Promise<Paginated<DiscountCode>> {
  const { token, code, name, page, perPage } = args;
  return backendFetch<Paginated<DiscountCode>>({
    path: `${BASE}/agency/discount-codes${qs({ code, name, page, per_page: perPage })}`,
    token,
  });
}

/** Usage rows for a discount code. `null` when the code isn't the agency's (403/404). */
export async function getDiscountCodeUsage(
  offerCodeId: string,
  args: { token: string; page?: number },
): Promise<Paginated<DiscountCodeUsage> | null> {
  try {
    return await backendFetch<Paginated<DiscountCodeUsage>>({
      path: `${BASE}/agency/discount-codes/${encodeURIComponent(offerCodeId)}/usage${qs({ page: args.page })}`,
      token: args.token,
    });
  } catch (err) {
    if (isStatus(err, 403, 404)) return null;
    throw err;
  }
}

/**
 * Product scope for a discount code's offer. `null` when not the agency's
 * (403/404). When the offer has no product scope, `all_products` is `true` and
 * `items` is empty (applies to all the partner's products).
 */
export async function getDiscountCodeProducts(
  offerId: string,
  args: { token: string; page?: number },
): Promise<DiscountCodeProductList | null> {
  try {
    return await backendFetch<DiscountCodeProductList>({
      path: `${BASE}/agency/discount-codes/${encodeURIComponent(offerId)}/products${qs({ page: args.page })}`,
      token: args.token,
    });
  } catch (err) {
    if (isStatus(err, 403, 404)) return null;
    throw err;
  }
}
