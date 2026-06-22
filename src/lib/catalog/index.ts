import "server-only";

import {
  destinations as mockDestinations,
  getOffers,
  reviews as mockReviews,
  type Destination,
  type Product,
  type Review,
} from "@/data/home";
import { availabilityForSlug } from "@/data/availability";
import { partners as mockPartners, type Partner } from "@/data/partners";
import { discountBadge, oldPriceFor, promoForSlug, urgencyLabel } from "@/data/promo";
import { attractions as mockAttractions, listingProducts, type Attraction } from "@/data/listing";
import { getProduct, type ProductDetail } from "@/data/product";
import { fetchDestination, fetchDestinations, fetchMonuments, fetchProduct } from "@/lib/api/storefront";
import {
  adaptAttraction,
  adaptDestination,
  adaptProduct,
  adaptProductDetail,
} from "@/lib/catalog/adapters";
import { byPosition } from "@/lib/catalog/ordering";
import type { Locale } from "@/lib/i18n/config";

/**
 * Catalog facade: the single place pages and storefront BFF route handlers read
 * catalog data from. Each call hits the storefront API and, on any failure
 * (undeployed/unreachable backend), falls back to the local fixtures so the UI
 * never regresses. See `@/lib/api/storefront` and [[storefront-api-da-definire]].
 */

/**
 * Home "Destinazioni più popolari" cards + search "suggerimenti" (max 3,
 * matching the 3-up design). The CRM owns the display order via each card's
 * `position` (lower = first); we sort by it before slicing.
 */
export async function getHomeDestinations(lang: Locale): Promise<Destination[]> {
  const api = await fetchDestinations(lang);
  if (!api || api.length === 0) return mockDestinations;
  return byPosition(api).slice(0, 3).map(adaptDestination);
}

/**
 * Home "Tour in offerta" cards. No dedicated offers/discount endpoint exists yet,
 * so we source the offer cities' products from the destinations API when reachable
 * and fall back to the curated fixtures otherwise (price/badge/urgency are merged
 * from fixtures by slug — see `adaptProduct`). When the backend exposes an offers
 * endpoint, swap the body for that single call: the `Offers` component, which
 * reads this result via props, does not change.
 */
export async function getHomeOffers(lang: Locale): Promise<Product[]> {
  const fallback = getOffers(lang);
  const cities = [...new Set(fallback.map((o) => o.city))];
  const fromApi = (
    await Promise.all(
      cities.map(async (citta) => {
        const detail = await fetchDestination(citta, lang);
        // Order within each city is backend-owned (`position`, lower = first);
        // sort before adapting so the "Tour in offerta" grid honours the CRM
        // ordering. A dedicated offers endpoint, when it lands, returns the
        // chosen order directly — this `byPosition` then becomes a no-op.
        return byPosition(detail?.products ?? []).map((p) => adaptProduct(p, citta));
      }),
    )
  ).flat();
  return fromApi.length > 0 ? fromApi : fallback;
}

/** Catalog grid for a city listing. Empty array when the city has no tours. */
export async function getListingProducts(citta: string, lang: Locale): Promise<Product[]> {
  const detail = await fetchDestination(citta, lang);
  const products = detail
    ? detail.products.map((p) => adaptProduct(p, citta))
    : listingProducts.filter((p) => p.city === citta);
  // Attach mock per-tour availability + promo (no availability/pricing API yet),
  // keyed off the slug so each tour is stable across renders. Availability drives
  // the date-range filter; the promo MIXES the discount so not every card carries
  // the same "20% sulle Attività" badge — only some tours are on offer, the % and
  // computed old price vary, and the urgency flag is spread. Drop both once the
  // CRM exposes real availability/pricing (see `@/data/availability`, `@/data/promo`).
  return products.map((p) => {
    const key = p.slug ?? p.id;
    const { discountPercent, urgent } = promoForSlug(key);
    return {
      ...p,
      availableDates: availabilityForSlug(key),
      badge: discountBadge(discountPercent, lang),
      oldPrice: oldPriceFor(p.priceFrom, discountPercent),
      urgency: urgent ? urgencyLabel(lang) : undefined,
    };
  });
}

/**
 * Full product-detail page data. Hits `GET /products/{slug}` and adapts it to
 * the page's view model; on any backend failure falls back to the local fixture
 * (only the demo product), and returns `null` when nothing matches → 404.
 */
export async function getProductDetail(
  citta: string,
  slug: string,
  lang: Locale,
): Promise<ProductDetail | null> {
  const api = await fetchProduct(slug, lang);
  if (api) return adaptProductDetail(api, citta);
  return getProduct(citta, slug) ?? null;
}

/**
 * "Attrazioni più popolari" cards for the search popup + listing (max 4,
 * matching the 4-up design). SELECTION is backend-owned: the CRM flags which
 * monuments belong in the carousel (`in_carousel`); ORDER is backend-owned via
 * `position` (lower = first). We fall back to the full set when nothing is
 * flagged so the section never empties.
 */
export async function getListingAttractions(lang: Locale): Promise<Attraction[]> {
  const api = await fetchMonuments(lang);
  if (!api || api.length === 0) return mockAttractions;
  const carousel = api.filter((m) => m.in_carousel);
  const ordered = byPosition(carousel.length > 0 ? carousel : api);
  return ordered.slice(0, 4).map(adaptAttraction);
}

/**
 * Home "Siamo partner di:" logos. No partners feed yet → curated fixtures
 * ([[partners]] in `@/data/partners`). When the storefront exposes institutional
 * partners (monuments with `is_institutional_partner` + `logo_url`, or a
 * dedicated `/partners` endpoint), fetch + adapt here; the `Partners` component
 * reads this via props and won't change. SELECTION = the returned set; ORDER is
 * backend-owned via `position` (lower = first).
 */
export async function getHomePartners(): Promise<Partner[]> {
  return byPosition(mockPartners);
}

/**
 * Home "Cosa pensano i nostri viaggiatori" — the curated few traveler reviews
 * shown on the homepage. No reviews endpoint yet → fixtures. When it lands,
 * fetch the FEATURED home set and return the same shape; the `Reviews` component
 * reads this via props and won't change. SELECTION = the featured set; ORDER is
 * backend-owned via `position` (lower = first).
 */
export async function getHomeReviews(): Promise<Review[]> {
  return byPosition(mockReviews);
}
