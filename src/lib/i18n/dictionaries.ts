import "server-only";

import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/types";

/**
 * Lazy per-locale dictionary loaders. Because they're dynamically imported and
 * only used in Server Components, unused locales never reach the client bundle.
 */
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  it: () => import("./dictionaries/it").then((m) => m.it),
  en: () => import("./dictionaries/en").then((m) => m.en),
  es: () => import("./dictionaries/es").then((m) => m.es),
};

export const getDictionary = (locale: Locale): Promise<Dictionary> => dictionaries[locale]();

export type { Dictionary };
