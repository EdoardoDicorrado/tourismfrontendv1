/**
 * Fixtures for the "Esplora le recensioni" page (`/[lang]/recensioni`).
 *
 * A curated subset (~10) of traveler reviews shown fully expanded (no
 * truncation). Review text is user-generated CONTENT — not UI chrome — so it is
 * NOT translated; when the storefront API lands, swap this for a
 * `backendFetch()` returning the same shape. `publishedAt` is ISO (YYYY-MM-DD)
 * so the page can sort by recency; the display date is derived per-locale.
 */

export interface PageReview {
  id: string;
  author: string;
  /** Tour/experience the review refers to. */
  tour: string;
  /** ISO date (YYYY-MM-DD) — sortable. Display derived per-locale on the client. */
  publishedAt: string;
  rating: number;
  /** Full review text, shown expanded. */
  text: string;
  /** Source platform — drives the brand icon (only Google for now). */
  source: "google";
}

export const pageReviews: PageReview[] = [
  {
    id: "pr-01",
    author: "Marco Bianchi",
    tour: "Colosseo, Foro Romano e Palatino con guida esperta",
    publishedAt: "2026-05-28",
    rating: 5,
    source: "google",
    text: "Esperienza davvero indimenticabile. La guida era preparatissima e appassionata, ci ha raccontato aneddoti che non avremmo mai trovato su nessuna guida cartacea. Salta-fila perfetto, non abbiamo perso un minuto in coda. Consigliatissimo a chi visita Roma per la prima volta.",
  },
  {
    id: "pr-02",
    author: "Giulia Ferrari",
    tour: "Musei Vaticani e Cappella Sistina",
    publishedAt: "2026-05-14",
    rating: 5,
    source: "google",
    text: "Organizzazione impeccabile dall'inizio alla fine. Prenotazione semplice, conferma immediata e punto di incontro facilissimo da trovare. La Cappella Sistina vista con le spiegazioni della guida è tutta un'altra cosa. Torneremo sicuramente per altri tour.",
  },
  {
    id: "pr-03",
    author: "Luca Romano",
    tour: "Colosseo, Arena e Sotterranei: tour esclusivo",
    publishedAt: "2026-04-30",
    rating: 4,
    source: "google",
    text: "Tour molto interessante e accesso ai sotterranei davvero suggestivo. Unica nota: il gruppo era un po' numeroso e a tratti era difficile sentire la guida. Per il resto esperienza ottima e rapporto qualità-prezzo onesto.",
  },
  {
    id: "pr-04",
    author: "Sofia Esposito",
    tour: "Tour serale del Colosseo by night",
    publishedAt: "2026-04-12",
    rating: 5,
    source: "google",
    text: "Vedere il Colosseo illuminato di sera è stata un'emozione unica. Atmosfera magica, poca gente e una guida che ha saputo coinvolgere anche i nostri figli. Uno dei momenti più belli della nostra vacanza a Roma.",
  },
  {
    id: "pr-05",
    author: "Andrea Conti",
    tour: "Galleria Borghese: visita guidata salta fila",
    publishedAt: "2026-03-21",
    rating: 5,
    source: "google",
    text: "Capolavori del Bernini e del Caravaggio spiegati da una guida competente e disponibile. Tutto puntuale e ben organizzato. La prenotazione online è stata chiara e il supporto via chat mi ha risposto in pochi minuti quando ho dovuto cambiare orario.",
  },
  {
    id: "pr-06",
    author: "Martina Greco",
    tour: "Firenze: Uffizi e centro storico",
    publishedAt: "2026-03-08",
    rating: 4,
    source: "google",
    text: "Bella esperienza agli Uffizi, guida gentile e molto preparata sull'arte rinascimentale. Avrei gradito un po' più di tempo libero alla fine per le foto, ma nel complesso una giornata stupenda. Lo rifarei.",
  },
  {
    id: "pr-07",
    author: "Davide Marino",
    tour: "Colosseo, ingresso salta fila e guida",
    publishedAt: "2026-02-19",
    rating: 5,
    source: "google",
    text: "Servizio eccellente. Abbiamo prenotato all'ultimo momento e nonostante tutto è filato tutto liscio. La guida parlava un italiano e un inglese perfetti, ottima per il nostro gruppo misto. Prezzo trasparente, nessun costo nascosto.",
  },
  {
    id: "pr-08",
    author: "Chiara Rizzo",
    tour: "Torino: Mole Antonelliana e Museo del Cinema",
    publishedAt: "2026-01-27",
    rating: 5,
    source: "google",
    text: "Non conoscevo Torino e questo tour mi ha fatto innamorare della città. La guida è stata bravissima a legare storia, cinema e curiosità locali. Consiglio vivamente, soprattutto il panorama dalla Mole.",
  },
  {
    id: "pr-09",
    author: "Francesco Gallo",
    tour: "Musei Vaticani, alla scoperta della storia del papa",
    publishedAt: "2026-01-09",
    rating: 3,
    source: "google",
    text: "Contenuti del tour molto validi e guida preparata. Tolgo qualche stella perché la giornata era affollatissima e in alcune sale è stato complicato seguire. Forse meglio scegliere una fascia oraria meno turistica.",
  },
  {
    id: "pr-10",
    author: "Valentina Lombardi",
    tour: "Colosseo, Foro Romano e Palatino con guida esperta",
    publishedAt: "2025-12-15",
    rating: 5,
    source: "google",
    text: "Tour perfetto sotto ogni aspetto. Puntualità, professionalità e tanta passione. La guida ci ha fatto rivivere la Roma antica come se fossimo lì duemila anni fa. Esperienza che vale ogni euro speso, la consiglio a tutti.",
  },
];
