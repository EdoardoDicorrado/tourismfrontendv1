import { getListingProducts } from "@/lib/catalog";
import { isLocale, type Locale } from "@/lib/i18n/config";

/**
 * BFF: catalog grid for a city. `?citta=roma` is required; `?lang=` optional.
 * Returns the frontend `Product[]` shape (price/badge/facets merged from
 * fixtures until the backend exposes them), with fixture fallback.
 */
export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const citta = params.get("citta");
  if (!citta) {
    return Response.json({ error: { code: "bad_request", message: "citta query param is required" } }, { status: 400 });
  }

  const langParam = params.get("lang");
  const lang: Locale = langParam && isLocale(langParam) ? langParam : "it";

  return Response.json(await getListingProducts(citta, lang));
}
