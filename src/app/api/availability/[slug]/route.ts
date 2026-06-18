import { NextResponse, type NextRequest } from "next/server";

import { fetchAvailabilityDay, fetchAvailabilityMonth } from "@/lib/api/availability";
import { isLocale } from "@/lib/i18n/config";

/**
 * Live-availability BFF (`GET /api/availability/{slug}`).
 *
 * The booking widget is a client component and the backend base URL + any token
 * are server-only, so reads go through this seam. Proxies to the storefront
 * availability endpoint and shapes the result for the browser:
 *   - `?variant=&month=YYYY-MM`   → `{ ok, days }`  (bookable ISO days, or null)
 *   - `?variant=&date=YYYY-MM-DD` → `{ ok, slots }` (real slots, [] = none, null = API not live)
 *
 * `null` ("availability API not deployed / unreachable") is intentionally
 * distinct from `[]` ("real, but no availability"): the widget keeps its
 * placeholder slots on `null` and shows an empty state on `[]`.
 */

export const dynamic = "force-dynamic";

const MONTH_RE = /^\d{4}-\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!slug) {
    return NextResponse.json({ ok: false, error: "missing_slug" }, { status: 400 });
  }

  const sp = request.nextUrl.searchParams;
  const variant = sp.get("variant")?.trim();
  if (!variant) {
    return NextResponse.json({ ok: false, error: "missing_variant" }, { status: 400 });
  }
  const langParam = sp.get("lang");
  const locale = langParam && isLocale(langParam) ? langParam : "en";

  const month = sp.get("month")?.trim();
  const date = sp.get("date")?.trim();

  try {
    if (date) {
      if (!DATE_RE.test(date)) {
        return NextResponse.json({ ok: false, error: "invalid_date" }, { status: 400 });
      }
      const slots = await fetchAvailabilityDay(slug, { variant, date, locale });
      return NextResponse.json({ ok: true, slots });
    }
    if (month) {
      if (!MONTH_RE.test(month)) {
        return NextResponse.json({ ok: false, error: "invalid_month" }, { status: 400 });
      }
      const days = await fetchAvailabilityMonth(slug, { variant, month, locale });
      return NextResponse.json({ ok: true, days });
    }
    return NextResponse.json({ ok: false, error: "missing_month_or_date" }, { status: 400 });
  } catch {
    // The fetchers already swallow backend/network errors to null; this guards
    // only against an unexpected throw so the widget still degrades cleanly.
    return NextResponse.json({ ok: true, slots: null, days: null });
  }
}
