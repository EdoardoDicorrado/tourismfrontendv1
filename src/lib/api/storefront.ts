import "server-only";

import { backendFetch, BackendError } from "@/lib/api/client";
import type { Locale } from "@/lib/i18n/config";

/**
 * Typed client for the tatanka3 **storefront** API (`/api/storefront/v1`),
 * brand-scoped and read-only (catalog taxonomy + minimal product cards).
 *
 * Server-only. Every call is wrapped so a missing/undeployed storefront (the
 * Vercel prod backend does NOT expose it yet) or an unreachable backend yields
 * `null` instead of throwing — callers in `@/lib/catalog` then fall back to the
 * local fixtures, so the site never breaks. See [[storefront-api-da-definire]].
 */

/** Brand slug passed as the required `?brand=` param. Overridable via env. */
export const STOREFRONT_BRAND = process.env.BACKEND_STOREFRONT_BRAND ?? "tourismotion";

/** A destination card (`GET /destinations`). */
export interface ApiDestinationCard {
  slug: string;
  name: string;
  description: string | null;
  code: string | null;
  cover_url: string | null;
  products_count: number;
  position: number;
}

/** A nested product card inside a destination/monument detail. */
export interface ApiProductCard {
  slug: string;
  name: string;
  thumb_url: string | null;
  duration_minutes: number | null;
  /** ISO codes of the languages the tour is offered in (distinct variant locales). */
  languages?: string[];
  /** Cheapest valid retail price (paying units only) in major units, or null. */
  price_from: number | null;
  /** ISO 4217 currency code, e.g. "EUR". */
  currency: string;
  /** Real approved-review average; null when there are no approved reviews. */
  rating: number | null;
  /** Real approved-review count (0 when none). */
  reviews_count: number;
  /** `<destination-slug>/<product-slug>` for the detail-page link. */
  detail_path: string;
}

/** Destination detail (`GET /destinations/{slug}`) — adds nested product cards. */
export interface ApiDestinationDetail extends ApiDestinationCard {
  products: ApiProductCard[];
}

/** A monument/attraction card (`GET /monuments`). */
export interface ApiMonumentCard {
  slug: string;
  name: string;
  short_description: string | null;
  city: string | null;
  is_institutional_partner: boolean;
  in_carousel: boolean;
  logo_url: string | null;
  cover_url: string | null;
  products_count: number;
  coordinates: { latitude: number; longitude: number } | null;
}

/** Monument detail (`GET /monuments/{slug}`) — adds nested product cards. */
export interface ApiMonumentDetail extends ApiMonumentCard {
  products: ApiProductCard[];
}

/** A bookable option (one published variant) inside a product detail. */
export interface ApiProductOption {
  id: string;
  title: string;
  /** ISO code of the language this option is run in (e.g. "en", "es"). */
  language: string | null;
  description: string | null;
  minUnits: number | null;
  maxUnits: number | null;
  freeCancellationCutoffMinutes: number | null;
  /** Cheapest valid price per unit reference (e.g. `{ adult: 50, child: 30 }`). */
  prices: Record<string, number>;
  currency: string;
}

/** A distinct participant type (adult/child/infant/…) the tour sells. */
export interface ApiProductParticipant {
  key: string;
  reference: string | null;
  type: string | null;
  displayName: string | null;
  minAge: number | null;
  maxAge: number | null;
  min: number | null;
  max: number | null;
  required: boolean;
}

/** Full product detail (`GET /products/{slug}`) — editorial + base prices, no live availability. */
export interface ApiProductDetail {
  slug: string;
  city: string | null;
  cityName: string | null;
  title: string;
  shortDescription: string | null;
  description: string | null;
  durationMinutes: number | null;
  availabilityType: string | null;
  /** Source/default language of the tour — drives the option ordering. */
  defaultLanguage: string | null;
  rating: number | null;
  reviewsCount: number;
  priceFrom: number | null;
  currency: string;
  coverUrl: string | null;
  gallery: { src: string; alt: string }[];
  included: { items: string[] } | null;
  notIncluded: { items: string[] } | null;
  thingsToKnow: string | null;
  accessibility: string | null;
  generalInfo: { icon: string | null; title: string | null; text: string | null }[];
  whyCustomersLove: { title: string | null; text: string | null }[];
  faqs: { question: string | null; answer: string | null }[];
  meetingPoint: {
    text: string | null;
    latitude: number | null;
    longitude: number | null;
    mapUrl: string | null;
  } | null;
  participants: ApiProductParticipant[];
  options: ApiProductOption[];
  seo: { title: string | null; description: string | null; robots: string; jsonld: Record<string, unknown> };
}

function query(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** Run a storefront GET; return `null` on any backend/network failure. */
async function tryFetch<T>(path: string, locale: Locale): Promise<T | null> {
  try {
    return await backendFetch<T>({ path, locale });
  } catch (err) {
    // 404 = storefront not deployed on this backend (expected on prod): stay
    // quiet. Anything else (5xx, network) is worth a single warning.
    if (!(err instanceof BackendError) || err.status >= 500) {
      console.warn(`[storefront] ${path} unavailable, falling back to fixtures:`, String(err));
    }
    return null;
  }
}

export function fetchDestinations(locale: Locale): Promise<ApiDestinationCard[] | null> {
  return tryFetch(`/api/storefront/v1/destinations${query({ brand: STOREFRONT_BRAND, lang: locale })}`, locale);
}

export function fetchDestination(slug: string, locale: Locale): Promise<ApiDestinationDetail | null> {
  return tryFetch(
    `/api/storefront/v1/destinations/${encodeURIComponent(slug)}${query({ brand: STOREFRONT_BRAND, lang: locale })}`,
    locale,
  );
}

export function fetchProduct(slug: string, locale: Locale): Promise<ApiProductDetail | null> {
  return tryFetch(
    `/api/storefront/v1/products/${encodeURIComponent(slug)}${query({ brand: STOREFRONT_BRAND, lang: locale })}`,
    locale,
  );
}

export function fetchMonuments(locale: Locale): Promise<ApiMonumentCard[] | null> {
  return tryFetch(`/api/storefront/v1/monuments${query({ brand: STOREFRONT_BRAND, lang: locale })}`, locale);
}

export function fetchMonument(slug: string, locale: Locale): Promise<ApiMonumentDetail | null> {
  return tryFetch(
    `/api/storefront/v1/monuments/${encodeURIComponent(slug)}${query({ brand: STOREFRONT_BRAND, lang: locale })}`,
    locale,
  );
}
