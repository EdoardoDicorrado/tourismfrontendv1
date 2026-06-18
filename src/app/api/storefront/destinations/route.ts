import { getHomeDestinations } from "@/lib/catalog";
import { isLocale, type Locale } from "@/lib/i18n/config";

/**
 * BFF: home destination cards. Proxies the storefront API server-side (token/
 * brand kept off the client) and returns the frontend `Destination` shape, with
 * fixture fallback. Client components can `fetch('/api/storefront/destinations?lang=es')`.
 */
export async function GET(request: Request): Promise<Response> {
  const langParam = new URL(request.url).searchParams.get("lang");
  const lang: Locale = langParam && isLocale(langParam) ? langParam : "it";

  return Response.json(await getHomeDestinations(lang));
}
