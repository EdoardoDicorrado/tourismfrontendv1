import "server-only";

/**
 * Affiliate dashboard seam.
 *
 * The affiliate storefront API (auth + per-affiliate stats) is not defined yet
 * (CLAUDE.md) and the `affiliate` session role isn't wired, so the dashboard runs
 * on this fixture. SINGLE swap point: when the backend lands, fetch the signed-in
 * affiliate's real dashboard here (clicks/bookings/payout/commission/codes/referral)
 * and adapt to {@link AffiliateDashboard} — the page reads this and won't change.
 */

export interface AffiliateDashboard {
  name: string;
  /** Amount due at the next month-end payout (display currency). */
  payout: number;
  /** Display date of the next payout, e.g. "30/06/2026". */
  payoutDate: string;
  /** Referral clicks generated. */
  clicks: number;
  /** Bookings generated through the affiliate. */
  bookings: number;
  /** Commission percentage earned per sale. */
  commissionPercent: number;
  /** Discount codes reserved for the affiliate's customers. */
  codes: string[];
  /** Shareable referral URL. */
  referralUrl: string;
}

/** Placeholder figures — acknowledged demo data until the affiliate API is live. */
const FIXTURE: AffiliateDashboard = {
  name: "Affiliato Demo",
  payout: 1284.5,
  payoutDate: "30/06/2026",
  clicks: 3420,
  bookings: 86,
  commissionPercent: 15,
  codes: ["TOURISDEMO10", "AFFILIATO15"],
  referralUrl: "https://tourismotion.com/?ref=demo-001",
};

/**
 * The current affiliate's dashboard data. Today: the fixture. When the affiliate
 * API + session land, take the affiliate token and `backendFetch` the real stats
 * (degrading to the fixture on failure, like the catalog/account seams).
 */
export async function getAffiliateDashboard(/* token?: string */): Promise<AffiliateDashboard> {
  return FIXTURE;
}
