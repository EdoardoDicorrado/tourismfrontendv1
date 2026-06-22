/**
 * Language (ISO 639-1) → country code (ISO 3166-1 alpha-2) for the circular flag
 * rendered by `<Flag>` / `<FlagStack>`. SINGLE SOURCE for the language→flag
 * mapping (was duplicated inline in home/ProductCard, listing/ListingResultCard
 * and product/ProductHeader).
 *
 * The CRM sends the spoken languages a tour is offered in; the row only appears
 * when there are languages. A code WITHOUT a mapping falls back to an
 * uppercased-code chip in `<Flag>`, so new/rare languages degrade gracefully
 * (add a line here to light up their flag — no component change needed).
 *
 * `flag-icons` keys flags by COUNTRY, so a language maps to its most representative
 * country flag (e.g. en→gb, pt→pt, ar→sa). These are presentational choices, not
 * linguistic claims; tweak freely.
 */
export const LANG_TO_COUNTRY: Record<string, string> = {
  // Core storefront / most common tour languages
  en: "gb",
  es: "es",
  it: "it",
  fr: "fr",
  de: "de",
  pt: "pt",
  ru: "ru",
  // Wider set the CRM may send
  zh: "cn", // Chinese
  ja: "jp", // Japanese
  ko: "kr", // Korean
  ar: "sa", // Arabic
  nl: "nl", // Dutch
  pl: "pl", // Polish
  tr: "tr", // Turkish
  hi: "in", // Hindi
  el: "gr", // Greek
  sv: "se", // Swedish
  no: "no", // Norwegian
  da: "dk", // Danish
  fi: "fi", // Finnish
  cs: "cz", // Czech
  sk: "sk", // Slovak
  hu: "hu", // Hungarian
  ro: "ro", // Romanian
  bg: "bg", // Bulgarian
  hr: "hr", // Croatian
  uk: "ua", // Ukrainian
  he: "il", // Hebrew
  th: "th", // Thai
  vi: "vn", // Vietnamese
  id: "id", // Indonesian
  ms: "my", // Malay
};

/**
 * Normalize a CRM language code → a `flag-icons` country code, or `null` when
 * unmapped. Handles region suffixes and casing (`"pt-BR"`, `"EN_us"` → `pt`/`en`).
 */
export function flagCountry(code: string | null | undefined): string | null {
  if (!code) return null;
  const base = code.toLowerCase().split(/[-_]/)[0];
  return LANG_TO_COUNTRY[base] ?? null;
}
