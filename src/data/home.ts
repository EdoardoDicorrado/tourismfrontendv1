/**
 * Mock data for the homepage.
 *
 * The storefront/public API on tatanka3 does not exist yet (see CLAUDE.md), so
 * the homepage renders from these typed fixtures. When the catalog API lands,
 * swap these for `backendFetch()` calls returning the same shapes.
 * Copy and imagery mirror the Figma "01 Homepage" design.
 */

import type { Locale } from "@/lib/i18n/config";

export interface City {
  slug: string;
  name: string;
  thumb?: string;
}

export interface TrustFeature {
  icon: string;
  /** Exact icon box size from Figma (node 1:855) — preserves each glyph's aspect ratio. */
  iconWidth: number;
  iconHeight: number;
  title: string;
  text: string;
}

export interface Product {
  id: string;
  city: string;
  /** Detail-page slug, when a product page exists. Cards link to the city listing otherwise. */
  slug?: string;
  category: string;
  title: string;
  image: string;
  avatars: string[];
  rating: number;
  /** Real approved-review count from the API. `undefined` for fixture-only cards; when `0` the card hides the rating instead of showing a fake one. */
  reviewsCount?: number;
  /** ISO language codes the tour is offered in — drives the card's language flags. */
  languages?: string[];
  meta: string[];
  /** Facet ids the product matches (see `filterFacets`); drives listing filters. */
  tags?: string[];
  /**
   * ISO `YYYY-MM-DD` days the tour is bookable, driving the listing's date-range
   * filter. Populated with mock availability in `@/lib/catalog` until the CRM
   * availability API exists (see `@/data/availability`); `undefined` on cards
   * that don't need it (home offers).
   */
  availableDates?: string[];
  badge?: string;
  urgency?: string;
  priceFrom: number;
  oldPrice?: number;
  currency: string;
}

export interface Destination {
  slug: string;
  name: string;
  image: string;
  rating: number;
  experiences: number;
  description: string;
  badge?: string;
}

export interface Review {
  id: string;
  author: string;
  tour: string;
  date: string;
  rating: number;
  text: string;
  /** Backend display order on the home (lower = first). Omitted in fixtures → curated array order. */
  position?: number;
}

export const cities: City[] = [
  { slug: "roma", name: "Roma", thumb: "/images/tab-roma.png" },
  { slug: "firenze", name: "Firenze", thumb: "/images/tab-firenze.png" },
  { slug: "torino", name: "Torino", thumb: "/images/tab-torino.png" },
  { slug: "bologna", name: "Bologna", thumb: "/images/tab-torino.png" },
];

export const trustFeatures: TrustFeature[] = [
  {
    icon: "/images/icon-ticket.svg",
    iconWidth: 45,
    iconHeight: 42,
    title: "Biglietti di ingresso",
    text: "Tantissime opzioni flessibili grazie alle cancellazioni gratuite.",
  },
  {
    icon: "/images/icon-flexibility.svg",
    iconWidth: 43,
    iconHeight: 43,
    title: "Flessibilità garantita",
    text: "Tantissime opzioni flessibili grazie alle cancellazioni gratuite.",
  },
  {
    icon: "/images/icon-support.svg",
    iconWidth: 45,
    iconHeight: 45,
    title: "Supporto 24/7",
    text: "Tantissime opzioni flessibili grazie alle cancellazioni gratuite.",
  },
];

const cardAvatars = [
  "/images/avatar-review-1.png",
  "/images/avatar-review-2.png",
  "/images/avatar-review-3.png",
];

/**
 * Locale-independent parts of each offer. The real product detail only exists
 * for `tour-citta-arena-colosseo`, so every card links there for now; swap the
 * slug per product once the catalog API supplies real detail pages.
 */
const offerBase = [
  {
    id: "musei-vaticani-tour",
    city: "roma",
    slug: "tour-citta-arena-colosseo",
    image: "/images/card-musei-vaticani.jpg",
  },
  {
    id: "colosseo-salta-fila",
    city: "roma",
    slug: "tour-citta-arena-colosseo",
    image: "/images/card-colosseo.jpg",
  },
  {
    id: "colosseo-foro-palatino",
    city: "roma",
    slug: "tour-citta-arena-colosseo",
    image: "/images/card-colosseo.jpg",
  },
  {
    id: "colosseo-arena-sotterranei",
    city: "roma",
    slug: "tour-citta-arena-colosseo",
    image: "/images/card-colosseo.jpg",
  },
] as const;

/** Per-locale offer content — simulates what the backend returns via Accept-Language. */
interface OfferContent {
  category: string;
  title: string;
  meta: string[];
  badge: string;
  urgency: string;
}

const offerContent: Record<Locale, OfferContent[]> = {
  it: [
    {
      category: "Tour Guidato",
      title: "Musei Vaticani, alla scoperta della vera storia del papa",
      meta: ["4 ore", "Salta la coda", "Navetta"],
      badge: "20% sulle Attività",
      urgency: "Si esaurisce in fretta",
    },
    {
      category: "Tour Guidato",
      title: "Colosseo, ingresso salta fila e guida fino alle camere dei gladiatori",
      meta: ["4 ore", "Salta la coda"],
      badge: "20% sulle Attività",
      urgency: "Si esaurisce in fretta",
    },
    {
      category: "Tour Guidato",
      title: "Colosseo, Foro Romano e Palatino con guida esperta",
      meta: ["4 ore", "Salta la coda"],
      badge: "20% sulle Attività",
      urgency: "Si esaurisce in fretta",
    },
    {
      category: "Tour Guidato",
      title: "Colosseo, Arena e Sotterranei: tour esclusivo salta fila",
      meta: ["4 ore", "Salta la coda", "Navetta"],
      badge: "20% sulle Attività",
      urgency: "Si esaurisce in fretta",
    },
  ],
  en: [
    {
      category: "Guided Tour",
      title: "Vatican Museums: discover the true story of the Pope",
      meta: ["4 hours", "Skip the line", "Shuttle"],
      badge: "20% on activities",
      urgency: "Selling out fast",
    },
    {
      category: "Guided Tour",
      title: "Colosseum: skip-the-line entry and guide to the gladiators' chambers",
      meta: ["4 hours", "Skip the line"],
      badge: "20% on activities",
      urgency: "Selling out fast",
    },
    {
      category: "Guided Tour",
      title: "Colosseum, Roman Forum and Palatine Hill with expert guide",
      meta: ["4 hours", "Skip the line"],
      badge: "20% on activities",
      urgency: "Selling out fast",
    },
    {
      category: "Guided Tour",
      title: "Colosseum, Arena and Underground: exclusive skip-the-line tour",
      meta: ["4 hours", "Skip the line", "Shuttle"],
      badge: "20% on activities",
      urgency: "Selling out fast",
    },
  ],
  es: [
    {
      category: "Tour Guiado",
      title: "Museos Vaticanos: descubre la verdadera historia del papa",
      meta: ["4 horas", "Salta la cola", "Lanzadera"],
      badge: "20% en actividades",
      urgency: "Se agota rápido",
    },
    {
      category: "Tour Guiado",
      title: "Coliseo: entrada sin colas y guía hasta las cámaras de los gladiadores",
      meta: ["4 horas", "Salta la cola"],
      badge: "20% en actividades",
      urgency: "Se agota rápido",
    },
    {
      category: "Tour Guiado",
      title: "Coliseo, Foro Romano y Palatino con guía experto",
      meta: ["4 horas", "Salta la cola"],
      badge: "20% en actividades",
      urgency: "Se agota rápido",
    },
    {
      category: "Tour Guiado",
      title: "Coliseo, Arena y Subterráneos: tour exclusivo sin colas",
      meta: ["4 horas", "Salta la cola", "Lanzadera"],
      badge: "20% en actividades",
      urgency: "Se agota rápido",
    },
  ],
};

/** Build the homepage offers for a locale — mirrors a backend catalog call. */
export function getOffers(lang: Locale): Product[] {
  return offerBase.map((base, i) => ({
    ...base,
    ...offerContent[lang][i],
    avatars: cardAvatars,
    rating: 4.7,
    priceFrom: 32,
    oldPrice: 44,
    currency: "€",
  }));
}

export const destinations: Destination[] = [
  {
    slug: "roma",
    name: "Roma",
    image: "/images/card-colosseo.jpg",
    rating: 4.7,
    experiences: 16,
    description:
      "Esperienza stupenda, guida molto preparata. Dal Colosseo ai Musei Vaticani senza code.",
    badge: "Attività in sconto",
  },
  {
    slug: "firenze",
    name: "Firenze",
    image: "/images/card-firenze.jpg",
    rating: 4.7,
    experiences: 16,
    description:
      "Esperienza stupenda, guida molto preparata. La culla del Rinascimento tutta da vivere.",
    badge: "Attività in sconto",
  },
  {
    slug: "torino",
    name: "Torino",
    image: "/images/card-torino.jpg",
    rating: 4.7,
    experiences: 16,
    description:
      "Esperienza stupenda, guida molto preparata. La prima capitale d'Italia ti aspetta.",
    badge: "Attività in sconto",
  },
];

export const reviewsSummary = {
  rating: 4.7,
  count: 8000,
};

export const reviews: Review[] = [
  {
    id: "r1",
    author: "Mario Rossi",
    tour: "Visita guidata Colosseo e Musei Vaticani",
    date: "Marzo 2026",
    rating: 5,
    text: "Esperienza stupenda, guida molto preparata. Abbiamo saltato la coda e visitato tutto con calma. Consigliatissimo!",
  },
  {
    id: "r2",
    author: "Mario Rossi",
    tour: "Visita guidata Colosseo e Musei Vaticani",
    date: "Febbraio 2026",
    rating: 5,
    text: "Organizzazione impeccabile e prezzo onesto. Il tour del Colosseo è stato il momento clou del nostro viaggio.",
  },
  {
    id: "r3",
    author: "Mario Rossi",
    tour: "Visita guidata Colosseo e Musei Vaticani",
    date: "Febbraio 2026",
    rating: 5,
    text: "Prenotazione semplice e supporto sempre disponibile. Guida gentilissima e competente. Torneremo!",
  },
];

export const paymentMethods = [
  "/images/pay-mastercard.svg",
  "/images/pay-amex.svg",
  "/images/pay-visa.svg",
  "/images/pay-paypal.svg",
];

// w/h = dimensioni intrinseche reali degli SVG (dal viewBox): la "f" di Facebook
// è 1:2 (12×24), le altre quadrate. Servono al footer per non stirare le icone.
export const socialLinks = [
  { icon: "/images/social-facebook.svg", label: "Facebook", href: "#", w: 12, h: 24 },
  { icon: "/images/social-linkedin.svg", label: "LinkedIn", href: "#", w: 24, h: 24 },
  { icon: "/images/social-instagram.svg", label: "Instagram", href: "#", w: 24, h: 24 },
];
