import type { Locale } from "../config";

/**
 * Copy for the public "Affiliati" landing (`/[lang]/partner/affiliati`, Figma
 * 447:3585). Standalone per-page module (like {@link ./agencies}) — kept out of the
 * shared it/en/es dictionaries because those are frequently locked by other editors;
 * it can be merged into an `affiliates:` namespace later without touching components.
 * `**…**` marks inline bold runs (rendered by `components/partner/Rich`).
 */
export type AffiliatesCopy = {
  meta: { title: string; description: string };
  hero: { title: string; subtitle: string; cta: string };
  intro: string;
  benefits: { title: string; items: { title: string; body: string }[] };
  how: { title: string; steps: { n: string; title: string; body: string }[] };
  tools: { title: string; intro: string; items: string[] };
  audience: { title: string; items: string[] };
  faq: { title: string; items: { q: string; a: string }[] };
  form: {
    title: string;
    subtitle: string;
    close: string;
    stepOf: string;
    step1Title: string;
    step2Title: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    website: string;
    websitePlaceholder: string;
    instagram: string;
    tiktok: string;
    youtube: string;
    handlePlaceholder: string;
    optionalHint: string;
    profileType: string;
    profilePlaceholder: string;
    profileOptions: string[];
    audienceSize: string;
    project: string;
    projectPlaceholder: string;
    gdpr: string;
    continue: string;
    back: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    successCta: string;
    errorRequired: string;
    errorEmail: string;
    errorGdpr: string;
    errorSubmit: string;
  };
};

const it: AffiliatesCopy = {
  meta: {
    title: "Diventa affiliato — TourisMotion",
    description:
      "Trasforma la tua passione per i viaggi in una collaborazione concreta: promuovi le esperienze Tourismotion e guadagna una commissione su ogni prenotazione.",
  },
  hero: {
    title: "Trasforma la tua passione per i viaggi in una collaborazione concreta",
    subtitle:
      "Ogni giorno migliaia di viaggiatori cercano ispirazione, consigli e suggerimenti per organizzare le proprie esperienze in Italia.",
    cta: "Diventa affiliato",
  },
  intro:
    "Se crei contenuti, gestisci un **blog**, un **sito web** o una piattaforma dedicata ai viaggi, puoi collaborare con Tourismotion promuovendo tour ed esperienze selezionate nelle principali destinazioni italiane e ricevere una **commissione** per ogni prenotazione generata attraverso i tuoi canali.",
  benefits: {
    title: "Perché affiliarsi a Tourismotion?",
    items: [
      {
        title: "Guadagno",
        body: "Commissioni competitive sulle prenotazioni generate. Registrazione gratuita. Codici sconto personalizzati da condividere con il tuo pubblico.",
      },
      {
        title: "Strumenti",
        body: "Accesso a link tracciati dedicati. Statistiche e monitoraggio delle performance. Assistenza personalizzata.",
      },
      {
        title: "Partner affidabile",
        body: "Esperienze selezionate nelle principali destinazioni italiane. Brand consolidato con oltre 300.000 viaggiatori ogni anno. Più di 224.000 recensioni positive.",
      },
    ],
  },
  how: {
    title: "Come funziona?",
    steps: [
      { n: "01", title: "Registrati", body: "Compila il modulo di richiesta e presenta il tuo progetto." },
      {
        n: "02",
        title: "Ottieni il tuo account affiliato",
        body: "Una volta approvata la tua richiesta, riceverai accesso agli strumenti dedicati e, se previsto, a un codice sconto personalizzato riservato al tuo pubblico.",
      },
      {
        n: "03",
        title: "Promuovi le esperienze Tourismotion",
        body: "Inserisci i link affiliati nei tuoi articoli, guide, newsletter o contenuti online e condividi il tuo codice sconto attraverso i tuoi canali.",
      },
      {
        n: "04",
        title: "Guadagna sulle prenotazioni",
        body: "Ogni prenotazione generata attraverso i tuoi link affiliati o tramite il tuo codice sconto ti permetterà di ricevere una commissione.",
      },
    ],
  },
  tools: {
    title: "Strumenti a disposizione",
    intro:
      "Mettiamo a disposizione dei nostri affiliati una serie di strumenti pensati per facilitare la promozione delle esperienze Tourismotion:",
    items: [
      "Link tracciati dedicati",
      "Codici sconto personalizzati",
      "Materiale promozionale",
      "Immagini e contenuti dedicati",
      "Supporto del nostro team",
      "Statistiche e monitoraggio delle performance",
    ],
  },
  audience: {
    title: "A chi è rivolto?",
    items: ["Travel blogger", "Content creator", "Influencer", "Portali turistici", "Community online dedicate ai viaggi"],
  },
  faq: {
    title: "Domande frequenti",
    items: [
      {
        q: "Quanto costa diventare affiliato?",
        a: "La registrazione è completamente gratuita: non ci sono costi di adesione né canoni periodici.",
      },
      {
        q: "Come vengo pagato?",
        a: "Ricevi una commissione per ogni prenotazione generata tramite i tuoi link affiliati o il tuo codice sconto, secondo le condizioni del contratto di affiliazione.",
      },
      {
        q: "Quali requisiti servono per candidarsi?",
        a: "Basta gestire un blog, un sito web, un canale social o una community dedicata ai viaggi. Valutiamo ogni richiesta in base al progetto presentato.",
      },
      {
        q: "Quanto tempo serve per l'approvazione?",
        a: "Il nostro team valuta le richieste in pochi giorni lavorativi e ti contatta via email con l'esito.",
      },
    ],
  },
  form: {
    title: "Diventa affiliato",
    subtitle: "Raccontaci di te e dei tuoi canali: valuteremo la tua richiesta di affiliazione.",
    close: "Chiudi",
    stepOf: "Step {n} di 2",
    step1Title: "I tuoi dati",
    step2Title: "I tuoi canali e il tuo progetto",
    firstName: "Nome",
    lastName: "Cognome",
    email: "Email",
    phone: "Telefono",
    website: "Sito web",
    websitePlaceholder: "https://…",
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube / altro canale",
    handlePlaceholder: "@iltuoprofilo",
    optionalHint: "Facoltativo",
    profileType: "Tipo di profilo",
    profilePlaceholder: "Seleziona un'opzione",
    profileOptions: ["Travel blogger", "Content creator", "Influencer", "Portale turistico", "Community di viaggio", "Altro"],
    audienceSize: "Dimensione del pubblico (follower / visite mensili)",
    project: "Presenta il tuo progetto",
    projectPlaceholder: "Raccontaci dei tuoi canali, del tuo pubblico e di come promuoveresti le esperienze Tourismotion.",
    gdpr: "Ho letto e accetto il trattamento dei dati personali (GDPR).",
    continue: "Continua",
    back: "Indietro",
    submit: "Invia richiesta",
    submitting: "Invio in corso…",
    successTitle: "Richiesta inviata",
    successBody:
      "Grazie! Abbiamo ricevuto la tua richiesta di affiliazione. Il nostro team la valuterà e ti contatterà presto via email.",
    successCta: "Chiudi",
    errorRequired: "Compila tutti i campi obbligatori.",
    errorEmail: "Inserisci un indirizzo email valido.",
    errorGdpr: "Devi accettare il trattamento dei dati personali per inviare la richiesta.",
    errorSubmit: "Si è verificato un problema durante l'invio. Riprova.",
  },
};

const en: AffiliatesCopy = {
  meta: {
    title: "Become an affiliate — TourisMotion",
    description:
      "Turn your passion for travel into a real partnership: promote Tourismotion experiences and earn a commission on every booking.",
  },
  hero: {
    title: "Turn your passion for travel into a real partnership",
    subtitle:
      "Every day thousands of travellers look for inspiration, advice and tips to plan their experiences in Italy.",
    cta: "Become an affiliate",
  },
  intro:
    "If you create content or run a **blog**, a **website** or a travel-focused platform, you can partner with Tourismotion by promoting selected tours and experiences in Italy's top destinations and earn a **commission** on every booking generated through your channels.",
  benefits: {
    title: "Why become a Tourismotion affiliate?",
    items: [
      {
        title: "Earnings",
        body: "Competitive commissions on the bookings you generate. Free registration. Personalised discount codes to share with your audience.",
      },
      {
        title: "Tools",
        body: "Access to dedicated tracked links. Performance statistics and monitoring. Personalised support.",
      },
      {
        title: "Reliable partner",
        body: "Selected experiences in Italy's top destinations. An established brand with over 300,000 travellers a year. More than 224,000 positive reviews.",
      },
    ],
  },
  how: {
    title: "How does it work?",
    steps: [
      { n: "01", title: "Sign up", body: "Fill in the request form and tell us about your project." },
      {
        n: "02",
        title: "Get your affiliate account",
        body: "Once your request is approved, you'll get access to the dedicated tools and, where applicable, a personalised discount code reserved for your audience.",
      },
      {
        n: "03",
        title: "Promote Tourismotion experiences",
        body: "Add affiliate links to your articles, guides, newsletters or online content and share your discount code across your channels.",
      },
      {
        n: "04",
        title: "Earn on bookings",
        body: "Every booking generated through your affiliate links or discount code lets you earn a commission.",
      },
    ],
  },
  tools: {
    title: "Tools at your disposal",
    intro:
      "We give our affiliates a set of tools designed to make promoting Tourismotion experiences easier:",
    items: [
      "Dedicated tracked links",
      "Personalised discount codes",
      "Promotional material",
      "Dedicated images and content",
      "Support from our team",
      "Performance statistics and monitoring",
    ],
  },
  audience: {
    title: "Who is it for?",
    items: ["Travel bloggers", "Content creators", "Influencers", "Travel portals", "Travel-focused online communities"],
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        q: "How much does it cost to become an affiliate?",
        a: "Registration is completely free: there are no joining fees or recurring charges.",
      },
      {
        q: "How do I get paid?",
        a: "You earn a commission on every booking generated through your affiliate links or discount code, according to the terms of the affiliate agreement.",
      },
      {
        q: "What do I need to apply?",
        a: "Just a blog, a website, a social channel or a travel-focused community. We review each request based on the project you present.",
      },
      {
        q: "How long does approval take?",
        a: "Our team reviews requests within a few business days and contacts you by email with the outcome.",
      },
    ],
  },
  form: {
    title: "Become an affiliate",
    subtitle: "Tell us about you and your channels: we'll review your affiliate request.",
    close: "Close",
    stepOf: "Step {n} of 2",
    step1Title: "Your details",
    step2Title: "Your channels and project",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    website: "Website",
    websitePlaceholder: "https://…",
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube / other channel",
    handlePlaceholder: "@yourhandle",
    optionalHint: "Optional",
    profileType: "Profile type",
    profilePlaceholder: "Select an option",
    profileOptions: ["Travel blogger", "Content creator", "Influencer", "Travel portal", "Travel community", "Other"],
    audienceSize: "Audience size (followers / monthly visits)",
    project: "Tell us about your project",
    projectPlaceholder: "Tell us about your channels, your audience and how you'd promote Tourismotion experiences.",
    gdpr: "I have read and accept the processing of my personal data (GDPR).",
    continue: "Continue",
    back: "Back",
    submit: "Send request",
    submitting: "Sending…",
    successTitle: "Request sent",
    successBody:
      "Thank you! We've received your affiliate request. Our team will review it and get in touch by email soon.",
    successCta: "Close",
    errorRequired: "Please fill in all required fields.",
    errorEmail: "Please enter a valid email address.",
    errorGdpr: "You must accept the processing of personal data to submit the request.",
    errorSubmit: "Something went wrong while sending. Please try again.",
  },
};

const es: AffiliatesCopy = {
  meta: {
    title: "Hazte afiliado — TourisMotion",
    description:
      "Convierte tu pasión por los viajes en una colaboración real: promociona las experiencias de Tourismotion y gana una comisión por cada reserva.",
  },
  hero: {
    title: "Convierte tu pasión por los viajes en una colaboración real",
    subtitle:
      "Cada día miles de viajeros buscan inspiración, consejos y recomendaciones para organizar sus experiencias en Italia.",
    cta: "Hazte afiliado",
  },
  intro:
    "Si creas contenido o gestionas un **blog**, una **web** o una plataforma dedicada a los viajes, puedes colaborar con Tourismotion promocionando tours y experiencias seleccionadas en los principales destinos italianos y recibir una **comisión** por cada reserva generada a través de tus canales.",
  benefits: {
    title: "¿Por qué afiliarte a Tourismotion?",
    items: [
      {
        title: "Ganancias",
        body: "Comisiones competitivas sobre las reservas generadas. Registro gratuito. Códigos de descuento personalizados para compartir con tu público.",
      },
      {
        title: "Herramientas",
        body: "Acceso a enlaces de seguimiento dedicados. Estadísticas y seguimiento del rendimiento. Asistencia personalizada.",
      },
      {
        title: "Partner fiable",
        body: "Experiencias seleccionadas en los principales destinos italianos. Marca consolidada con más de 300.000 viajeros al año. Más de 224.000 reseñas positivas.",
      },
    ],
  },
  how: {
    title: "¿Cómo funciona?",
    steps: [
      { n: "01", title: "Regístrate", body: "Rellena el formulario de solicitud y preséntanos tu proyecto." },
      {
        n: "02",
        title: "Obtén tu cuenta de afiliado",
        body: "Una vez aprobada tu solicitud, recibirás acceso a las herramientas dedicadas y, si procede, a un código de descuento personalizado para tu público.",
      },
      {
        n: "03",
        title: "Promociona las experiencias Tourismotion",
        body: "Inserta los enlaces de afiliado en tus artículos, guías, newsletters o contenidos online y comparte tu código de descuento en tus canales.",
      },
      {
        n: "04",
        title: "Gana con las reservas",
        body: "Cada reserva generada a través de tus enlaces de afiliado o de tu código de descuento te permite recibir una comisión.",
      },
    ],
  },
  tools: {
    title: "Herramientas a tu disposición",
    intro:
      "Ponemos a disposición de nuestros afiliados una serie de herramientas pensadas para facilitar la promoción de las experiencias Tourismotion:",
    items: [
      "Enlaces de seguimiento dedicados",
      "Códigos de descuento personalizados",
      "Material promocional",
      "Imágenes y contenidos dedicados",
      "Soporte de nuestro equipo",
      "Estadísticas y seguimiento del rendimiento",
    ],
  },
  audience: {
    title: "¿A quién va dirigido?",
    items: ["Travel bloggers", "Creadores de contenido", "Influencers", "Portales turísticos", "Comunidades online de viajes"],
  },
  faq: {
    title: "Preguntas frecuentes",
    items: [
      {
        q: "¿Cuánto cuesta hacerse afiliado?",
        a: "El registro es totalmente gratuito: no hay cuotas de alta ni cargos periódicos.",
      },
      {
        q: "¿Cómo cobro?",
        a: "Recibes una comisión por cada reserva generada a través de tus enlaces de afiliado o tu código de descuento, según las condiciones del contrato de afiliación.",
      },
      {
        q: "¿Qué requisitos necesito para solicitarlo?",
        a: "Basta con tener un blog, una web, un canal social o una comunidad dedicada a los viajes. Evaluamos cada solicitud según el proyecto presentado.",
      },
      {
        q: "¿Cuánto tarda la aprobación?",
        a: "Nuestro equipo evalúa las solicitudes en pocos días laborables y te contacta por email con el resultado.",
      },
    ],
  },
  form: {
    title: "Hazte afiliado",
    subtitle: "Cuéntanos sobre ti y tus canales: evaluaremos tu solicitud de afiliación.",
    close: "Cerrar",
    stepOf: "Paso {n} de 2",
    step1Title: "Tus datos",
    step2Title: "Tus canales y tu proyecto",
    firstName: "Nombre",
    lastName: "Apellidos",
    email: "Correo electrónico",
    phone: "Teléfono",
    website: "Sitio web",
    websitePlaceholder: "https://…",
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube / otro canal",
    handlePlaceholder: "@tuperfil",
    optionalHint: "Opcional",
    profileType: "Tipo de perfil",
    profilePlaceholder: "Selecciona una opción",
    profileOptions: ["Travel blogger", "Creador de contenido", "Influencer", "Portal turístico", "Comunidad de viajes", "Otro"],
    audienceSize: "Tamaño del público (seguidores / visitas mensuales)",
    project: "Preséntanos tu proyecto",
    projectPlaceholder: "Cuéntanos sobre tus canales, tu público y cómo promocionarías las experiencias Tourismotion.",
    gdpr: "He leído y acepto el tratamiento de mis datos personales (RGPD).",
    continue: "Continuar",
    back: "Atrás",
    submit: "Enviar solicitud",
    submitting: "Enviando…",
    successTitle: "Solicitud enviada",
    successBody:
      "¡Gracias! Hemos recibido tu solicitud de afiliación. Nuestro equipo la revisará y se pondrá en contacto pronto por email.",
    successCta: "Cerrar",
    errorRequired: "Rellena todos los campos obligatorios.",
    errorEmail: "Introduce una dirección de correo válida.",
    errorGdpr: "Debes aceptar el tratamiento de los datos personales para enviar la solicitud.",
    errorSubmit: "Se ha producido un problema durante el envío. Inténtalo de nuevo.",
  },
};

export const affiliatesCopy: Record<Locale, AffiliatesCopy> = { it, en, es };
