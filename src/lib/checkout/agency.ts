import "server-only";

import type { Session } from "@/lib/account/types";

/**
 * Checkout — agency context seam.
 *
 * When a signed-in agency reaches the checkout, the contact/billing/payment
 * blocks switch to the agency's stored data instead of the personal-data form.
 * The storefront agency API (profile + payment + saved payment methods) isn't
 * wired for checkout yet (CLAUDE.md), so this runs on a fixture. SINGLE swap
 * point: when the backend lands, take `session.token` and map
 * `getAgencyProfile` + `getPaymentInfo` (+ a saved-methods endpoint) into
 * {@link CheckoutAgency} — CheckoutView reads this and won't change.
 */

/** A saved payment method (preview). One is `isDefault`. */
export interface SavedPaymentMethod {
  id: string;
  type: "card" | "paypal";
  /** e.g. "Visa ···· 4242" or "PayPal · agenzia@demo.com". */
  label: string;
  /** e.g. "Scade 04/27" (cards only). */
  detail?: string;
  isDefault: boolean;
}

/** Agency data the checkout renders (contact + billing + saved methods). */
export interface CheckoutAgency {
  /** Ragione sociale / display name. */
  name: string;
  /** Contact email — fixed in the checkout (changed from the profile). */
  email: string;
  /** ISO 3166-1 alpha-2 country code for the dial prefix (e.g. "ES"). */
  phonePrefix: string;
  phone: string;
  billing: {
    legalName: string;
    /** Partita IVA / VAT id. */
    vatId: string;
    /** One-line billing address. */
    address: string;
  };
  paymentMethods: SavedPaymentMethod[];
}

/** Placeholder agency — acknowledged demo data until the agency checkout API is live. */
const FIXTURE: CheckoutAgency = {
  name: "Agenzia Demo",
  email: "agenzia@demo.com",
  phonePrefix: "ES",
  phone: "612 345 678",
  billing: {
    legalName: "Agenzia Demo S.L.",
    vatId: "B12345678",
    address: "Calle Gran Vía 28, 28013 Madrid",
  },
  paymentMethods: [
    { id: "pm_card_1", type: "card", label: "Visa ···· 4242", detail: "Scade 04/27", isDefault: true },
    { id: "pm_card_2", type: "card", label: "Mastercard ···· 8210", detail: "Scade 11/26", isDefault: false },
    { id: "pm_paypal", type: "paypal", label: "PayPal · agenzia@demo.com", isDefault: false },
  ],
};

/**
 * The signed-in agency's checkout context. Today: the fixture (keyed off the
 * session name so the demo feels coherent). When the agency API lands, fetch the
 * real profile/payment/saved-methods with `session.token` and map them here.
 */
export async function getCheckoutAgency(session: Session): Promise<CheckoutAgency> {
  return { ...FIXTURE, name: session.name || FIXTURE.name };
}
