/**
 * Agency pricing shown on product cards when an agency is logged in.
 *
 * ponytail: fixed 20% — matches the existing "Sconto agenzia 20% attivo" copy.
 * The real per-agency rate comes from the agency profile/backend once wired;
 * swap AGENCY_DISCOUNT_PERCENT (and the price source) then.
 *
 * Client-safe: pure constant + function, no server-only imports.
 */
export const AGENCY_DISCOUNT_PERCENT = 20;

/** Net price for an agency: public price minus the agency discount, rounded for display. */
export function agencyPrice(price: number): number {
  return Math.round(price * (1 - AGENCY_DISCOUNT_PERCENT / 100));
}
