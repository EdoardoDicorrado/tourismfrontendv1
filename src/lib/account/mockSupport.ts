/**
 * PREVIEW support threads (frontend-only) until the support-chat API lands
 * (full-stack). Each audience gets some closed history + ONE open thread carrying
 * an unread operator reply (drives the "+1" notification badge). Timestamps are
 * display strings (no Date.now → SSR-safe, no formatter needed).
 *
 * ponytail: swap getSupportThreads() for the real BFF (GET threads / POST message /
 * PATCH close) when the backend exists; the SupportRequests UI stays unchanged.
 */
export type SupportSender = "user" | "operator";
export type SupportAudience = "customer" | "agency" | "affiliate";

export interface SupportMessage {
  id: string;
  from: SupportSender;
  text: string;
  at: string;
}

export interface SupportThread {
  id: string;
  subject: string;
  status: "open" | "closed";
  /** Operator replies not yet read by the user (drives the "+N" badge). */
  unread: number;
  messages: SupportMessage[];
}

const CUSTOMER: SupportThread[] = [
  {
    id: "c-open",
    subject: "Modifica orario tour Colosseo",
    status: "open",
    unread: 1,
    messages: [
      { id: "1", from: "user", text: "Buongiorno, posso spostare il tour del Colosseo a sabato?", at: "20 giu 2026, 09:14" },
      { id: "2", from: "operator", text: "Buongiorno! Sì, è possibile: le confermo la disponibilità sabato alle 10:00. Procedo con lo spostamento?", at: "20 giu 2026, 10:02" },
    ],
  },
  {
    id: "c-1",
    subject: "Voucher non ricevuto via email",
    status: "closed",
    unread: 0,
    messages: [
      { id: "1", from: "user", text: "Non ho ricevuto il voucher dopo il pagamento.", at: "2 giu 2026, 18:40" },
      { id: "2", from: "operator", text: "Le ho rinviato il voucher all'indirizzo dell'ordine. Mi conferma la ricezione?", at: "2 giu 2026, 19:05" },
      { id: "3", from: "user", text: "Ricevuto, grazie!", at: "2 giu 2026, 19:20" },
    ],
  },
  {
    id: "c-2",
    subject: "Rimborso prenotazione annullata",
    status: "closed",
    unread: 0,
    messages: [
      { id: "1", from: "user", text: "Ho annullato una prenotazione, quando arriva il rimborso?", at: "12 mag 2026, 11:00" },
      { id: "2", from: "operator", text: "Il rimborso è stato emesso e arriverà entro 5 giorni lavorativi sul metodo di pagamento usato.", at: "12 mag 2026, 12:30" },
    ],
  },
];

const AGENCY: SupportThread[] = [
  {
    id: "a-open",
    subject: "Commissione su prenotazione di gruppo",
    status: "open",
    unread: 1,
    messages: [
      { id: "1", from: "user", text: "Come viene calcolata la commissione su una prenotazione di gruppo da 25 persone?", at: "19 giu 2026, 15:30" },
      { id: "2", from: "operator", text: "Per i gruppi oltre 20 partecipanti si applica la commissione maggiorata: le invio il dettaglio aggiornato. Conferma il numero esatto di pax?", at: "19 giu 2026, 16:10" },
    ],
  },
  {
    id: "a-1",
    subject: "Fattura mese di maggio",
    status: "closed",
    unread: 0,
    messages: [
      { id: "1", from: "user", text: "Potete inviarmi la fattura di maggio?", at: "3 giu 2026, 10:12" },
      { id: "2", from: "operator", text: "Fattura inviata via PEC e disponibile nell'area Amministrazione.", at: "3 giu 2026, 11:00" },
    ],
  },
  {
    id: "a-2",
    subject: "Codice sconto non applicato",
    status: "closed",
    unread: 0,
    messages: [
      { id: "1", from: "user", text: "Il codice riservato non veniva applicato al checkout.", at: "21 mag 2026, 09:45" },
      { id: "2", from: "operator", text: "Risolto: il codice era scaduto, ne abbiamo emesso uno nuovo con la stessa scontistica.", at: "21 mag 2026, 14:20" },
    ],
  },
];

const AFFILIATE: SupportThread[] = [
  {
    id: "af-open",
    subject: "Payout di giugno in ritardo",
    status: "open",
    unread: 1,
    messages: [
      { id: "1", from: "user", text: "Il payout di giugno non è ancora arrivato, potete verificare?", at: "18 giu 2026, 12:00" },
      { id: "2", from: "operator", text: "Stiamo elaborando i pagamenti del mese: il tuo payout sarà accreditato entro il 30. Ti aggiorno appena parte il bonifico.", at: "18 giu 2026, 13:35" },
    ],
  },
  {
    id: "af-1",
    subject: "Nuovo codice sconto per la mia community",
    status: "closed",
    unread: 0,
    messages: [
      { id: "1", from: "user", text: "Posso avere un codice sconto dedicato per i miei follower?", at: "5 giu 2026, 17:20" },
      { id: "2", from: "operator", text: "Certo! Abbiamo creato un codice riservato, lo trovi nella tua dashboard affiliato.", at: "5 giu 2026, 18:00" },
    ],
  },
  {
    id: "af-2",
    subject: "Referral link non traccia i click",
    status: "closed",
    unread: 0,
    messages: [
      { id: "1", from: "user", text: "Il mio referral link non sembra registrare i click.", at: "28 mag 2026, 08:30" },
      { id: "2", from: "operator", text: "Era un problema di cache del tracker, ora i click vengono conteggiati correttamente.", at: "28 mag 2026, 10:15" },
    ],
  },
];

const THREADS: Record<SupportAudience, SupportThread[]> = {
  customer: CUSTOMER,
  agency: AGENCY,
  affiliate: AFFILIATE,
};

/** Fresh copy per call so the client component can mutate its local state freely. */
export function getSupportThreads(audience: SupportAudience): SupportThread[] {
  return THREADS[audience].map((t) => ({ ...t, messages: [...t.messages] }));
}
