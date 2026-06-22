/**
 * Mock data for the blog (index + article pages).
 *
 * The storefront/public API on tatanka3 does not expose a blog yet (see CLAUDE.md),
 * so the blog renders from these typed, per-locale fixtures. When a content API
 * lands, swap the getters for `backendFetch()` calls returning the same shapes.
 * Copy and layout mirror the Figma "Blog" section (447:2341).
 *
 * NOTE: the Figma category list shows "Milano", but the storefront only has
 * bookable listings for roma/firenze/torino/bologna, so the booking CTAs must
 * target an existing city. We use Torino in place of Milano to keep every
 * "Prenota ora {city}" link functional.
 */

import type { Locale } from "@/lib/i18n/config";

export interface BlogCategory {
  id: string;
  label: string;
  description: string;
}

export interface BlogArticle {
  slug: string;
  categoryId: string;
  title: string;
  excerpt: string;
  body: string[];
  image: string;
  /** ISO date — formatted per-locale at render time. */
  date: string;
  readingMinutes: number;
  /** City the "book now" CTA points to (must exist in `cityListings`). */
  bookCity: string;
  bookCitySlug: string;
  /** Two illustrative "see all tours" thumbnails on the article page. */
  tourImages: [string, string];
  /** Localized labels for the two tour cards — attraction-specific (Figma 447:2558). */
  tourLabels: [string, string];
  featured?: boolean;
}

const INTL_LOCALE: Record<Locale, string> = { it: "it-IT", en: "en-GB", es: "es-ES" };

/** Format an ISO date for display in the active locale (request/SSR safe). */
export function formatArticleDate(iso: string, lang: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[lang], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

const categories: Record<Locale, BlogCategory[]> = {
  it: [
    {
      id: "roma",
      label: "Roma",
      description: "Guide, itinerari, approfondimenti storici e consigli dedicati alla Capitale.",
    },
    {
      id: "firenze",
      label: "Firenze",
      description: "Itinerari d'arte e consigli per vivere la culla del Rinascimento.",
    },
    {
      id: "torino",
      label: "Torino",
      description: "Cosa vedere, dove andare e come muoversi nella prima capitale d'Italia.",
    },
    {
      id: "consigli",
      label: "Consigli di Viaggio",
      description: "Suggerimenti pratici per organizzare al meglio il tuo viaggio in Italia.",
    },
  ],
  en: [
    {
      id: "roma",
      label: "Rome",
      description: "Guides, itineraries, historical insights and tips dedicated to the Capital.",
    },
    {
      id: "firenze",
      label: "Florence",
      description: "Art itineraries and tips to experience the cradle of the Renaissance.",
    },
    {
      id: "torino",
      label: "Turin",
      description: "What to see, where to go and how to get around Italy's first capital.",
    },
    {
      id: "consigli",
      label: "Travel tips",
      description: "Practical advice to plan your trip to Italy at its best.",
    },
  ],
  es: [
    {
      id: "roma",
      label: "Roma",
      description: "Guías, itinerarios, profundizaciones históricas y consejos dedicados a la Capital.",
    },
    {
      id: "firenze",
      label: "Florencia",
      description: "Itinerarios de arte y consejos para vivir la cuna del Renacimiento.",
    },
    {
      id: "torino",
      label: "Turín",
      description: "Qué ver, adónde ir y cómo moverse en la primera capital de Italia.",
    },
    {
      id: "consigli",
      label: "Consejos de viaje",
      description: "Consejos prácticos para organizar tu viaje a Italia de la mejor manera.",
    },
  ],
};

/** Locale-independent fields per article, keyed by slug. */
const articleBase: Array<
  Pick<
    BlogArticle,
    | "slug"
    | "categoryId"
    | "image"
    | "date"
    | "readingMinutes"
    | "bookCitySlug"
    | "tourImages"
    | "featured"
  >
> = [
  {
    slug: "quando-visitare-roma",
    categoryId: "roma",
    image: "/images/hero-colosseo.png",
    date: "2025-10-26",
    readingMinutes: 6,
    bookCitySlug: "roma",
    tourImages: ["/images/card-colosseo.png", "/images/card-musei-vaticani.png"],
    featured: true,
  },
  {
    slug: "gemme-nascoste-roma",
    categoryId: "roma",
    image: "/images/card-musei-vaticani.png",
    date: "2025-10-25",
    readingMinutes: 8,
    bookCitySlug: "roma",
    tourImages: ["/images/card-colosseo.png", "/images/partner-musei-vaticani.png"],
  },
  {
    slug: "firenze-in-un-giorno",
    categoryId: "firenze",
    image: "/images/dest-firenze.png",
    date: "2025-09-18",
    readingMinutes: 7,
    bookCitySlug: "firenze",
    tourImages: ["/images/dest-firenze.png", "/images/tab-firenze.png"],
  },
  {
    slug: "torino-prima-capitale",
    categoryId: "torino",
    image: "/images/dest-torino-overlay.png",
    date: "2025-08-30",
    readingMinutes: 6,
    bookCitySlug: "torino",
    tourImages: ["/images/dest-torino-overlay.png", "/images/tab-torino.png"],
  },
  {
    slug: "consigli-primo-viaggio-italia",
    categoryId: "consigli",
    image: "/images/partner-musei-vaticani.png",
    date: "2025-07-12",
    readingMinutes: 5,
    bookCitySlug: "roma",
    tourImages: ["/images/card-colosseo.png", "/images/dest-firenze.png"],
  },
];

interface ArticleContent {
  title: string;
  excerpt: string;
  body: string[];
  tourLabels: [string, string];
}

const articleContent: Record<Locale, Record<string, ArticleContent>> = {
  it: {
    "quando-visitare-roma": {
      title: "Il momento migliore per visitare Roma: mese per mese, senza sorprese",
      excerpt:
        "Clima, folla e prezzi cambiano molto durante l'anno. Ecco come scegliere il periodo perfetto per la tua visita nella Capitale.",
      body: [
        "Roma è una città che si lascia visitare tutto l'anno, ma ogni stagione ha il suo carattere. La primavera, tra aprile e maggio, regala giornate miti e giardini in fiore: è il periodo ideale per passeggiare tra i fori e Villa Borghese.",
        "L'estate è calda e affollata, soprattutto a luglio e agosto: se viaggi in questi mesi, prenota le visite guidate la mattina presto e concediti una pausa nelle ore centrali. L'autunno, da settembre a novembre, è forse il momento migliore in assoluto: temperature piacevoli, luce dorata e meno code agli ingressi.",
        "L'inverno ha il suo fascino discreto, con musei meno affollati e prezzi più bassi. Qualunque mese tu scelga, prenotare in anticipo i biglietti salta-fila per Colosseo e Musei Vaticani ti farà risparmiare ore preziose.",
      ],
      tourLabels: ["Vedi tutti i tour del Colosseo", "Vedi tutti i tour dei Musei Vaticani"],
    },
    "gemme-nascoste-roma": {
      title: "Oltre la folla: 5 gemme nascoste da scoprire a Roma",
      excerpt:
        "Le grandi attrazioni di Roma sono celebri per un motivo, ma la città custodisce angoli magici e meno conosciuti.",
      body: [
        "Le attrazioni principali di Roma sono famose per un motivo, ma esistono moltissimi tour guidati che svelano i luoghi più nascosti e affascinanti della città. L'Appia Antica, ad esempio, è una strada romana perfettamente conservata che offre una fuga tranquilla dal centro.",
        "Un'altra gemma è il Buco della Serratura dell'Aventino, dove guide esperte ti accompagnano a scoprire la vista perfettamente incorniciata sulla cupola di San Pietro. A Trastevere puoi visitare Villa Farnesina, con gli affreschi di Raffaello, oppure provare un tour gastronomico al Mercato di Testaccio.",
        "Questi itinerari regalano un'esperienza più intima, lontano dalle mete affollate. Con i racconti delle guide sulle radici antiche e sulla vita di quartiere, arte e storia diventano facili da apprezzare in un'atmosfera serena.",
      ],
      tourLabels: ["Vedi tutti i tour del Colosseo", "Vedi tutti i tour dei Musei Vaticani"],
    },
    "firenze-in-un-giorno": {
      title: "Firenze in un giorno: l'itinerario perfetto nel cuore del Rinascimento",
      excerpt:
        "Hai solo 24 ore a Firenze? Ecco come vivere il meglio della culla del Rinascimento senza fretta.",
      body: [
        "Inizia la giornata da Piazza del Duomo, con la cupola del Brunelleschi e il Battistero. Prenotare in anticipo la salita alla cupola ti permette di evitare le code più lunghe e di goderti il panorama sui tetti della città.",
        "A metà mattina raggiungi la Galleria degli Uffizi per ammirare Botticelli e Leonardo, poi attraversa Ponte Vecchio verso l'Oltrarno. Qui le botteghe artigiane e Palazzo Pitti raccontano una Firenze più autentica e meno turistica.",
        "Concludi al tramonto a Piazzale Michelangelo, con la vista più celebre della città. Una guida locale può aiutarti a costruire un itinerario su misura e a scoprire scorci che da solo faresti fatica a trovare.",
      ],
      tourLabels: ["Vedi tutti i tour degli Uffizi", "Vedi tutti i tour di Ponte Vecchio"],
    },
    "torino-prima-capitale": {
      title: "Torino, la prima capitale d'Italia: cosa vedere in 48 ore",
      excerpt:
        "Caffè storici, residenze reali e musei sorprendenti: Torino è una città elegante tutta da scoprire.",
      body: [
        "Torino sorprende chi la visita per la prima volta. Il centro, ordinato e ricco di portici, invita a passeggiare da Piazza Castello fino alla Mole Antonelliana, simbolo della città e sede del Museo Nazionale del Cinema.",
        "Il secondo giorno è dedicato alle residenze sabaude e al Museo Egizio, il più importante al mondo dopo quello del Cairo. Non dimenticare una pausa in uno dei caffè storici per assaggiare il bicerin, la bevanda tipica torinese.",
        "Con una guida esperta puoi scoprire anche la Torino magica e quella industriale, due anime che convivono tra eleganza e innovazione.",
      ],
      tourLabels: ["Vedi tutti i tour della Mole Antonelliana", "Vedi tutti i tour del Museo Egizio"],
    },
    "consigli-primo-viaggio-italia": {
      title: "5 consigli per organizzare al meglio il tuo primo viaggio in Italia",
      excerpt:
        "Dai biglietti salta-fila ai trasporti, ecco come pianificare una vacanza italiana senza stress.",
      body: [
        "Il primo consiglio è prenotare in anticipo le attrazioni più richieste: per Colosseo, Uffizi e Musei Vaticani i biglietti salta-fila fanno davvero la differenza, soprattutto in alta stagione.",
        "Muoviti con i mezzi pubblici e a piedi: i centri storici italiani sono compatti e spesso a traffico limitato. Tieni sempre con te una carta d'identità o il passaporto e qualche contante per i piccoli acquisti.",
        "Infine, lasciati guidare da chi conosce il territorio: una visita guidata all'inizio del viaggio ti aiuta a orientarti e a vivere il resto della vacanza con più consapevolezza.",
      ],
      tourLabels: ["Vedi tutti i tour del Colosseo", "Vedi tutti i tour degli Uffizi"],
    },
  },
  en: {
    "quando-visitare-roma": {
      title: "The best time to visit Rome: month by month, no surprises",
      excerpt:
        "Weather, crowds and prices change a lot through the year. Here's how to pick the perfect time for your visit to the Capital.",
      body: [
        "Rome can be visited all year round, but every season has its own character. Spring, between April and May, brings mild days and gardens in bloom: it's the ideal time to wander through the forums and Villa Borghese.",
        "Summer is hot and crowded, especially in July and August: if you travel in these months, book guided tours early in the morning and take a break in the middle of the day. Autumn, from September to November, is perhaps the very best moment: pleasant temperatures, golden light and shorter queues at the entrances.",
        "Winter has its own quiet charm, with less crowded museums and lower prices. Whatever month you choose, booking skip-the-line tickets for the Colosseum and Vatican Museums in advance will save you precious hours.",
      ],
      tourLabels: ["See all Colosseum tours", "See all Vatican Museums tours"],
    },
    "gemme-nascoste-roma": {
      title: "Beyond the crowds: 5 hidden gems to discover in Rome",
      excerpt:
        "Rome's main attractions are popular for a reason, but the city hides magical, lesser-known corners.",
      body: [
        "While Rome's main attractions are popular for a reason, there are plenty of guided tours that reveal the city's lesser-known, magical spots. The Appian Way, for instance, is a well-preserved Roman road that offers a peaceful escape from the centre.",
        "Another hidden gem is the Aventine Keyhole, where expert guides lead you to a perfectly framed view of St. Peter's dome. In Trastevere you can explore Villa Farnesina, with frescoes by Raphael, or try a food tour at Testaccio Market.",
        "These itineraries provide a more intimate experience, away from the busiest sites. With the guides' insights into the city's ancient roots and local life, art and history become easy to appreciate in a serene setting.",
      ],
      tourLabels: ["See all Colosseum tours", "See all Vatican Museums tours"],
    },
    "firenze-in-un-giorno": {
      title: "Florence in a day: the perfect itinerary in the heart of the Renaissance",
      excerpt:
        "Only 24 hours in Florence? Here's how to experience the best of the Renaissance's cradle without rushing.",
      body: [
        "Start your day in Piazza del Duomo, with Brunelleschi's dome and the Baptistery. Booking the dome climb in advance lets you skip the longest queues and enjoy the view over the city's rooftops.",
        "Mid-morning, head to the Uffizi Gallery to admire Botticelli and Leonardo, then cross Ponte Vecchio towards the Oltrarno. Here the artisan workshops and Palazzo Pitti tell the story of a more authentic, less touristy Florence.",
        "End at sunset at Piazzale Michelangelo, with the city's most famous view. A local guide can help you build a tailor-made itinerary and discover corners you'd struggle to find on your own.",
      ],
      tourLabels: ["See all Uffizi tours", "See all Ponte Vecchio tours"],
    },
    "torino-prima-capitale": {
      title: "Turin, Italy's first capital: what to see in 48 hours",
      excerpt:
        "Historic cafés, royal residences and surprising museums: Turin is an elegant city waiting to be discovered.",
      body: [
        "Turin surprises first-time visitors. Its tidy, arcade-lined centre invites you to stroll from Piazza Castello to the Mole Antonelliana, the city's symbol and home to the National Cinema Museum.",
        "The second day is for the Savoy residences and the Egyptian Museum, the most important in the world after Cairo's. Don't miss a break in one of the historic cafés to taste the bicerin, Turin's signature drink.",
        "With an expert guide you can also discover magical Turin and its industrial side, two souls that coexist between elegance and innovation.",
      ],
      tourLabels: ["See all Mole Antonelliana tours", "See all Egyptian Museum tours"],
    },
    "consigli-primo-viaggio-italia": {
      title: "5 tips to plan your first trip to Italy at its best",
      excerpt:
        "From skip-the-line tickets to transport, here's how to plan an Italian holiday without stress.",
      body: [
        "The first tip is to book the most popular attractions in advance: for the Colosseum, the Uffizi and the Vatican Museums, skip-the-line tickets really make a difference, especially in high season.",
        "Get around on public transport and on foot: Italy's historic centres are compact and often have limited traffic. Always keep an ID card or passport with you, plus some cash for small purchases.",
        "Finally, let those who know the area guide you: a guided tour at the start of your trip helps you get your bearings and experience the rest of the holiday with more awareness.",
      ],
      tourLabels: ["See all Colosseum tours", "See all Uffizi tours"],
    },
  },
  es: {
    "quando-visitare-roma": {
      title: "El mejor momento para visitar Roma: mes a mes, sin sorpresas",
      excerpt:
        "El clima, las multitudes y los precios cambian mucho durante el año. Así puedes elegir el periodo perfecto para tu visita a la Capital.",
      body: [
        "Roma se puede visitar todo el año, pero cada estación tiene su propio carácter. La primavera, entre abril y mayo, regala días templados y jardines en flor: es el momento ideal para pasear entre los foros y Villa Borghese.",
        "El verano es caluroso y concurrido, sobre todo en julio y agosto: si viajas en estos meses, reserva las visitas guiadas a primera hora de la mañana y haz una pausa en las horas centrales. El otoño, de septiembre a noviembre, es quizá el mejor momento: temperaturas agradables, luz dorada y menos colas en las entradas.",
        "El invierno tiene su encanto discreto, con museos menos concurridos y precios más bajos. Sea cual sea el mes que elijas, reservar con antelación las entradas sin colas para el Coliseo y los Museos Vaticanos te ahorrará horas valiosas.",
      ],
      tourLabels: ["Ver todos los tours del Coliseo", "Ver todos los tours de los Museos Vaticanos"],
    },
    "gemme-nascoste-roma": {
      title: "Más allá de las multitudes: 5 joyas escondidas que descubrir en Roma",
      excerpt:
        "Las grandes atracciones de Roma son famosas por algo, pero la ciudad esconde rincones mágicos y menos conocidos.",
      body: [
        "Las atracciones principales de Roma son famosas por algo, pero existen muchísimos tours guiados que revelan los rincones más escondidos y fascinantes de la ciudad. La Vía Apia, por ejemplo, es una calzada romana perfectamente conservada que ofrece una escapada tranquila del centro.",
        "Otra joya es el Ojo de la Cerradura del Aventino, donde guías expertas te llevan a descubrir la vista perfectamente enmarcada de la cúpula de San Pedro. En Trastevere puedes visitar Villa Farnesina, con los frescos de Rafael, o probar un tour gastronómico en el Mercado de Testaccio.",
        "Estos itinerarios ofrecen una experiencia más íntima, lejos de los lugares más concurridos. Con los relatos de las guías sobre las raíces antiguas y la vida de barrio, el arte y la historia se disfrutan en un ambiente sereno.",
      ],
      tourLabels: ["Ver todos los tours del Coliseo", "Ver todos los tours de los Museos Vaticanos"],
    },
    "firenze-in-un-giorno": {
      title: "Florencia en un día: el itinerario perfecto en el corazón del Renacimiento",
      excerpt:
        "¿Solo tienes 24 horas en Florencia? Así puedes vivir lo mejor de la cuna del Renacimiento sin prisas.",
      body: [
        "Empieza el día en la Piazza del Duomo, con la cúpula de Brunelleschi y el Baptisterio. Reservar con antelación la subida a la cúpula te permite evitar las colas más largas y disfrutar de las vistas sobre los tejados de la ciudad.",
        "A media mañana, dirígete a la Galería de los Uffizi para admirar a Botticelli y Leonardo, y luego cruza el Ponte Vecchio hacia el Oltrarno. Aquí los talleres artesanos y el Palazzo Pitti cuentan una Florencia más auténtica y menos turística.",
        "Termina al atardecer en el Piazzale Michelangelo, con la vista más famosa de la ciudad. Una guía local puede ayudarte a crear un itinerario a medida y a descubrir rincones que por tu cuenta te costaría encontrar.",
      ],
      tourLabels: ["Ver todos los tours de los Uffizi", "Ver todos los tours del Ponte Vecchio"],
    },
    "torino-prima-capitale": {
      title: "Turín, la primera capital de Italia: qué ver en 48 horas",
      excerpt:
        "Cafés históricos, residencias reales y museos sorprendentes: Turín es una ciudad elegante por descubrir.",
      body: [
        "Turín sorprende a quien la visita por primera vez. Su centro, ordenado y lleno de soportales, invita a pasear desde la Piazza Castello hasta la Mole Antonelliana, símbolo de la ciudad y sede del Museo Nacional del Cine.",
        "El segundo día se dedica a las residencias de Saboya y al Museo Egipcio, el más importante del mundo después del de El Cairo. No te pierdas una pausa en uno de los cafés históricos para probar el bicerin, la bebida típica turinesa.",
        "Con una guía experta también puedes descubrir el Turín mágico y el industrial, dos almas que conviven entre elegancia e innovación.",
      ],
      tourLabels: ["Ver todos los tours de la Mole Antonelliana", "Ver todos los tours del Museo Egipcio"],
    },
    "consigli-primo-viaggio-italia": {
      title: "5 consejos para organizar lo mejor posible tu primer viaje a Italia",
      excerpt:
        "Desde las entradas sin colas hasta el transporte, así puedes planificar unas vacaciones italianas sin estrés.",
      body: [
        "El primer consejo es reservar con antelación las atracciones más solicitadas: para el Coliseo, los Uffizi y los Museos Vaticanos, las entradas sin colas marcan la diferencia, sobre todo en temporada alta.",
        "Muévete en transporte público y a pie: los centros históricos italianos son compactos y a menudo con tráfico limitado. Lleva siempre contigo un documento de identidad o el pasaporte y algo de efectivo para las compras pequeñas.",
        "Por último, déjate guiar por quien conoce el territorio: una visita guiada al inicio del viaje te ayuda a orientarte y a vivir el resto de las vacaciones con más conciencia.",
      ],
      tourLabels: ["Ver todos los tours del Coliseo", "Ver todos los tours de los Uffizi"],
    },
  },
};

const CITY_NAMES: Record<Locale, Record<string, string>> = {
  it: { roma: "Roma", firenze: "Firenze", torino: "Torino" },
  en: { roma: "Rome", firenze: "Florence", torino: "Turin" },
  es: { roma: "Roma", firenze: "Florencia", torino: "Turín" },
};

/** All article slugs — used for static params on the detail route. */
export const articleSlugs = articleBase.map((a) => a.slug);

export function getCategories(lang: Locale): BlogCategory[] {
  return categories[lang];
}

/** Build the full article list for a locale, most recent first. */
export function getArticles(lang: Locale): BlogArticle[] {
  return articleBase
    .map((base) => {
      const content = articleContent[lang][base.slug];
      return {
        ...base,
        ...content,
        bookCity: CITY_NAMES[lang][base.bookCitySlug] ?? CITY_NAMES[lang].roma,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getFeaturedArticle(lang: Locale): BlogArticle {
  const articles = getArticles(lang);
  return articles.find((a) => a.featured) ?? articles[0];
}

export function getArticle(lang: Locale, slug: string): BlogArticle | undefined {
  return getArticles(lang).find((a) => a.slug === slug);
}

/** Up to `limit` articles in the same category (or any), excluding `slug`. */
export function getRelatedArticles(lang: Locale, slug: string, limit = 3): BlogArticle[] {
  const all = getArticles(lang);
  const current = all.find((a) => a.slug === slug);
  const others = all.filter((a) => a.slug !== slug);
  const sameCategory = others.filter((a) => a.categoryId === current?.categoryId);
  const rest = others.filter((a) => a.categoryId !== current?.categoryId);
  return [...sameCategory, ...rest].slice(0, limit);
}
