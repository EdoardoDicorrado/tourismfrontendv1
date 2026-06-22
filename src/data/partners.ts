/**
 * Fixtures for the "Siamo partner di:" logos (home, Figma node 55:3).
 *
 * The storefront API on tatanka3 has no partners feed yet (see CLAUDE.md), so
 * the section renders from these typed fixtures. The eventual backend source is
 * the institutional-partner monuments (`GET /monuments` cards carry
 * `is_institutional_partner`, `logo_url` and `in_carousel`) or a dedicated
 * `/partners` endpoint — when it lands, swap the fixture read in
 * `getHomePartners` (`@/lib/catalog`) for a `backendFetch()` returning this same
 * shape. SELECTION (which partners show) and ORDER (`position`, lower first) are
 * backend-owned; the fixtures below are the curated placeholder set, in order.
 */

export interface Partner {
  name: string;
  logo: string;
  /** Intrinsic logo size (px) so the box doesn't stretch the artwork. */
  width: number;
  height: number;
  /** Backend display order (lower = first). Omitted in fixtures → curated array order. */
  position?: number;
}

export const partners: Partner[] = [
  { name: "Musei Vaticani", logo: "/images/partner-musei-vaticani.png", width: 149, height: 81 },
  { name: "Musei Vaticani", logo: "/images/partner-musei-vaticani.png", width: 149, height: 81 },
  { name: "Musei Vaticani", logo: "/images/partner-musei-vaticani.png", width: 149, height: 81 },
  { name: "Musei Vaticani", logo: "/images/partner-musei-vaticani.png", width: 149, height: 81 },
];
