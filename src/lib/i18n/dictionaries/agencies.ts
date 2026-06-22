import type { Locale } from "../config";

/**
 * Copy for the public "Agenzie di viaggio" landing (`/[lang]/partner/agenzie`,
 * Figma 447:2752). Kept as a standalone per-page module — not folded into the
 * shared `it/en/es` dictionaries — because those files were locked by another
 * editor while this page was built; it can be merged into an `agencies:`
 * namespace later without touching the components. `**…**` marks inline bold
 * runs (rendered by `components/partner/Rich`).
 */
export type AgenciesCopy = {
  meta: { title: string; description: string };
  hero: { title: string; subtitle: string; cta: string };
  intro: string;
  benefits: { title: string; items: { title: string; body: string }[] };
  how: { title: string; steps: { n: string; title: string; body: string }[] };
  audience: { title: string; items: { label: string }[]; cta: string };
  mission: { title: string; paragraphs: string[]; imageAlt: string };
  join: { title: string; paragraphs: string[]; cta: string };
};

const it: AgenciesCopy = {
  meta: {
    title: "Agenzie di viaggio — TourisMotion",
    description:
      "Collabora con Tourismotion: accedi al catalogo di esperienze e visite guidate a condizioni riservate ai partner, con tariffe dedicate, prenotazioni rapide e supporto per agenzie di viaggio.",
  },
  hero: {
    title: "Offri ai tuoi clienti esperienze selezionate nelle principali destinazioni italiane",
    subtitle:
      "Sei un'agenzia di viaggio, un consulente di viaggio o un professionista del settore turistico?",
    cta: "Inizia la collaborazione",
  },
  intro:
    "Con il programma dedicato alle **agenzie** di Tourismotion puoi accedere alle nostre esperienze e visite guidate a **condizioni riservate ai partner** e ampliare la tua offerta con prodotti di qualità nelle principali destinazioni italiane.",
  benefits: {
    title: "Perché collaborare con Tourismotion?",
    items: [
      {
        title: "Catalogo",
        body: "Accesso a un catalogo curato di esperienze selezionate in tutta Italia, pensate per arricchire l'offerta dei partner con proposte di qualità.",
      },
      {
        title: "Tour e Guide",
        body: "Tour guidati nelle principali destinazioni italiane, con guide abilitate e fornitori locali verificati per garantire esperienze affidabili.",
      },
      {
        title: "Tariffe e prenotazioni",
        body: "Tariffe dedicate ai partner, prenotazioni rapide e conferme in tempo reale tramite una piattaforma semplice e intuitiva.",
      },
      {
        title: "Assistenza e supporto",
        body: "Assistenza professionale prima e dopo la prenotazione, con supporto diretto del nostro team in ogni fase operativa e commerciale.",
      },
    ],
  },
  how: {
    title: "Come funziona?",
    steps: [
      {
        n: "01",
        title: "Registrati",
        body: "Compila il modulo di richiesta e crea il tuo account partner.",
      },
      {
        n: "02",
        title: "Accedi alla piattaforma",
        body: "Una volta approvata la registrazione, potrai accedere all'area dedicata alle agenzie.",
      },
      {
        n: "03",
        title: "Consulta il catalogo",
        body: "Visualizza esperienze, disponibilità e condizioni riservate ai partner.",
      },
      {
        n: "04",
        title: "Prenota per i tuoi clienti",
        body: "Effettua le prenotazioni direttamente online e beneficia delle tariffe dedicate al programma agenzie.",
      },
    ],
  },
  audience: {
    title: "A chi è rivolto?",
    items: [
      { label: "Agenzie di viaggio" },
      { label: "Consulenti di viaggio" },
      { label: "Travel designer" },
      { label: "Tour operator" },
      { label: "Professionisti del turismo" },
    ],
    cta: "Diventa partner",
  },
  mission: {
    title: "Perché i nostri partner ci scelgono",
    paragraphs: [
      "Ogni anno oltre **300.000 viaggiatori** scelgono le esperienze Tourismotion per visitare alcune delle destinazioni più iconiche d'Italia.",
      "Grazie a una rete di oltre **100 guide abilitate**, un team operativo dedicato e più di **224.000 recensioni positive**, siamo un partner affidabile per i professionisti che desiderano offrire ai propri clienti esperienze di qualità.",
    ],
    imageAlt: "Viaggiatore in una città d'arte italiana",
  },
  join: {
    title: "Diventa partner",
    paragraphs: [
      "Compila il **modulo** per richiedere l'accesso al programma dedicato alle agenzie di viaggio.",
      "Il nostro team ti contatterà per completare l'attivazione del tuo account e fornirti tutte le informazioni necessarie per iniziare a collaborare con Tourismotion.",
    ],
    cta: "Vai al modulo",
  },
};

const en: AgenciesCopy = {
  meta: {
    title: "Travel agencies — TourisMotion",
    description:
      "Partner with Tourismotion: access our catalogue of experiences and guided tours at partner-only rates, with dedicated pricing, fast bookings and support for travel agencies.",
  },
  hero: {
    title: "Offer your clients hand-picked experiences in Italy's top destinations",
    subtitle: "Are you a travel agency, a travel advisor or a tourism professional?",
    cta: "Start the collaboration",
  },
  intro:
    "With Tourismotion's dedicated **agency** programme you can access our experiences and guided tours at **partner-only rates** and broaden your offer with quality products across Italy's main destinations.",
  benefits: {
    title: "Why partner with Tourismotion?",
    items: [
      {
        title: "Catalogue",
        body: "Access a curated catalogue of hand-picked experiences across Italy, designed to enrich partners' offer with quality proposals.",
      },
      {
        title: "Tours & Guides",
        body: "Guided tours in Italy's main destinations, with licensed guides and verified local suppliers for reliable experiences.",
      },
      {
        title: "Rates & bookings",
        body: "Partner-only rates, fast bookings and real-time confirmations through a simple, intuitive platform.",
      },
      {
        title: "Help & support",
        body: "Professional assistance before and after booking, with direct support from our team at every operational and commercial step.",
      },
    ],
  },
  how: {
    title: "How does it work?",
    steps: [
      {
        n: "01",
        title: "Sign up",
        body: "Fill in the request form and create your partner account.",
      },
      {
        n: "02",
        title: "Access the platform",
        body: "Once your registration is approved, you can access the area dedicated to agencies.",
      },
      {
        n: "03",
        title: "Browse the catalogue",
        body: "View experiences, availability and partner-only conditions.",
      },
      {
        n: "04",
        title: "Book for your clients",
        body: "Make bookings directly online and benefit from the rates dedicated to the agency programme.",
      },
    ],
  },
  audience: {
    title: "Who is it for?",
    items: [
      { label: "Travel agencies" },
      { label: "Travel advisors" },
      { label: "Travel designers" },
      { label: "Tour operators" },
      { label: "Tourism professionals" },
    ],
    cta: "Become a partner",
  },
  mission: {
    title: "Why our partners choose us",
    paragraphs: [
      "Every year over **300,000 travellers** choose Tourismotion experiences to visit some of Italy's most iconic destinations.",
      "Thanks to a network of over **100 licensed guides**, a dedicated operations team and more than **224,000 positive reviews**, we are a reliable partner for professionals who want to offer their clients quality experiences.",
    ],
    imageAlt: "Traveller in an Italian art city",
  },
  join: {
    title: "Become a partner",
    paragraphs: [
      "Fill in the **form** to request access to the programme dedicated to travel agencies.",
      "Our team will contact you to complete your account activation and give you all the information you need to start working with Tourismotion.",
    ],
    cta: "Go to the form",
  },
};

const es: AgenciesCopy = {
  meta: {
    title: "Agencias de viajes — TourisMotion",
    description:
      "Colabora con Tourismotion: accede al catálogo de experiencias y visitas guiadas con condiciones exclusivas para partners, tarifas dedicadas, reservas rápidas y soporte para agencias de viajes.",
  },
  hero: {
    title: "Ofrece a tus clientes experiencias seleccionadas en los principales destinos italianos",
    subtitle: "¿Eres una agencia de viajes, un asesor de viajes o un profesional del sector turístico?",
    cta: "Inicia la colaboración",
  },
  intro:
    "Con el programa dedicado a las **agencias** de Tourismotion puedes acceder a nuestras experiencias y visitas guiadas con **condiciones exclusivas para partners** y ampliar tu oferta con productos de calidad en los principales destinos italianos.",
  benefits: {
    title: "¿Por qué colaborar con Tourismotion?",
    items: [
      {
        title: "Catálogo",
        body: "Acceso a un catálogo cuidado de experiencias seleccionadas en toda Italia, pensadas para enriquecer la oferta de los partners con propuestas de calidad.",
      },
      {
        title: "Tours y guías",
        body: "Tours guiados en los principales destinos italianos, con guías habilitados y proveedores locales verificados para garantizar experiencias fiables.",
      },
      {
        title: "Tarifas y reservas",
        body: "Tarifas dedicadas a los partners, reservas rápidas y confirmaciones en tiempo real a través de una plataforma sencilla e intuitiva.",
      },
      {
        title: "Asistencia y soporte",
        body: "Asistencia profesional antes y después de la reserva, con soporte directo de nuestro equipo en cada fase operativa y comercial.",
      },
    ],
  },
  how: {
    title: "¿Cómo funciona?",
    steps: [
      {
        n: "01",
        title: "Regístrate",
        body: "Completa el formulario de solicitud y crea tu cuenta de partner.",
      },
      {
        n: "02",
        title: "Accede a la plataforma",
        body: "Una vez aprobado el registro, podrás acceder al área dedicada a las agencias.",
      },
      {
        n: "03",
        title: "Consulta el catálogo",
        body: "Visualiza experiencias, disponibilidad y condiciones exclusivas para partners.",
      },
      {
        n: "04",
        title: "Reserva para tus clientes",
        body: "Realiza las reservas directamente online y benefíciate de las tarifas dedicadas al programa de agencias.",
      },
    ],
  },
  audience: {
    title: "¿A quién va dirigido?",
    items: [
      { label: "Agencias de viajes" },
      { label: "Asesores de viajes" },
      { label: "Travel designers" },
      { label: "Turoperadores" },
      { label: "Profesionales del turismo" },
    ],
    cta: "Conviértete en partner",
  },
  mission: {
    title: "Por qué nuestros partners nos eligen",
    paragraphs: [
      "Cada año más de **300.000 viajeros** eligen las experiencias de Tourismotion para visitar algunos de los destinos más icónicos de Italia.",
      "Gracias a una red de más de **100 guías habilitados**, un equipo operativo dedicado y más de **224.000 reseñas positivas**, somos un partner fiable para los profesionales que desean ofrecer a sus clientes experiencias de calidad.",
    ],
    imageAlt: "Viajero en una ciudad de arte italiana",
  },
  join: {
    title: "Conviértete en partner",
    paragraphs: [
      "Completa el **formulario** para solicitar acceso al programa dedicado a las agencias de viajes.",
      "Nuestro equipo te contactará para completar la activación de tu cuenta y facilitarte toda la información necesaria para empezar a colaborar con Tourismotion.",
    ],
    cta: "Ir al formulario",
  },
};

export const agenciesCopy: Record<Locale, AgenciesCopy> = { it, en, es };
