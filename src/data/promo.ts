/**
 * Mock promo / discount layer for catalog cards.
 *
 * The storefront API doesn't carry discounts/urgency yet (see CLAUDE.md), and the
 * listing fixtures put the SAME "20% sulle Attività" badge + identical old price on
 * every product — so every card looked discounted in the exact same way. This
 * derives a **per-tour** promo deterministically from the slug so the discount is
 * MIXED: only some tours are on offer, the percentage varies, the struck-through
 * "old price" is computed from the real price, and the urgency flag is spread too.
 *
 * Pure + framework-agnostic. Deterministic by slug → stable between renders (no
 * SSR/CSR mismatch). When the backend exposes real pricing/promos, drop this and
 * read the discount straight from the API.
 */

import type { Locale } from "@/lib/i18n/config";

export interface Promo {
  /** Discount percentage, `0` when the tour is NOT on offer (no badge/old price). */
  discountPercent: number;
  /** Whether to show the "selling out fast" urgency note on this tour. */
  urgent: boolean;
}

/**
 * Discount buckets, sampled by slug hash. Three of eight are `0` → roughly a
 * third of tours carry no discount at all, the rest are spread 10–25%.
 */
const DISCOUNT_BUCKETS = [0, 0, 0, 10, 15, 20, 20, 25];

/** Localized "{n}% off activities" badge copy — mirrors the home offers wording. */
const DISCOUNT_LABEL: Record<Locale, (n: number) => string> = {
  it: (n) => `${n}% sulle Attività`,
  en: (n) => `${n}% on activities`,
  es: (n) => `${n}% en actividades`,
};

/** Localized "selling out fast" urgency copy — mirrors the home offers wording. */
const URGENCY_LABEL: Record<Locale, string> = {
  it: "Si esaurisce in fretta",
  en: "Selling out fast",
  es: "Se agota rápido",
};

/** Stable 32-bit FNV-1a hash of a slug. */
function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic promo for a tour: which tours are discounted, by how much, and whether urgent. */
export function promoForSlug(slug: string): Promo {
  const h = hashSlug(slug);
  const discountPercent = DISCOUNT_BUCKETS[h % DISCOUNT_BUCKETS.length];
  // Independent bit (different slice of the hash) → ~40% of tours flagged urgent,
  // not correlated with the discount.
  const urgent = (h >>> 5) % 5 < 2;
  return { discountPercent, urgent };
}

/** Discount badge label for a locale, or `undefined` when there's no discount. */
export function discountBadge(percent: number, lang: Locale): string | undefined {
  if (percent <= 0) return undefined;
  return DISCOUNT_LABEL[lang](percent);
}

/** The struck-through pre-discount price for a current `priceFrom`, or `undefined` when not on offer. */
export function oldPriceFor(priceFrom: number, percent: number): number | undefined {
  if (percent <= 0 || priceFrom <= 0) return undefined;
  return Math.round(priceFrom / (1 - percent / 100));
}

/** Localized urgency label. */
export function urgencyLabel(lang: Locale): string {
  return URGENCY_LABEL[lang];
}
