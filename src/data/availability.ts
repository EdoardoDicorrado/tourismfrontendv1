/**
 * Mock per-product availability — the date layer behind the listing's date-range
 * filter.
 *
 * The CRM / storefront availability API does not exist yet (see CLAUDE.md), so
 * tours have no real per-date availability. Until it lands we synthesize a
 * deterministic set of available days for each product over the next two weeks,
 * so picking a date range in the listing hero actually narrows the results.
 *
 * Pure + framework-agnostic (no `"use client"`, no `"server-only"`): the
 * generator runs server-side in `@/lib/catalog` (the dates are serialized into
 * the product props), and the range test runs client-side in the listing filter.
 * When the availability API is wired, drop {@link availabilityForSlug} and read
 * the real available dates from the backend — {@link hasDateInRange} stays.
 *
 * Dates are ISO `YYYY-MM-DD` so they compare lexicographically (same convention
 * as the RangeCalendar). Everything is computed in UTC to avoid TZ drift.
 */

/**
 * Demo "today" anchor. Kept aligned with the listing hero calendar's `TODAY_ISO`
 * / `minIso` in `components/listing/ListingSearch.tsx`, so every generated
 * available day is also selectable in that calendar. When real `Date.now()`
 * availability arrives this constant goes away. ⚠️ If ui-ux moves the calendar's
 * `minIso`, keep this in sync (or import this constant there).
 */
export const DEMO_TODAY_ISO = "2026-06-08";

/** Size of the availability window from {@link DEMO_TODAY_ISO}, in days. */
export const AVAILABILITY_WINDOW_DAYS = 14;

/** "YYYY-MM-DD" → UTC midnight Date. */
function isoToUtc(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Date → "YYYY-MM-DD" (UTC, zero-padded). */
function utcToIso(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Add `days` to an ISO date, returning a new ISO date (UTC, handles rollover). */
function addDaysIso(iso: string, days: number): string {
  const dt = isoToUtc(iso);
  dt.setUTCDate(dt.getUTCDate() + days);
  return utcToIso(dt);
}

/** Stable 32-bit hash of a slug, so a tour's availability never changes between renders. */
function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministic departure days for a product over the next {@link AVAILABILITY_WINDOW_DAYS}
 * days from `todayIso`. Real tours don't run every day — they have **limited
 * departures**, so we model a per-tour **cadence** (every 3–6 days) and a
 * **start offset**, both derived from the slug. That keeps availability SPARSE
 * (~3–5 days over the window) and distinct per tour, so choosing a date range in
 * the listing visibly narrows the results: a tight range only matches tours with
 * a departure inside it, while a wide range matches more. (A dense ~daily model
 * made every multi-day range include almost every tour → the filter looked
 * inert.) Always returns at least one day.
 */
export function availabilityForSlug(
  slug: string,
  todayIso: string = DEMO_TODAY_ISO,
  windowDays: number = AVAILABILITY_WINDOW_DAYS,
): string[] {
  const h = hashSlug(slug);
  // Each tour runs inside a contiguous "departure block" placed at a different
  // spot in the window (some tours depart early in the fortnight, others late),
  // with a few departures every 2–3 days inside it. Distinct blocks per tour are
  // what make week-wide ranges narrow the list (week 1 vs week 2 surface
  // different tours), not just 1–3 day picks.
  const blockSpan = 4 + (h % 4); // 4..7 days wide
  const latestStart = Math.max(0, windowDays - blockSpan);
  const blockStart = (Math.imul(h, 40503) >>> 0) % (latestStart + 1);
  const step = 2 + ((h >>> 3) % 2); // a departure every 2 or 3 days within the block
  const dates: string[] = [];
  for (let d = blockStart; d < blockStart + blockSpan && d < windowDays; d += step) {
    dates.push(addDaysIso(todayIso, d));
  }
  // Guarantee non-empty: fall back to the anchor day if the loop produced nothing.
  if (dates.length === 0) dates.push(todayIso);
  return dates;
}

/**
 * True when any of `availableDates` falls within the inclusive `[start, end]`
 * range. ISO strings compare lexicographically. A null `end` means a single-day
 * pick (end = start). With no dates, returns `true` (don't hide products that
 * simply lack availability data).
 */
export function hasDateInRange(
  availableDates: string[] | undefined,
  start: string | null,
  end: string | null,
): boolean {
  if (!start) return true; // no date filter applied
  if (!availableDates || availableDates.length === 0) return true;
  const hi = end ?? start;
  const lo = start <= hi ? start : hi;
  const hiSafe = start <= hi ? hi : start;
  return availableDates.some((d) => d >= lo && d <= hiSafe);
}
