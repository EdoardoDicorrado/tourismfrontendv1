/**
 * Local date/time formatters for the discount-code views.
 *
 * The shared `@/lib/format` only formats pure `YYYY-MM-DD` dates (`formatDateLong`).
 * Discount-code rows carry datetime fields with a time component:
 *   - `start_at`: ISO 8601 with timezone offset (Europe/Rome)
 *   - `used_at`:  ISO 8601 UTC (`Z`)
 * so we render those with a locale-aware date+time formatter here. SSR-safe and
 * timezone-deterministic: like `bookings/datetime.ts`, we render each instant in
 * its OWN declared offset (shift by the parsed offset, then format in UTC), so the
 * output never depends on the runtime timezone and is identical on server and
 * client. This keeps the formatter safe even if these tables ever become client
 * components.
 */
import type { DiscountCode } from "@/lib/account/types";
import type { Locale } from "@/lib/i18n/config";

/** BCP-47 tag per app locale (kept local to avoid touching the shared format lib). */
const LOCALE_TAG: Record<Locale, string> = {
  it: "it-IT",
  en: "en-GB",
  es: "es-ES",
};

/** Parse the trailing offset (e.g. "+02:00", "Z") into minutes east of UTC. */
function offsetMinutes(iso: string): number {
  const match = /([+-])(\d{2}):?(\d{2})$/.exec(iso);
  if (!match) return 0; // "Z" or no offset → treat as UTC
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

/** ISO datetime → localized date + short time, e.g. "29/07/2026, 10:30". `null` → "—". */
export function formatDateTime(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return "—";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  // Shift so that formatting in UTC yields the wall-clock time the offset describes.
  const shifted = new Date(ms + offsetMinutes(iso) * 60_000);
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(shifted);
}

/** ISO datetime → localized date only, e.g. "29/07/2026". `null` → "—". */
export function formatDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return "—";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  const shifted = new Date(ms + offsetMinutes(iso) * 60_000);
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(shifted);
}

/**
 * Discount value → display label. PERCENT → "-20%"; FIXED (and any amount type)
 * → currency-formatted from minor units in the code's own currency. `null` → "—".
 */
export function discountLabel(
  type: string | null,
  value: number | null,
  currency: string | null,
  locale: Locale,
): string {
  if (value == null) return "—";
  if (type === "PERCENT") return `-${value}%`;
  return new Intl.NumberFormat(LOCALE_TAG[locale], {
    style: "currency",
    currency: currency ?? "EUR",
  }).format(value / 100);
}

/** Minor units → currency string in the given currency (defaults EUR). */
export function formatCents(cents: number, currency: string | null, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], {
    style: "currency",
    currency: currency ?? "EUR",
  }).format(cents / 100);
}

/** Used / max display ("3 / 100" or "3 / ∞"). `unlimited` is the ∞ glyph from the dict. */
export function usesLabel(usedCount: number, maxUses: number | null, unlimited: string): string {
  return `${usedCount} / ${maxUses ?? unlimited}`;
}

/** Convenience overload for a whole {@link DiscountCode} row. */
export function codeDiscountLabel(code: DiscountCode, locale: Locale): string {
  return discountLabel(code.discount_type, code.discount_value, code.currency, locale);
}
