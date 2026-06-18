import "server-only";

import {
  destinations as mockDestinations,
  getOffers,
  type Destination,
  type Product,
} from "@/data/home";
import { attractions as mockAttractions, listingProducts, type Attraction } from "@/data/listing";
import { getProduct, type ProductDetail } from "@/data/product";
import { fetchDestination, fetchDestinations, fetchMonuments, fetchProduct } from "@/lib/api/storefront";
import {
  adaptAttraction,
  adaptDestination,
  adaptProduct,
  adaptProductDetail,
} from "@/lib/catalog/adapters";
import type { Locale } from "@/lib/i18n/config";

/**
 * Catalog facade: the single place pages and storefront BFF route handlers read
 * catalog data from. Each call hits the storefront API and, on any failure
 * (undeployed/unreachable backend), falls back to the local fixtures so the UI
 * never regresses. See `@/lib/api/storefront` and [[storefront-api-da-definire]].
 */

/** Home "Destinazioni più popolari" cards (max 3, matching the 3-up design). */
export async function getHomeDestinations(lang: Locale): Promise<Destination[]> {
  const api = await fetchDestinations(lang);
  if (!api || api.length === 0) return mockDestinations;
  return api.slice(0, 3).map(adaptDestination);
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
        return detail?.products.map((p) => adaptProduct(p, citta)) ?? [];
      }),
    )
  ).flat();
  return fromApi.length > 0 ? fromApi : fallback;
}

/** Catalog grid for a city listing. Empty array when the city has no tours. */
export async function getListingProducts(citta: string, lang: Locale): Promise<Product[]> {
  const detail = await fetchDestination(citta, lang);
  if (!detail) return listingProducts.filter((p) => p.city === citta);
  return detail.products.map((p) => adaptProduct(p, citta));
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

/** Listing "Attrazioni più popolari" cards (max 4, matching the 4-up design). */
export async function getListingAttractions(lang: Locale): Promise<Attraction[]> {
  const api = await fetchMonuments(lang);
  if (!api || api.length === 0) return mockAttractions;
  return api.slice(0, 4).map(adaptAttraction);
}
