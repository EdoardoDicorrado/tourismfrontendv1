/**
 * Map storefront API shapes → the frontend's existing view models.
 *
 * The storefront API is the source of truth for catalog **identity, localized
 * text, media and duration**, but does NOT (yet) carry price, badge, urgency,
 * rating or filter facets. Those are merged in from the local fixtures by slug
 * — the seeded backend slugs match the fixture ids 1:1 (see the backend
 * `TourismotionStorefrontDemoSeeder`). When the backend grows price/availability
 * fields, drop the fixture merge and read them straight from the API.
 *
 * Pure functions — safe to import from server or client.
 */

import { destinations as mockDestinations, type Destination, type Product } from "@/data/home";
import { attractions as mockAttractions, listingProducts, type Attraction } from "@/data/listing";
import type {
  BookingOption,
  InfoRow,
  GalleryImage,
  ParticipantType,
  ProductDetail,
} from "@/data/product";
import type {
  ApiDestinationCard,
  ApiMonumentCard,
  ApiProductCard,
  ApiProductDetail,
} from "@/lib/api/storefront";

const FALLBACK_IMAGE = "/images/card-colosseo.png";
const FALLBACK_AVATARS = [
  "/images/avatar-review-1.png",
  "/images/avatar-review-2.png",
  "/images/avatar-review-3.png",
];

/**
 * Demo gallery shots used to PAD a product's gallery up to {@link MIN_GALLERY}
 * images. The live storefront API returns `gallery: []` (only a cover) for the
 * seeded tours, so the gallery slider (dots/swipe) and the "Mostra galleria"
 * lightbox have nothing to show. We top it up with these local demo images so
 * both are testable. Remove once the backend serves real gallery media.
 */
const DEMO_GALLERY: { src: string }[] = [
  { src: "/images/card-colosseo.png" },
  { src: "/images/card-musei-vaticani.png" },
  { src: "/images/card-tour-guidato.png" },
  { src: "/images/hero-colosseo.png" },
];
const MIN_GALLERY = 5;

/**
 * Demo social-proof for the product header (Figma 64:9690). The storefront API
 * carries no "tours done" counter and the seeded tours have no approved reviews,
 * so the header's "+10.000 tour effettuati" row and the rating block would stay
 * hidden (ProductHeader gates the rating on `reviews > 0`). Per the orchestrator
 * decision (agency task #24) we show them with these placeholders. Real review
 * aggregates, when present, always win over the demo. ⚠️ Remove once the backend
 * serves real review aggregates — a fixed demo rate on every tour is acknowledged
 * filler, not real data.
 */
const DEMO_TOURS_COUNT = "+10.000";
const DEMO_RATING = 4.7;
const DEMO_REVIEWS = 8000;

/** ISO 4217 → display symbol for storefront price labels. */
const CURRENCY_SYMBOL: Record<string, string> = { EUR: "€", USD: "$", GBP: "£" };

/** Backend destination card → home `Destination`. */
export function adaptDestination(api: ApiDestinationCard): Destination {
  const mock = mockDestinations.find((d) => d.slug === api.slug);
  return {
    slug: api.slug,
    name: api.name,
    image: api.cover_url ?? mock?.image ?? FALLBACK_IMAGE,
    rating: mock?.rating ?? 4.7,
    experiences: api.products_count || mock?.experiences || 0,
    description: api.description ?? mock?.description ?? "",
    badge: mock?.badge,
  };
}

/** Backend monument card → listing `Attraction`. */
export function adaptAttraction(api: ApiMonumentCard): Attraction {
  const mock = mockAttractions.find((a) => a.slug === api.slug);
  return {
    slug: api.slug,
    name: api.name,
    image: api.cover_url ?? mock?.image ?? FALLBACK_IMAGE,
    description: api.short_description ?? mock?.description ?? "",
    city: mock?.city,
  };
}

/** Map the real catalog data a card carries → the listing's filter facet ids. */
function facetTags(api: ApiProductCard): string[] {
  const tags = new Set<string>();
  const langs = api.languages ?? [];
  if (langs.includes("en")) tags.add("english");
  if (langs.includes("it")) tags.add("italian");
  if (api.duration_minutes != null) {
    if (api.duration_minutes <= 150) tags.add("short");
    if (api.duration_minutes <= 360) tags.add("half-day");
  }
  return [...tags];
}

/** Backend product card → catalog `Product` (presentation fields merged from fixtures). */
export function adaptProduct(api: ApiProductCard, citta: string): Product {
  const mock = listingProducts.find((p) => p.id === api.slug);
  const hours = api.duration_minutes ? Math.round(api.duration_minutes / 60) : null;
  return {
    id: api.slug,
    city: citta,
    // Every seeded product has a real detail page (GET /products/{slug}), so the
    // card links straight to it via the product slug.
    slug: api.slug,
    category: mock?.category ?? "Tour Guidato",
    title: api.name,
    image: api.thumb_url ?? mock?.image ?? FALLBACK_IMAGE,
    avatars: mock?.avatars ?? FALLBACK_AVATARS,
    // Real languages, price and reviews come straight from the API now. Rating
    // falls back to the fixture and finally to the design's 4.7 placeholder so
    // the card always shows a rate left of the price (per Figma) until the
    // backend seeds real review aggregates; price falls back to the mock only
    // if the API can't resolve a valid "from" price.
    languages: api.languages ?? [],
    reviewsCount: api.reviews_count,
    rating: api.rating ?? mock?.rating ?? 4.7,
    meta: mock?.meta ?? (hours ? [`${hours} ore`] : []),
    // Facet tags derived from the tour's REAL languages + duration so the
    // listing filters (Tour in inglese / Italiano / brevi / mezza giornata)
    // actually work against seeded products instead of empty fixture tags.
    tags: mock?.tags ?? facetTags(api),
    badge: mock?.badge,
    urgency: mock?.urgency,
    priceFrom: api.price_from ?? mock?.priceFrom ?? 0,
    oldPrice: mock?.oldPrice,
    currency: CURRENCY_SYMBOL[api.currency] ?? mock?.currency ?? "€",
  };
}

const ITALIAN_MONTHS = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

/** ISO language code → Italian display name (the storefront UI is Italian). */
const LANG_NAME: Record<string, string> = {
  en: "Inglese", it: "Italiano", es: "Spagnolo", fr: "Francese",
  de: "Tedesco", pt: "Portoghese", ru: "Russo",
};

/** OCTO unit reference/type → [singular, plural] Italian labels. */
const PARTICIPANT_LABEL: Record<string, [string, string]> = {
  adult: ["Adulto", "Adulti"],
  child: ["Bambino", "Bambini"],
  infant: ["Neonato", "Neonati"],
  senior: ["Senior", "Senior"],
  youth: ["Ragazzo", "Ragazzi"],
  student: ["Studente", "Studenti"],
};

/**
 * Placeholder time slots. Live availability (real dates + times) has no
 * storefront API yet, so the booking widget runs on indicative slots — same
 * acknowledged mock as the calendar grid in `@/lib/calendar`. No fake discounts.
 */
const PLACEHOLDER_SLOTS = [{ time: "09:00" }, { time: "11:00" }, { time: "14:00" }];

const capitalize = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/**
 * Flatten editorial HTML (`<ul><li>…`, `<p>…`) to readable plain text — the
 * text sections render inside a single `<p>`, so list/paragraph breaks become
 * " · " separators and tags/entities are stripped. Empty → "".
 */
function htmlToText(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<\/(li|p)>/gi, " · ")
    .replace(/<br\s*\/?>/gi, " · ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s*·\s*/g, " · ")
    .replace(/\s+/g, " ")
    .replace(/^[\s·]+|[\s·]+$/g, "")
    .trim();
}

/**
 * Split editorial HTML into readable paragraphs — each `<p>`/`<li>`/`<br>`-
 * delimited block becomes one trimmed, tag-free string; empties are dropped.
 * Lets the UI render real paragraph breaks instead of the single " · "-joined
 * blob that {@link htmlToText} produces. Plain text (no tags) → one paragraph.
 */
function htmlToParagraphs(html: string | null | undefined): string[] {
  if (!html) return [];
  return html
    .replace(/<br\s*\/?>/gi, "</p>")
    .split(/<\/(?:p|li|div|h[1-6])>/i)
    .map((chunk) => htmlToText(chunk))
    .filter(Boolean);
}

const langName = (code: string | null): string | null =>
  code ? LANG_NAME[code] ?? code.toUpperCase() : null;

function durationLabel(minutes: number | null): string | null {
  if (!minutes) return null;
  if (minutes < 60) return `Durata ${minutes} minuti`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hLabel = `${h} ${h === 1 ? "ora" : "ore"}`;
  return m === 0 ? `Durata ${hLabel}` : `Durata ${h}h ${m}min`;
}

function ageRangeLabel(min: number | null, max: number | null): string {
  if (min != null && max != null) return `Dai ${min} ai ${max} anni`;
  if (min != null) return `Dai ${min} anni`;
  if (max != null) return `Fino a ${max} anni`;
  return "";
}

/** Free-cancellation cutoff (minutes) → human copy. */
function freeCancellationCopy(minutes: number | null): string {
  if (minutes == null) return "";
  // A day-multiple (1440) reduces to the same "N ore prima" as the hour branch
  // (1440/1440*24 === 1440/60), so the hour branch already covers it.
  if (minutes % 60 === 0) return `Cancellazione gratuita fino a ${minutes / 60} ore prima`;
  return `Cancellazione gratuita fino a ${minutes} minuti prima`;
}

/** "Informazioni generali" rows synthesized from the tour's real attributes. */
function buildInfoRows(api: ApiProductDetail): InfoRow[] {
  const rows: InfoRow[] = [];

  if (api.options.some((o) => o.freeCancellationCutoffMinutes != null)) {
    rows.push({
      icon: "/images/icon-cancellation.svg",
      title: "Cancellazione gratuita",
      text: "Cancella gratuitamente entro i termini indicati su ciascuna opzione.",
    });
  }

  const duration = durationLabel(api.durationMinutes);
  if (duration) {
    rows.push({ icon: "/images/icon-duration.svg", title: duration, text: "Durata indicativa dell'esperienza." });
  }

  const langs = [...new Set(api.options.map((o) => o.language).filter(Boolean) as string[])];
  if (langs.length > 0) {
    const names = langs.map((l) => langName(l)).join(", ");
    rows.push({
      icon: "/images/icon-languages.svg",
      title: "Lingue disponibili",
      text: `Disponibile in: ${names}.`,
    });
  }

  const maxUnits = Math.max(0, ...api.options.map((o) => o.maxUnits ?? 0));
  if (maxUnits > 0) {
    rows.push({
      icon: "/images/icon-group.svg",
      title: "Opzioni per gruppi",
      text: `Fino a ${maxUnits} partecipanti per prenotazione.`,
    });
  }

  return rows;
}

/**
 * Backend product detail (`GET /products/{slug}`) → the page's `ProductDetail`
 * view model. Identity, editorial copy, media, prices, languages and the
 * bookable options come straight from the API; only the parts with no API yet
 * (live availability → calendar/slots, plus the design's decorative social
 * proof) stay as acknowledged placeholders.
 */
export function adaptProductDetail(api: ApiProductDetail, citta: string): ProductDetail {
  // Gallery: hero first, then the gallery collection. Always ≥1 image.
  const gallery: GalleryImage[] = [];
  if (api.coverUrl) gallery.push({ src: api.coverUrl, alt: api.title });
  for (const g of api.gallery) gallery.push({ src: g.src, alt: g.alt });
  if (gallery.length === 0) gallery.push({ src: FALLBACK_IMAGE, alt: api.title });
  // Top up with demo shots when the API gallery is thin (seeded tours ship just a
  // cover) so the slider/dots + "Mostra galleria" lightbox have something to show.
  for (const demo of DEMO_GALLERY) {
    if (gallery.length >= MIN_GALLERY) break;
    if (!gallery.some((g) => g.src === demo.src)) gallery.push({ src: demo.src, alt: api.title });
  }

  // Participants: real OCTO units → labelled rows; keys align with option prices.
  let participants: ParticipantType[] = api.participants.map((p) => {
    const labelKey = (p.type ?? p.key ?? "").toLowerCase();
    const [label, labelPlural] = PARTICIPANT_LABEL[labelKey] ?? [
      p.displayName ?? capitalize(p.key),
      p.displayName ?? capitalize(p.key),
    ];
    const min = p.min ?? (p.required ? 1 : 0);
    return {
      key: p.key,
      label,
      labelPlural,
      ageRange: ageRangeLabel(p.minAge, p.maxAge),
      min: p.required && min < 1 ? 1 : min,
    };
  });
  if (participants.length === 0) {
    participants = [{ key: "adult", label: "Adulto", labelPlural: "Adulti", ageRange: "", min: 1 }];
  }

  // Options: one per published variant, ordered so the tour's default language
  // comes first (fixes the "always opens in English" default). Each price map is
  // lowercased and backfilled so every participant key resolves to a number.
  const options: BookingOption[] = api.options
    .slice()
    .sort((a, b) => {
      const rank = (l: string | null) => (l && api.defaultLanguage && l === api.defaultLanguage ? 0 : 1);
      return rank(a.language) - rank(b.language);
    })
    .map((o) => {
      const lowerPrices: Record<string, number> = {};
      for (const [k, v] of Object.entries(o.prices)) lowerPrices[k.toLowerCase()] = v;
      const prices: Record<string, number> = {};
      for (const p of participants) prices[p.key] = lowerPrices[p.key] ?? 0;

      const name = langName(o.language);
      const bullets = [
        "Visita guidata",
        durationLabel(api.durationMinutes),
        name ? `Lingua: ${name}` : null,
      ].filter(Boolean) as string[];

      return {
        id: o.id,
        title: o.title,
        // No per-language flag assets (only flag-uk exists); the language is
        // surfaced in the title + bullets instead of a fake flag. The concise
        // product blurb reads better here than the option's HTML notes.
        description: api.shortDescription ?? htmlToText(o.description),
        bullets,
        date: "",
        slots: PLACEHOLDER_SLOTS,
        prices,
        freeCancellation: freeCancellationCopy(o.freeCancellationCutoffMinutes),
      };
    });

  // Distinct ISO languages the tour is offered in (from the option locales),
  // default language first to mirror the option ordering → drives the circular
  // flags in the product header (Figma 64:9690), same codes as the listing card.
  const defaultLang = api.defaultLanguage?.toLowerCase() ?? null;
  const languages = [
    ...new Set(
      api.options
        .map((o) => o.language)
        .filter((l): l is string => Boolean(l))
        .map((l) => l.toLowerCase()),
    ),
  ].sort((a, b) => (a === defaultLang ? 0 : 1) - (b === defaultLang ? 0 : 1));

  const included = api.included ? { title: "Cosa è incluso", items: api.included.items } : undefined;
  const notIncluded = api.notIncluded
    ? { title: "Cosa non è incluso", items: api.notIncluded.items }
    : undefined;

  const meetingPoint =
    api.meetingPoint && (api.meetingPoint.text || api.meetingPoint.mapUrl)
      ? {
          text: api.meetingPoint.text ?? "",
          // No per-product static map asset; reuse the design's map illustration.
          mapImage: "/images/map-meeting-point.png",
          mapUrl: api.meetingPoint.mapUrl ?? "#",
        }
      : undefined;

  const now = new Date();
  const priceFrom = api.priceFrom ?? 0;

  // Social proof: use the real review aggregate when the tour has approved
  // reviews; otherwise fall back to the demo rate so the header block shows
  // (orchestrator decision #24). Rating/reviews move together — never a real
  // rating with a demo count, or vice versa.
  const hasRealReviews = api.reviewsCount > 0;
  const rating = hasRealReviews ? (api.rating ?? DEMO_RATING) : DEMO_RATING;
  const reviews = hasRealReviews ? api.reviewsCount : DEMO_REVIEWS;

  // Demo fallback: a tour published with no bookable options would strand the
  // booking widget (no option cards → no checkout). Guarantee ONE option, with
  // the ≥2 placeholder slots, so the booking → checkout path is testable for
  // every product (same spirit as the `participants` fallback above and the
  // page's force-rendered preview sections). ⚠️ Remove once every catalog tour
  // ships real options.
  const safeOptions: BookingOption[] =
    options.length > 0
      ? options
      : [
          {
            id: "standard",
            title: api.title,
            description: api.shortDescription ?? htmlToText(api.description),
            bullets: [durationLabel(api.durationMinutes), "Visita guidata"].filter(
              Boolean,
            ) as string[],
            date: "",
            slots: PLACEHOLDER_SLOTS,
            prices: Object.fromEntries(participants.map((p) => [p.key, priceFrom])),
            freeCancellation: "",
          },
        ];

  return {
    slug: api.slug,
    city: api.city ?? citta,
    cityName: api.cityName ?? capitalize(citta),
    title: api.title,
    // Decorative "tours done" social proof (no API source) → demo placeholder
    // so the header row matches Figma (#24). Rating/reviews: real when present,
    // demo otherwise (see above).
    toursCount: DEMO_TOURS_COUNT,
    rating,
    reviews,
    languages,
    shortDescription: api.shortDescription ?? htmlToText(api.description),
    gallery,
    priceFrom,
    currency: CURRENCY_SYMBOL[api.currency] ?? "€",
    info: buildInfoRows(api),
    participants,
    // Placeholder pricing for the calendar grid (no live availability API).
    calendar: {
      monthLabel: ITALIAN_MONTHS[now.getMonth()],
      year: now.getFullYear(),
      basePrice: priceFrom,
      lowPrice: priceFrom,
      discountPercent: 0,
    },
    options: safeOptions,
    // Live tours ship the description as HTML → flatten to plain text (was
    // rendering raw `<p>` tags) and also expose the paragraph breakdown so the
    // UI can render proper paragraphs instead of one " · "-joined line.
    description: htmlToText(api.description),
    descriptionParagraphs: htmlToParagraphs(api.description),
    thingsToKnow: htmlToText(api.thingsToKnow) || undefined,
    included,
    notIncluded,
    meetingPoint,
    accessibility: htmlToText(api.accessibility) || undefined,
  };
}
