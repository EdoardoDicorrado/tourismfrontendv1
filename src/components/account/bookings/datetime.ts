/**
 * Display formatter for booking item `start_at` timestamps.
 *
 * `start_at` is ISO 8601 WITH a timezone offset (Europe/Rome), e.g.
 * `"2026-07-10T09:30:00+02:00"`. Unlike the pure `YYYY-MM-DD` dates handled by
 * `@/lib/format`, this carries a wall-clock time we want to show. We render the
 * instant in the tour's own offset (not the viewer's), so the displayed time
 * matches the offset in the string regardless of where the browser is — and the
 * output is identical on server and client (no `Date.now()`, SSR-safe).
 */
import type { Locale } from "@/lib/i18n/config";

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

/** "10 lug 2026, 09:30" — date + time rendered in the tour's own offset. `null` → "—". */
export function formatStartAt(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return "—";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  // Shift the instant so that formatting in UTC yields the local wall-clock time
  // that the offset in the string describes.
  const shifted = new Date(ms + offsetMinutes(iso) * 60_000);
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(shifted);
}

/** "9 giu 2026" — short date for UTC timestamps (created_at / used_at). `null` → "—". */
export function formatDateShort(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return "—";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  const shifted = new Date(ms + offsetMinutes(iso) * 60_000);
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(shifted);
}
