/**
 * Area Riservata — TypeScript types mirroring the tatanka3 storefront API
 * (`/api/storefront/v1`), tranche 1 (auth + account + agency).
 *
 * Source of truth: the REAL backend serializers/controllers, not the proposal.
 * Key conventions (verified against the code):
 *   - NO `{ data }` wrapper — `JsonResource::withoutWrapping()` is global, so
 *     single resources are bare objects and lists are `{ items, meta }`.
 *   - Money is integer minor units: `{ amount_cents, currency }`.
 *   - Reservation has TWO orthogonal status axes: `state` (lifecycle) and
 *     `payment_status` (derived from balance/amount_paid).
 *   - Bookings are `lines[] → unit_items[] → participants[]`; the hotel is ONE
 *     per reservation (not per line). Participants/hotel/pickup/dropoff are
 *     returned only by the DETAIL endpoint.
 *
 * These are the shapes the account client seam (`@/lib/account/client`) returns,
 * matching the backend Resources 1:1 so callers map directly.
 */

// ── Primitives / value objects ──────────────────────────────────────────────

/** Money in minor units (cents). `12000` = €120,00. Format by dividing by 100. */
export interface Money {
  /** Amount in minor units (cents). */
  amount_cents: number;
  /** ISO 4217 currency code, e.g. "EUR". */
  currency: string;
}

/** Pagination meta echoed by every list endpoint. */
export interface PageMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  /** Echoes the requested bookings tab; present on the bookings list only. */
  tab?: BookingTab;
}

/** Generic paginated list envelope (`{ items, meta }` — NOT `{ data }`). */
export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

// ── Bookings ─────────────────────────────────────────────────────────────────

/** Reservation lifecycle state (`reservations.state`). */
export type ReservationState =
  | "pending"
  | "on_hold"
  | "confirmed"
  | "cancelled"
  | "expired"
  | "redeemed"
  | string;

/** How the reservation was created (`reservations.origin`). */
export type ReservationOrigin = "web" | "octo" | "admin" | string;

/** Derived payment bucket (`Reservation::paymentStatusKey()`, lowercase). */
export type PaymentStatus = "paid" | "partial" | "open" | "overpaid" | string;

/** Line / unit-item / participant state. */
export type LineState = "active" | "cancelled" | string;

/** Tabs for the bookings list. The backend derives temporality from slot starts. */
export type BookingTab = "all" | "current" | "travelled" | "cancelled";

/** Denormalized buyer on the reservation (split from `customer_name`). */
export interface BookingCustomer {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
}

/** A passenger, hanging off a unit item. Returned only in the DETAIL view. */
export interface BookingParticipant {
  id: string;
  position: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_prefix: string | null;
  phone: string | null;
  /** Date only, "YYYY-MM-DD". The adult/child distinction is derived from this. */
  birth_date: string | null;
  passport: string | null;
  identity_document: string | null;
  nationality: string | null;
  state: LineState;
}

/** A fare line within a slot line (per `option_unit`/tariff). */
export interface BookingUnitItem {
  id: string;
  /** e.g. "Adult", "Child" (snapshot, already localized at booking time). */
  unit_label: string | null;
  unit_type: string | null;
  quantity: number;
  state: LineState;
  unit_price: Money;
  total: Money;
  /** Present only in the DETAIL view. */
  participants?: BookingParticipant[];
}

/** A single time slot (orario) inside a booking — a `ReservationLine`. */
export interface BookingLine {
  id: string;
  product_name: string | null;
  option_name: string | null;
  /**
   * ISO 8601 with Europe/Rome offset, e.g. "2026-07-10T09:30:00+02:00".
   * NB: the backend does NOT return a product slug here — no deep link by slug
   * until the line serializer adds `product_slug` (tranche 2 backend gap).
   */
  slot_start: string | null;
  participant_count: number;
  state: LineState;
  unit_items: BookingUnitItem[];
}

/** Hotel pickup details — ONE per reservation. Detail view only; editable via PATCH. */
export interface BookingHotel {
  hotel_name: string | null;
  hotel_street_address: string | null;
  hotel_street_number: string | null;
  hotel_city: string | null;
  hotel_postal_code: string | null;
  booking_name_at_hotel: string | null;
  room_number: string | null;
  front_desk_phone: string | null;
  front_desk_language: string | null;
  latitude: number | null;
  longitude: number | null;
}

/** Pickup request on the reservation. Detail view only; editable via PATCH. */
export interface BookingPickup {
  pickup_requested: boolean;
  pickup_location_id: string | null;
  pickup_notes: string | null;
}

/** Dropoff request on the reservation. Detail view only; editable via PATCH. */
export interface BookingDropoff {
  dropoff_requested: boolean;
  dropoff_location_id: string | null;
  dropoff_notes: string | null;
}

/**
 * A customer/agency booking. The summary (list) carries everything up to
 * `lines` (no participants); the detail view additionally populates
 * `notes`/`contact_notes`/`hotel`/`pickup`/`dropoff` and the per-unit
 * `participants`.
 */
export interface Booking {
  uuid: string;
  /** Human-readable code, e.g. "TM-AB12CD" (derived from the ULID suffix). */
  code: string;
  state: ReservationState;
  origin: ReservationOrigin;
  /** ISO 8601 UTC. */
  created_at: string | null;
  total: Money;
  amount_paid: Money;
  balance: Money;
  payment_status: PaymentStatus;
  customer: BookingCustomer;
  lines: BookingLine[];
  // ── detail-only ──
  notes?: string | null;
  contact_notes?: string | null;
  hotel?: BookingHotel | null;
  pickup?: BookingPickup;
  dropoff?: BookingDropoff;
}

/** PATCH /account/bookings/{uuid} — participant fields editable per id. */
export interface BookingParticipantPatch {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone_prefix?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  passport?: string | null;
  identity_document?: string | null;
  nationality?: string | null;
}

/** PATCH /account/bookings/{uuid} payload (editable fields only). */
export interface BookingPatch {
  participants?: BookingParticipantPatch[];
  hotel?: Partial<BookingHotel>;
  pickup?: Partial<BookingPickup>;
  dropoff?: Partial<BookingDropoff>;
}

// ── Auth / session ─────────────────────────────────────────────────────────

export type SessionRole = "customer" | "agency";

/** Discriminated scope carried by the session/auth result. */
export type AuthScope = { user_id: string } | { agency_id: string };

/**
 * Customer-scope auth result (`POST /auth/customer/login`). The token is scoped
 * to the USER (`scope.user_id`), not a single booking — the account shows all of
 * the user's reservations.
 */
export interface CustomerAuthResult {
  token: string;
  token_type: "Bearer";
  /** ISO 8601 UTC. */
  expires_at: string;
  role: "customer";
  scope: { user_id: string };
  customer: { first_name: string | null; last_name: string | null; email: string | null };
}

/** Agency-scope auth result (`POST /auth/agency/login`). */
export interface AgencyAuthResult {
  token: string;
  token_type: "Bearer";
  /** ISO 8601 UTC. */
  expires_at: string;
  role: "agency";
  scope: { agency_id: string };
  agency: {
    id: string | null;
    code: string | null;
    legal_name: string | null;
    display_name: string | null;
  };
  user: { name: string | null; email: string | null; locale: string | null };
}

/**
 * Login response for both flows. Discriminated on `role`.
 * NB: `token` never reaches the browser — the BFF stores it in an httpOnly cookie.
 */
export type AuthResult = CustomerAuthResult | AgencyAuthResult;

/**
 * Decoded session held in the httpOnly cookie. Carries the bearer `token`
 * (server-side only — the browser never reads this cookie) so the seam can
 * forward it to `backendFetch`. `scope` is discriminated to match `role`.
 */
export type Session =
  | {
      role: "customer";
      name: string;
      token: string;
      expires_at: string;
      scope: { user_id: string };
    }
  | {
      role: "agency";
      name: string;
      token: string;
      expires_at: string;
      scope: { agency_id: string };
    };

// ── Agency profile ───────────────────────────────────────────────────────────

/** Editable agency user (the person who logs in). */
export interface AgencyProfileUser {
  name: string | null;
  email: string | null;
  phone: string | null;
  locale: string | null;
}

/**
 * Agency company data. `commission_percent`/`network_commission_percent`/
 * `is_active`/`api_enabled` are READ-ONLY (admin-managed).
 */
export interface AgencyProfileCompany {
  id: string | null;
  code: string | null;
  legal_name: string | null;
  display_name: string | null;
  address_street: string | null;
  address_street_number: string | null;
  postal_code: string | null;
  city: string | null;
  /** ISO 3166-1 alpha-2 (e.g. "ES") — NOT a numeric country id. */
  country_alpha2: string | null;
  municipality_code: string | null;
  phone_prefix: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  website: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  tripadvisor_url: string | null;
  description: string | null;
  collaboration_reason: string | null;
  /** READ-ONLY commercial commission, e.g. 8.0. */
  commission_percent: number | null;
  /** READ-ONLY network override commission. */
  network_commission_percent: number | null;
  /** READ-ONLY activation flag. */
  is_active: boolean | null;
  /** READ-ONLY — OCTO API access flag (lives on the user). */
  api_enabled: boolean;
}

/** GET/PATCH /agency/profile. */
export interface AgencyProfile {
  user: AgencyProfileUser;
  agency: AgencyProfileCompany;
}

/** Fields the agency may PATCH on its user. */
export type AgencyUserPatch = Partial<Pick<AgencyProfileUser, "name" | "email" | "phone" | "locale">>;

/** Fields the agency may PATCH on its company (no read-only flags). */
export type AgencyCompanyPatch = Partial<
  Pick<
    AgencyProfileCompany,
    | "legal_name"
    | "display_name"
    | "address_street"
    | "address_street_number"
    | "postal_code"
    | "city"
    | "country_alpha2"
    | "municipality_code"
    | "phone_prefix"
    | "phone"
    | "fax"
    | "email"
    | "website"
    | "facebook_url"
    | "twitter_url"
    | "tripadvisor_url"
    | "description"
    | "collaboration_reason"
  >
>;

/** PATCH /agency/profile payload (only editable fields). */
export interface AgencyProfilePatch {
  user?: AgencyUserPatch;
  agency?: AgencyCompanyPatch;
}

// ── Payment info ─────────────────────────────────────────────────────────────

/** Bank transfer coordinates. On READ values are masked (last 4 only). */
export interface BankTransfer {
  beneficiary: string | null;
  iban: string | null;
  account_number: string | null;
  bank_name: string | null;
  swift: string | null;
  aba: string | null;
  address: string | null;
  city: string | null;
  country_alpha2: string | null;
  intermediary: string | null;
}

/** A guarantee amount + threshold (READ-ONLY; admin-managed). */
export interface GuaranteeAmount {
  amount_cents: number;
  threshold_percent: number | null;
}

/**
 * GET/PATCH /agency/payment. On READ, the sensitive fields (IBAN, account,
 * documents, paypal) come back MASKED; on PATCH send cleartext write-only
 * (omit a field to leave it unchanged). `guarantees`/`deposit` are READ-ONLY.
 */
export interface PaymentInfo {
  vat_id: string | null;
  tax_code: string | null;
  identity_document_type: string | null;
  identity_document_number: string | null;
  identity_document_country_alpha2: string | null;
  paypal_email: string | null;
  paypal_country_alpha2: string | null;
  bank_transfer: BankTransfer;
  guarantees: {
    bank_transfer_guarantee: GuaranteeAmount;
    check_guarantee: GuaranteeAmount;
  };
  deposit: { amount_cents: number; paid: boolean };
}

/** PATCH /agency/payment payload (partial; only the writable fields). */
export interface PaymentInfoPatch {
  vat_id?: string | null;
  tax_code?: string | null;
  identity_document_type?: string | null;
  identity_document_number?: string | null;
  identity_document_country_alpha2?: string | null;
  paypal_email?: string | null;
  paypal_country_alpha2?: string | null;
  bank_transfer?: Partial<BankTransfer>;
}

// ── Discount codes ────────────────────────────────────────────────────────────

export type DiscountType = "PERCENT" | "FIXED" | string;

/** GET /agency/discount-codes row (an OfferCode joined to its Offer). */
export interface DiscountCode {
  offer_id: string | null;
  offer_code_id: string;
  code: string;
  internal_name: string | null;
  discount_type: DiscountType | null;
  /** Percent value when PERCENT; cents/amount semantics depend on type. */
  discount_value: number | null;
  /** Required only for FIXED; null for PERCENT. */
  currency: string | null;
  /** ISO 8601 UTC. */
  valid_from: string | null;
  /** ISO 8601 UTC. */
  valid_until: string | null;
  max_uses: number | null;
  used_count: number;
  remaining: number | null;
  /** Default true on the backend. */
  combinable_with_agency_discount: boolean;
  is_valid_now: boolean;
  status: string | null;
}

/** GET /agency/discount-codes/{offerCodeId}/usage row (from `reservation_offers`). */
export interface DiscountCodeUsage {
  reservation_uuid: string | null;
  booking_code: string | null;
  customer_email_hash: string | null;
  snapshot_internal_name: string | null;
  snapshot_discount_type: string | null;
  snapshot_discount_value: number | null;
  snapshot_amount_applied_cents: number;
  currency: string | null;
  /** "HOLD" | "CONFIRMED". */
  applied_at_state: string | null;
  /** ISO 8601 UTC. */
  created_at: string | null;
}

/** GET /agency/discount-codes/{offerId}/products row. */
export interface DiscountCodeProduct {
  id: string;
  name: string | null;
  slug: string | null;
  status: string | null;
}

/**
 * Products list response — adds `all_products: true` (with an empty `items`)
 * when the offer has no product scope, i.e. it applies to ALL partner products.
 */
export interface DiscountCodeProductList extends Paginated<DiscountCodeProduct> {
  all_products: boolean;
}

// ── Agency API access (= OCTO) ────────────────────────────────────────────────

/** GET /agency/api-access (only when `user.api_enabled`). */
export interface AgencyApiAccess {
  enabled: boolean;
  /** "octo". */
  api: string;
  /** "/octo". */
  base_path: string;
  jwt_ttl_minutes: number;
  agency_id: string | null;
}

// ── Signup ─────────────────────────────────────────────────────────────────

/** POST /auth/agency/signup payload. */
export interface AgencySignupPayload {
  agency: {
    legal_name: string;
    display_name?: string | null;
    code?: string | null;
    address_street?: string | null;
    address_street_number?: string | null;
    postal_code?: string | null;
    city?: string | null;
    country_alpha2?: string | null;
    municipality_code?: string | null;
    email?: string | null;
    phone_prefix?: string | null;
    phone?: string | null;
    website?: string | null;
    facebook_url?: string | null;
    tripadvisor_url?: string | null;
    collaboration_reason?: string | null;
    billing?: {
      vat_id?: string | null;
      tax_code?: string | null;
      identity_document_type?: string | null;
      identity_document_number?: string | null;
      identity_document_country_alpha2?: string | null;
    };
  };
  user: {
    name: string;
    email: string;
    email_confirm: string;
    password: string;
    password_confirm: string;
    locale?: string | null;
    policy_check: boolean;
  };
}

/** POST /auth/agency/signup response. */
export interface AgencySignupResult {
  status: "pending_activation";
}

// ── Customer registration (classic email+password) ──────────────────────────

/** POST /auth/customer/register payload. */
export interface CustomerRegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
  policy_check: boolean;
  locale?: string | null;
}

/**
 * POST /auth/customer/register response. Double opt-in: the user must verify
 * the email (link) before the first login — no token/session is issued here.
 */
export interface CustomerRegisterResult {
  status: "pending_verification";
}
