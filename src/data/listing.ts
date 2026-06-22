/**
 * Mock data for the listing / catalog page (`/attivita/[citta]`).
 *
 * The storefront/public API on tatanka3 does not exist yet (see CLAUDE.md), so
 * the listing renders from these typed fixtures. When the catalog API lands,
 * swap these for `backendFetch()` calls (filtered by city) returning the same
 * shapes. Copy and imagery mirror the Figma "02 Listing" design (frame 221:2766).
 */

import type { Product } from "@/data/home";

export interface CityListing {
  slug: string;
  name: string;
  /** Hero headline → "Attività a {name}". */
  toursCount: string;
  rating: number;
  reviews: number;
}

export interface FilterFacet {
  /** Stable, language-independent id; the label comes from `dict.filters.facets[id]`. */
  id: string;
  /** Pre-selected on load. */
  active?: boolean;
}

export interface Attraction {
  slug: string;
  name: string;
  image: string;
  description: string;
  /** City the attraction belongs to — shown as the eyebrow label in search. */
  city?: string;
}

export interface Faq {
  question: string;
  answer: string;
}

/** Indexed by slug so the route can look up the requested city. */
export const cityListings: Record<string, CityListing> = {
  roma: { slug: "roma", name: "Roma", toursCount: "+10.000", rating: 4.7, reviews: 8000 },
  firenze: { slug: "firenze", name: "Firenze", toursCount: "+4.000", rating: 4.7, reviews: 8000 },
  torino: { slug: "torino", name: "Torino", toursCount: "+2.000", rating: 4.7, reviews: 8000 },
  bologna: { slug: "bologna", name: "Bologna", toursCount: "+1.500", rating: 4.7, reviews: 8000 },
};

/**
 * Quick-filter facets, in display order. Each toggles the result grid by matching
 * `Product.tags`. No facet starts selected: real catalog tours are offered in
 * varying languages (not all English), so the default view is the full list and
 * the user opts into a language/duration filter explicitly.
 */
// Quick-filter chips (riga scrollabile). Tutti gli id corrispondono a `Product.tags`
// reali, così ogni chip filtra davvero. Quelli condivisi con i gruppi avanzati
// (lingue/durata/ora/offerte) restano in sync con le checkbox del foglio (stesso
// `active`). La label cade su `dict.filters.facets[id]` e in mancanza su
// `dict.filters.options[id]` (vedi FilterBar.facetLabel), niente label duplicate.
export const filterFacets: FilterFacet[] = [
  { id: "skip-line" },
  { id: "free-cancellation" },
  { id: "special-offer" },
  { id: "short" },
  { id: "half-day" },
  { id: "private" },
  { id: "shuttle" },
  { id: "english" },
  { id: "italian" },
  { id: "spanish" },
  { id: "french" },
  { id: "german" },
  { id: "chinese" },
  { id: "japanese" },
  { id: "morning" },
  { id: "afternoon" },
  { id: "evening" },
  { id: "dur-1-4h" },
  { id: "dur-4h-1d" },
];

export interface FilterOption {
  /** A `Product.tags` value; label/hint come from `dict.filters.options[id]`. */
  id: string;
  /** Render a one-line hint under the label (dict `options[id].hint`). */
  hasHint?: boolean;
}

export interface FilterGroup {
  /** Section id; title from `dict.filters.groups[id]`. */
  id: string;
  options: FilterOption[];
  /** Collapse to the first N options behind a "Mostra altro" toggle. */
  collapseAfter?: number;
}

/**
 * Advanced-filter groups for the bottom-sheet — Viator-style sections with
 * checkboxes, distinct from the quick `filterFacets` chips. Matching is OR
 * **within** a group and AND **across** groups (see `ListingResults`):
 * e.g. "Italiano OR Inglese", then AND "Mattina".
 */
export const filterGroups: FilterGroup[] = [
  {
    id: "timeOfDay",
    options: [
      { id: "morning", hasHint: true },
      { id: "afternoon", hasHint: true },
      { id: "evening", hasHint: true },
    ],
  },
  {
    id: "language",
    collapseAfter: 4,
    options: [
      { id: "italian" },
      { id: "english" },
      { id: "spanish" },
      { id: "french" },
      { id: "german" },
      { id: "chinese" },
      { id: "japanese" },
    ],
  },
  {
    id: "duration",
    options: [
      { id: "dur-1h" },
      { id: "dur-1-4h" },
      { id: "dur-4h-1d" },
      { id: "dur-1d" },
    ],
  },
  {
    id: "specials",
    options: [{ id: "special-offer" }, { id: "free-cancellation" }],
  },
];

/** tag id → group id, for OR-within / AND-across matching in the listing. */
export const tagToGroup: Record<string, string> = Object.fromEntries(
  filterGroups.flatMap((g) => g.options.map((o) => [o.id, g.id])),
);

const cardAvatars = [
  "/images/avatar-review-1.png",
  "/images/avatar-review-2.png",
  "/images/avatar-review-3.png",
];

const rawListingProducts: Product[] = [
  {
    id: "musei-vaticani-storia-papa",
    city: "roma",
    category: "Tour Guidato",
    title: "Musei Vaticani, alla scoperta della vera storia del papa",
    image: "/images/card-musei-vaticani.png",
    avatars: cardAvatars,
    rating: 4.7,
    meta: ["4 ore", "Salta la coda", "Navetta"],
    tags: ["english", "italian", "spanish", "french", "skip-line", "shuttle", "free-cancellation", "half-day", "special-offer", "morning", "dur-1-4h", "attr-musei-vaticani"],
    badge: "20% sulle Attività",
    urgency: "Si esaurisce in fretta",
    priceFrom: 32,
    oldPrice: 44,
    currency: "€",
  },
  {
    id: "colosseo-salta-fila-gladiatori",
    city: "roma",
    category: "Tour Guidato",
    title: "Colosseo, ingresso salta fila e guida fino alle camere dei gladiatori",
    image: "/images/card-colosseo.png",
    avatars: cardAvatars,
    rating: 4.7,
    meta: ["4 ore", "Salta la coda"],
    tags: ["english", "italian", "german", "skip-line", "free-cancellation", "half-day", "private", "special-offer", "afternoon", "dur-1-4h", "attr-colosseo"],
    badge: "20% sulle Attività",
    urgency: "Si esaurisce in fretta",
    priceFrom: 32,
    oldPrice: 44,
    currency: "€",
  },
  {
    id: "tour-guidato-roma-antica",
    city: "roma",
    category: "Tour Guidato",
    title: "Roma antica: Foro Romano e Palatino con guida esperta",
    image: "/images/card-tour-guidato.png",
    avatars: cardAvatars,
    rating: 4.7,
    meta: ["4 ore", "Salta la coda", "Navetta"],
    tags: ["english", "french", "skip-line", "shuttle", "free-cancellation", "half-day", "special-offer", "morning", "dur-1-4h"],
    badge: "20% sulle Attività",
    urgency: "Si esaurisce in fretta",
    priceFrom: 32,
    oldPrice: 44,
    currency: "€",
  },
  {
    id: "colosseo-arena-sotterranei",
    city: "roma",
    category: "Navetta",
    title: "Colosseo, Arena e Sotterranei: tour esclusivo salta fila",
    image: "/images/card-colosseo.png",
    avatars: cardAvatars,
    rating: 4.7,
    meta: ["4 ore", "Salta la coda"],
    tags: ["english", "italian", "spanish", "skip-line", "shuttle", "free-cancellation", "half-day", "private", "special-offer", "afternoon", "dur-1-4h", "attr-colosseo"],
    badge: "20% sulle Attività",
    urgency: "Si esaurisce in fretta",
    priceFrom: 32,
    oldPrice: 44,
    currency: "€",
  },
  {
    id: "musei-vaticani-cappella-sistina",
    city: "roma",
    category: "Tour Guidato",
    title: "Musei Vaticani e Cappella Sistina con ingresso prioritario",
    image: "/images/card-musei-vaticani.png",
    avatars: cardAvatars,
    rating: 4.7,
    meta: ["3 ore", "Salta la coda"],
    tags: ["english", "italian", "chinese", "skip-line", "free-cancellation", "short", "half-day", "special-offer", "morning", "dur-1-4h", "attr-musei-vaticani"],
    badge: "20% sulle Attività",
    urgency: "Si esaurisce in fretta",
    priceFrom: 32,
    oldPrice: 44,
    currency: "€",
  },
  {
    id: "tour-guidato-vaticano-completo",
    city: "roma",
    category: "Tour Guidato",
    title: "Vaticano completo: Musei, Cappella Sistina e Basilica di San Pietro",
    image: "/images/card-tour-guidato.png",
    avatars: cardAvatars,
    rating: 4.7,
    meta: ["5 ore", "Salta la coda", "Navetta"],
    tags: ["english", "spanish", "german", "skip-line", "shuttle", "free-cancellation", "special-offer", "morning", "dur-4h-1d", "attr-musei-vaticani"],
    badge: "20% sulle Attività",
    urgency: "Si esaurisce in fretta",
    priceFrom: 32,
    oldPrice: 44,
    currency: "€",
  },
  {
    id: "colosseo-foro-palatino-classico",
    city: "roma",
    category: "Navetta",
    title: "Colosseo, Foro Romano e Palatino: il tour classico di Roma",
    image: "/images/card-colosseo.png",
    avatars: cardAvatars,
    rating: 4.7,
    meta: ["4 ore", "Salta la coda"],
    tags: ["english", "italian", "japanese", "skip-line", "shuttle", "free-cancellation", "half-day", "special-offer", "afternoon", "dur-1-4h", "attr-colosseo"],
    badge: "20% sulle Attività",
    urgency: "Si esaurisce in fretta",
    priceFrom: 32,
    oldPrice: 44,
    currency: "€",
  },
  {
    id: "musei-vaticani-mattina-presto",
    city: "roma",
    category: "Tour Guidato",
    title: "Musei Vaticani all'apertura: visita guidata senza folla",
    image: "/images/card-musei-vaticani.png",
    avatars: cardAvatars,
    rating: 4.7,
    meta: ["3 ore", "Salta la coda", "Navetta"],
    tags: ["english", "italian", "french", "skip-line", "shuttle", "free-cancellation", "short", "half-day", "special-offer", "morning", "dur-1-4h", "attr-musei-vaticani"],
    badge: "20% sulle Attività",
    urgency: "Si esaurisce in fretta",
    priceFrom: 32,
    oldPrice: 44,
    currency: "€",
  },
  {
    id: "colosseo-tour-notturno",
    city: "roma",
    category: "Tour Guidato",
    title: "Colosseo by night: tour serale con accesso esclusivo",
    image: "/images/card-tour-guidato.png",
    avatars: cardAvatars,
    rating: 4.7,
    meta: ["2 ore", "Salta la coda"],
    tags: ["english", "italian", "spanish", "skip-line", "free-cancellation", "short", "private", "special-offer", "evening", "dur-1-4h", "attr-colosseo"],
    badge: "20% sulle Attività",
    urgency: "Si esaurisce in fretta",
    priceFrom: 32,
    oldPrice: 44,
    currency: "€",
  },
];

/**
 * ISO language per "<lingua>" facet tag → le card listing mostrano le bandierine
 * (Figma 64:5089 / 221:4158) derivandole dai tag, senza duplicare il dato in ogni
 * fixture. Coi tour reali `languages` arriva dall'API (vedi `lib/catalog/adapters`).
 */
const TAG_TO_LANG: Record<string, string> = {
  english: "en",
  italian: "it",
  spanish: "es",
  french: "fr",
  german: "de",
  portuguese: "pt",
  russian: "ru",
};

export const listingProducts: Product[] = rawListingProducts.map((p) => ({
  ...p,
  languages:
    p.languages ??
    (p.tags ?? []).flatMap((t) => {
      const iso = TAG_TO_LANG[t];
      return iso ? [iso] : [];
    }),
}));

export const attractions: Attraction[] = [
  {
    slug: "colosseo",
    name: "Colosseo",
    city: "Roma",
    image: "/images/card-colosseo.png",
    description:
      "Esperienza stupenda, guida molto preparata. Mio parere personale la migliore in assoluto se…",
  },
  {
    slug: "fontana-di-trevi",
    name: "Fontana di Trevi",
    city: "Roma",
    image: "/images/card-tour-guidato.png",
    description:
      "Esperienza stupenda, guida molto preparata. Mio parere personale la migliore in assoluto se…",
  },
  {
    slug: "pantheon",
    name: "Pantheon",
    city: "Roma",
    image: "/images/card-colosseo.png",
    description:
      "Esperienza stupenda, guida molto preparata. Mio parere personale la migliore in assoluto se…",
  },
  {
    slug: "musei-vaticani",
    name: "Musei Vaticani",
    city: "Roma",
    image: "/images/card-musei-vaticani.png",
    description:
      "Esperienza stupenda, guida molto preparata. Mio parere personale la migliore in assoluto se…",
  },
];

export const faqs: Faq[] = [
  {
    question: "Quali sono i luoghi migliori?",
    answer:
      "A Roma ci sono tantissime attrazioni da vedere, soprattutto se pensiamo anche al Vaticano con i Musei Vaticani e la Cappella Sistina.",
  },
  {
    question: "Quanti giorni servono per visitarla?",
    answer:
      "Per i luoghi principali bastano 3 giorni, ma con una settimana puoi goderti la città con calma e scoprire anche i quartieri meno turistici.",
  },
  {
    question: "Qual è il periodo migliore per visitare Roma?",
    answer:
      "La primavera e l'autunno offrono il clima ideale e meno folla. In estate fa molto caldo, perciò conviene prenotare i tour nelle prime ore del mattino.",
  },
];
