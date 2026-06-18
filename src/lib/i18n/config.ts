/**
 * i18n configuration — client-safe (no server-only imports).
 *
 * The storefront targets IT (home market) + EN + ES (LATAM/Spanish). Routing is
 * URL-prefixed: /it, /en, /es. Localized *content* (product texts, etc.) will be
 * fetched from the tatanka3 backend per locale; this module only covers the
 * locale set and UI-chrome helpers.
 */

export const locales = ["it", "en", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "it";

export function isLocale(value: string | undefined | null): value is Locale {
  return value != null && (locales as readonly string[]).includes(value);
}

/** Native language names for the switcher menu. */
export const LOCALE_LABELS: Record<Locale, string> = {
  it: "Italiano",
  en: "English",
  es: "Español",
};

/** Short codes for the compact header switcher. */
export const LOCALE_SHORT: Record<Locale, string> = {
  it: "IT",
  en: "EN",
  es: "ES",
};

/** Interpolate `{name}` placeholders in a dictionary string. */
export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

/** Swap (or insert) the locale segment of a pathname: /en/attivita → /es/attivita. */
export function withLocale(pathname: string, locale: Locale): string {
  const segments = pathname.split("/");
  if (isLocale(segments[1])) {
    segments[1] = locale;
  } else {
    segments.splice(1, 0, locale);
  }
  return segments.join("/") || "/";
}
