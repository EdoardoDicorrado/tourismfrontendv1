import "server-only";

import { STOREFRONT_BRAND } from "@/lib/api/storefront";
import type { Locale } from "@/lib/i18n/config";
import { makeTryFetch, query } from "@/lib/api/storefront-fetch";

/**
 * Storefront **live availability** client (`GET /products/{slug}/availability`).
 *
 * Server-only, brand-scoped, read-only. Two shapes off one endpoint:
 *   - `?variant=&month=YYYY-MM`     → bookable days of the month (calendar).
 *   - `?variant=&date=YYYY-MM-DD`   → real slots of that day (slotId + prices).
 *
 * Like `@/lib/api/storefront`, every call degrades to `null` on a missing/
 * undeployed endpoint (404) or an unreachable backend, so the booking widget
 * falls back to its placeholder slots instead of breaking. `null` ("API not
 * live / unreachable") is intentionally distinct from `[]` ("real, but no
 * availability that day") — callers render those differently.
 */

/** One real bookable slot of a day. Prices are in EUR (cents/100), keys = unit reference. */
export interface ApiAvailabilitySlot {
  slotId: string;
  /** Local start time "HH:MM". */
  time: string;
  /** Remaining seats. */
  available: number;
  soldOut: boolean;
  /** Per-unit-reference price in EUR, e.g. `{ adult: 64, child: 40 }`. */
  prices: Record<string, number>;
  /** ISO 4217 currency code, e.g. "EUR". */
  currency: string;
}

/** Availability GET → `null` on any backend/network failure; callers fall back to placeholders. */
const tryFetch = makeTryFetch("availability");

const BASE = (slug: string) =>
  `/api/storefront/v1/products/${encodeURIComponent(slug)}/availability`;

/** The backend may wrap the day list; accept both `string[]` and `{ days: string[] }`. */
function normalizeDays(raw: unknown): string[] | null {
  if (Array.isArray(raw)) return raw.filter((d): d is string => typeof d === "string");
  if (raw && typeof raw === "object" && Array.isArray((raw as { days?: unknown }).days)) {
    return (raw as { days: unknown[] }).days.filter((d): d is string => typeof d === "string");
  }
  return null;
}

/** The backend may wrap the slot list; accept both `Slot[]` and `{ slots: Slot[] }`. */
function normalizeSlots(raw: unknown): ApiAvailabilitySlot[] | null {
  const arr = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { slots?: unknown }).slots)
      ? (raw as { slots: unknown[] }).slots
      : null;
  if (!arr) return null;
  return arr.map((s) => {
    const o = (s ?? {}) as Record<string, unknown>;
    const prices: Record<string, number> = {};
    const p = o.prices;
    if (p && typeof p === "object") {
      for (const [k, v] of Object.entries(p as Record<string, unknown>)) {
        const n = Number(v);
        if (!Number.isNaN(n)) prices[k.toLowerCase()] = n;
      }
    }
    const seats = Number.isNaN(Number(o.available)) ? 0 : Number(o.available);
    return {
      slotId: typeof o.slotId === "string" ? o.slotId : "",
      time: typeof o.time === "string" ? o.time : "",
      available: seats,
      soldOut: o.soldOut === true || seats === 0,
      prices,
      currency: typeof o.currency === "string" ? o.currency : "EUR",
    } satisfies ApiAvailabilitySlot;
  });
}

/** Bookable ISO days ("YYYY-MM-DD") for a variant in a month ("YYYY-MM"), or `null`. */
export async function fetchAvailabilityMonth(
  slug: string,
  { variant, month, locale }: { variant: string; month: string; locale: Locale },
): Promise<string[] | null> {
  const raw = await tryFetch<unknown>(
    `${BASE(slug)}${query({ brand: STOREFRONT_BRAND, lang: locale, variant, month })}`,
    locale,
  );
  return raw === null ? null : normalizeDays(raw);
}

/** Real slots for a variant on a day ("YYYY-MM-DD"); `null` = API not live, `[]` = day empty. */
export async function fetchAvailabilityDay(
  slug: string,
  { variant, date, locale }: { variant: string; date: string; locale: Locale },
): Promise<ApiAvailabilitySlot[] | null> {
  const raw = await tryFetch<unknown>(
    `${BASE(slug)}${query({ brand: STOREFRONT_BRAND, lang: locale, variant, date })}`,
    locale,
  );
  return raw === null ? null : normalizeSlots(raw);
}
