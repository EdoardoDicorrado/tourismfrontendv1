import { getListingAttractions } from "@/lib/catalog";
import { isLocale, type Locale } from "@/lib/i18n/config";

/**
 * BFF: attraction (monument) cards. Returns the frontend `Attraction` shape,
 * with fixture fallback. Client use: `fetch('/api/storefront/attractions?lang=es')`.
 */
export async function GET(request: Request): Promise<Response> {
  const langParam = new URL(request.url).searchParams.get("lang");
  const lang: Locale = langParam && isLocale(langParam) ? langParam : "it";

  return Response.json(await getListingAttractions(lang));
}
