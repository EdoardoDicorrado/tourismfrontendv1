/**
 * Mock data for the product-detail page (`/attivita/[citta]/[prodotto]`).
 *
 * The storefront/public API on tatanka3 does not exist yet (see CLAUDE.md), so
 * the product page renders from these typed fixtures. When the catalog +
 * availability API lands, swap these for `backendFetch()` calls returning the
 * same shapes. Copy and imagery mirror the Figma "03 Scheda prodotto" design,
 * including its 2-step booking flow (select participants/date → choose option).
 */

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface InfoRow {
  icon: string;
  title: string;
  text: string;
}

export interface ParticipantType {
  /**
   * Stable key, aligned with the option price map. Fixtures use Italian
   * ("adulto"/"bambino"/"neonato"); real catalog data uses the OCTO unit
   * reference ("adult"/"child"/"infant"/…), so this is a free string.
   */
  key: string;
  /** Singular label, e.g. "Adulto". */
  label: string;
  /** Plural label, e.g. "Adulti". */
  labelPlural: string;
  ageRange: string;
  /** Minimum selectable count (adults start at 1). */
  min: number;
}

export interface TimeSlot {
  time: string;
  /** Percentage discount applied to this slot, e.g. 20. */
  discount?: number;
  /**
   * Real backend slot id (ULID) for this date+time. Present only when live
   * availability is wired; absent on placeholder/fixture slots (the cart then
   * carries an empty `slotId` and the order stays in preview).
   */
  slotId?: string;
  /** Remaining seats for this slot. Absent when availability is unknown (placeholder). */
  available?: number;
  /** True when the slot is fully booked — the time button is disabled. */
  soldOut?: boolean;
  /**
   * Per-unit-reference prices in EUR for THIS slot (keys = participant key),
   * when availability prices override the option's base prices. Absent on
   * placeholder slots → the option's `prices` apply.
   */
  prices?: Record<string, number>;
}

export interface BookingOption {
  id: string;
  title: string;
  /** Language flag shown on the card (only some options carry one). */
  flag?: string;
  description: string;
  bullets: string[];
  date: string;
  slots: TimeSlot[];
  /** Per-participant-type price in EUR (infants typically 0). */
  prices: Record<ParticipantType["key"], number>;
  /** Free-cancellation deadline copy. */
  freeCancellation: string;
}

export interface IncludedList {
  title: string;
  items: string[];
}

export interface MeetingPoint {
  text: string;
  mapImage: string;
  mapUrl: string;
}

export interface ProductDetail {
  slug: string;
  city: string;
  cityName: string;
  title: string;
  toursCount: string;
  rating: number;
  reviews: number;
  shortDescription: string;
  gallery: GalleryImage[];
  badge?: string;
  priceFrom: number;
  oldPrice?: number;
  currency: string;
  info: InfoRow[];
  participants: ParticipantType[];
  /** Calendar pricing inputs — the visible month grid is generated client-side. */
  calendar: {
    monthLabel: string;
    year: number;
    basePrice: number;
    lowPrice: number;
    discountPercent: number;
  };
  options: BookingOption[];
  description: string;
  // Editorial sections are optional: real catalog tours may not carry every
  // block, so the page renders each one only when present.
  thingsToKnow?: string;
  included?: IncludedList;
  notIncluded?: IncludedList;
  meetingPoint?: MeetingPoint;
  accessibility?: string;
}

const product: ProductDetail = {
  slug: "tour-citta-arena-colosseo",
  city: "roma",
  cityName: "Roma",
  title: "Roma: Tour della città, dall'Arena al Colosseo Romano",
  toursCount: "+10.000",
  rating: 4.7,
  reviews: 8000,
  shortDescription:
    "Esperienza stupenda, guida molto preparata. Mio parere personale la migliore in assoluto se vuoi scoprire la Roma antica senza perdere tempo in coda.",
  gallery: [
    { src: "/images/card-musei-vaticani.png", alt: "Musei Vaticani" },
    { src: "/images/card-colosseo.png", alt: "Colosseo Romano" },
    { src: "/images/card-tour-guidato.png", alt: "Tour guidato a Roma" },
    { src: "/images/hero-colosseo.png", alt: "Foro Romano" },
  ],
  badge: "-20% sulle attività",
  priceFrom: 38,
  oldPrice: 50,
  currency: "€",
  info: [
    {
      icon: "/images/icon-cancellation.svg",
      title: "Cancellazione gratuita",
      text: "Tantissime opzioni flessibili grazie alle cancellazioni gratuite.",
    },
    {
      icon: "/images/icon-duration.svg",
      title: "Durata 4 ore",
      text: "Tantissime opzioni flessibili grazie alle cancellazioni gratuite.",
    },
    {
      icon: "/images/icon-languages.svg",
      title: "Lingue disponibili",
      text: "Disponibile in italiano, inglese e spagnolo con guida esperta.",
    },
    {
      icon: "/images/icon-group.svg",
      title: "Opzioni per gruppi piccoli",
      text: "Tantissime opzioni flessibili per gruppi da 8 a 16 grazie alle cancellazioni gratuite.",
    },
  ],
  participants: [
    { key: "adulto", label: "Adulto", labelPlural: "Adulti", ageRange: "Dai 18 - 90+", min: 1 },
    { key: "bambino", label: "Bambino", labelPlural: "Bambini", ageRange: "Dai 6 - 17", min: 0 },
    { key: "neonato", label: "Neonato", labelPlural: "Neonati", ageRange: "Fino a 5 anni", min: 0 },
  ],
  calendar: {
    monthLabel: "Giugno",
    year: 2026,
    basePrice: 34,
    lowPrice: 22,
    discountPercent: 20,
  },
  options: [
    {
      id: "tour-italiano",
      title: "Tour in Italiano: Colosseo, Musei Vaticani e Foro Romano",
      description:
        "Esperienza stupenda, guida molto preparata. Mio parere personale la migliore in assoluto se cerchi un tour completo della Roma imperiale.",
      bullets: ["Visita guidata", "Durata 4 ore", "Lingua italiana"],
      date: "28/Giugno/2026",
      slots: [{ time: "12:00" }, { time: "12:30", discount: 20 }, { time: "13:00" }, { time: "13:30" }],
      prices: { adulto: 64, bambino: 44, neonato: 0 },
      freeCancellation: "Entro il giorno 23 alle ore 23:59",
    },
    {
      id: "tour-english",
      title: "Guided Tour in English: Colosseum, Vatican Museums & Roman Forum",
      flag: "/images/flag-uk.png",
      description:
        "Esperienza stupenda, guida molto preparata. Mio parere personale la migliore in assoluto se preferisci una guida in lingua inglese.",
      bullets: ["Visita guidata", "Durata 4 ore", "Lingua inglese"],
      date: "28/Giugno/2026",
      slots: [{ time: "10:30" }, { time: "11:00", discount: 20 }, { time: "14:00" }],
      prices: { adulto: 64, bambino: 44, neonato: 0 },
      freeCancellation: "Entro il giorno 23 alle ore 23:59",
    },
  ],
  description:
    "Vivi un viaggio nel cuore della Roma antica con una guida esperta che ti accompagnerà dall'Arena del Colosseo fino ai Fori Imperiali. Salterai la coda all'ingresso e scoprirai aneddoti e curiosità su gladiatori, imperatori e la vita quotidiana di duemila anni fa. Il tour prosegue poi verso i Musei Vaticani e la Cappella Sistina, dove ammirerai i capolavori di Michelangelo e Raffaello. Un'esperienza completa per chi vuole capire davvero la storia della Città Eterna.",
  thingsToKnow:
    "Ti consigliamo di indossare scarpe comode e di portare con te un documento d'identità valido. L'accesso ai luoghi sacri richiede spalle e ginocchia coperte.",
  included: {
    title: "Cosa è incluso",
    items: [
      "Visita guidata con guida autorizzata",
      "Accesso al Colosseo (con guida inclusa)",
      "Accesso ai Musei Vaticani",
      "Accesso al Foro Romano e Palatino",
    ],
  },
  notIncluded: {
    title: "Cosa non è incluso",
    items: ["Mance", "Trasporto da e per l'hotel", "Cibo e bevande", "Auricolari (disponibili su richiesta)"],
  },
  meetingPoint: {
    text: "Il punto di incontro si troverà nell'area evidenziata sulla mappa, di fronte all'ingresso principale del Colosseo. La guida ti aspetterà con una pettorina TourisMotion.",
    mapImage: "/images/map-meeting-point.png",
    mapUrl: "https://maps.google.com/?q=Colosseo+Roma",
  },
  accessibility:
    "Il percorso include tratti acciottolati e alcune scale; per esigenze specifiche di accessibilità contatta il nostro supporto prima della prenotazione e troveremo l'opzione più adatta.",
};

/** Indexed by `${city}/${slug}` so the route can resolve the requested product. */
export const products: Record<string, ProductDetail> = {
  "roma/tour-citta-arena-colosseo": product,
};

export function getProduct(city: string, slug: string): ProductDetail | undefined {
  return products[`${city}/${slug}`];
}
