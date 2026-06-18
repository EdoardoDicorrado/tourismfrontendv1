/**
 * Locale-aware display formatters (client-safe — no server-only imports).
 *
 * SSR-safe: only used with explicit values, never `Date.now()`/argless
 * `new Date()`, so server and client render identically.
 */
import type { Locale } from "@/lib/i18n/config";

/** BCP-47 tag per app locale, used for number/date formatting. */
const LOCALE_TAG: Record<Locale, string> = {
  it: "it-IT",
  en: "en-GB",
  es: "es-ES",
};

/** "64,00€" — two decimals in the locale's notation, € suffix (storefront is EUR-only for now). */
export function formatMoney(amount: number, locale: Locale): string {
  return `${amount.toLocaleString(LOCALE_TAG[locale], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}€`;
}

/** ISO date → localized long form, e.g. "15 giugno 2026" / "15 June 2026" / "15 de junio de 2026". */
export function formatDateLong(iso: string, locale: Locale): string {
  const [y, m, d] = iso.split("-").map(Number);
  // new Date(y, m, d) with explicit parts is deterministic (unlike argless new Date()).
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

/** Localized country name from an ISO 3166-1 alpha-2 code, e.g. "IT" → "Italia". */
export function countryName(code: string, locale: Locale): string {
  try {
    return new Intl.DisplayNames([LOCALE_TAG[locale]], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "Giugno 2026" / "June 2026" / "Junio 2026" — localized month + year (capitalized). */
export function formatMonthYear(year: number, month0: number, locale: Locale): string {
  return capitalize(
    new Intl.DateTimeFormat(LOCALE_TAG[locale], { month: "long", year: "numeric" }).format(
      new Date(year, month0, 1),
    ),
  );
}

/** Short weekday names, Monday-first, e.g. ["Lun","Mar",…] / ["Mon","Tue",…] (capitalized, no trailing dot). */
export function weekdayShortNames(locale: Locale): string[] {
  const fmt = new Intl.DateTimeFormat(LOCALE_TAG[locale], { weekday: "short" });
  // 2024-01-01 is a Monday — explicit-parts Date is deterministic (SSR-safe).
  return Array.from({ length: 7 }, (_, i) =>
    capitalize(fmt.format(new Date(2024, 0, 1 + i)).replace(/\.$/, "")),
  );
}
