/**
 * PREVIEW (ui-ux) — fake agency bookings.
 *
 * The storefront API on tatanka3 isn't wired yet (see CLAUDE.md), so the agency
 * bookings list/detail render from these fixtures instead of `getBookings`/
 * `getBooking`. Shapes match `@/lib/account/types` 1:1, so the SAME BookingList /
 * BookingCard / BookingDetail components render them unchanged. Fields mirror what
 * checkout collects (customer + participants + hotel + per-line slots/prices).
 *
 * Swap `getAgencyBookings*Mock` back for the real seam once the API lands.
 */
import type { Booking, BookingTab, Money, Paginated } from "./types";

const eur = (amount_cents: number): Money => ({ amount_cents, currency: "EUR" });

/** A fixture tagged with the tab the backend would derive from its slot/state. */
interface MockEntry {
  tab: Exclude<BookingTab, "all">;
  booking: Booking;
}

const ENTRIES: MockEntry[] = [
  {
    tab: "current",
    booking: {
      uuid: "bk-colosseo-001",
      code: "TM-RM7A21",
      state: "confirmed",
      origin: "web",
      created_at: "2026-06-01T10:24:00Z",
      total: eur(18000),
      amount_paid: eur(18000),
      balance: eur(0),
      payment_status: "paid",
      customer: {
        first_name: "Marco",
        last_name: "Bianchi",
        email: "marco.bianchi@example.com",
        phone: "+39 333 1234567",
      },
      lines: [
        {
          id: "ln-001",
          product_name: "Colosseo, Foro Romano e Palatino — Salta la fila",
          option_name: "Tour guidato in italiano",
          slot_start: "2026-07-15T09:30:00+02:00",
          participant_count: 2,
          state: "active",
          unit_items: [
            {
              id: "ui-001",
              unit_label: "Adulto",
              unit_type: "adult",
              quantity: 2,
              state: "active",
              unit_price: eur(9000),
              total: eur(18000),
              participants: [
                {
                  id: "p-001",
                  position: 1,
                  first_name: "Marco",
                  last_name: "Bianchi",
                  email: "marco.bianchi@example.com",
                  phone_prefix: "+39",
                  phone: "3331234567",
                  birth_date: "1985-04-12",
                  passport: null,
                  identity_document: "CA12345AB",
                  nationality: "IT",
                  state: "active",
                },
                {
                  id: "p-002",
                  position: 2,
                  first_name: "Sara",
                  last_name: "Bianchi",
                  email: null,
                  phone_prefix: null,
                  phone: null,
                  birth_date: "1988-09-30",
                  passport: null,
                  identity_document: null,
                  nationality: "IT",
                  state: "active",
                },
              ],
            },
          ],
        },
      ],
      notes: null,
      contact_notes: "Allergia alimentare segnalata per un partecipante.",
      hotel: {
        hotel_name: "Hotel Artemide",
        hotel_street_address: "Via Nazionale",
        hotel_street_number: "22",
        hotel_city: "Roma",
        hotel_postal_code: "00184",
        booking_name_at_hotel: "Marco Bianchi",
        room_number: "304",
        front_desk_phone: "+39 06 489911",
        front_desk_language: "it",
        latitude: null,
        longitude: null,
      },
      pickup: { pickup_requested: false, pickup_location_id: null, pickup_notes: null },
      dropoff: { dropoff_requested: false, dropoff_location_id: null, dropoff_notes: null },
    },
  },
  {
    tab: "current",
    booking: {
      uuid: "bk-vaticani-002",
      code: "TM-VT3C90",
      state: "confirmed",
      origin: "web",
      created_at: "2026-06-10T16:02:00Z",
      total: eur(24000),
      amount_paid: eur(12000),
      balance: eur(12000),
      payment_status: "partial",
      customer: {
        first_name: "Lucía",
        last_name: "Fernández",
        email: "lucia.fernandez@example.com",
        phone: "+34 600 778899",
      },
      lines: [
        {
          id: "ln-002",
          product_name: "Musei Vaticani e Cappella Sistina — Ingresso prioritario",
          option_name: "Visita guidata in spagnolo",
          slot_start: "2026-08-03T08:00:00+02:00",
          participant_count: 3,
          state: "active",
          unit_items: [
            {
              id: "ui-002",
              unit_label: "Adulto",
              unit_type: "adult",
              quantity: 3,
              state: "active",
              unit_price: eur(8000),
              total: eur(24000),
              participants: [],
            },
          ],
        },
      ],
      notes: null,
      contact_notes: null,
      hotel: null,
      pickup: { pickup_requested: false, pickup_location_id: null, pickup_notes: null },
      dropoff: { dropoff_requested: false, dropoff_location_id: null, dropoff_notes: null },
    },
  },
  {
    tab: "travelled",
    booking: {
      uuid: "bk-borghese-003",
      code: "TM-BG5D44",
      state: "redeemed",
      origin: "web",
      created_at: "2026-03-18T09:11:00Z",
      total: eur(9000),
      amount_paid: eur(9000),
      balance: eur(0),
      payment_status: "paid",
      customer: {
        first_name: "Giulia",
        last_name: "Neri",
        email: "giulia.neri@example.com",
        phone: "+39 348 5566778",
      },
      lines: [
        {
          id: "ln-003",
          product_name: "Galleria Borghese — Biglietto e auricolari",
          option_name: "Ingresso temporizzato",
          slot_start: "2026-04-10T11:00:00+02:00",
          participant_count: 2,
          state: "active",
          unit_items: [
            {
              id: "ui-003",
              unit_label: "Adulto",
              unit_type: "adult",
              quantity: 2,
              state: "active",
              unit_price: eur(4500),
              total: eur(9000),
              participants: [],
            },
          ],
        },
      ],
      notes: null,
      contact_notes: null,
      hotel: null,
      pickup: { pickup_requested: false, pickup_location_id: null, pickup_notes: null },
      dropoff: { dropoff_requested: false, dropoff_location_id: null, dropoff_notes: null },
    },
  },
  {
    tab: "travelled",
    booking: {
      uuid: "bk-trastevere-004",
      code: "TM-TR8E12",
      state: "redeemed",
      origin: "web",
      created_at: "2025-11-02T18:40:00Z",
      total: eur(13000),
      amount_paid: eur(13000),
      balance: eur(0),
      payment_status: "paid",
      customer: {
        first_name: "Paolo",
        last_name: "Russo",
        email: "paolo.russo@example.com",
        phone: "+39 320 9988776",
      },
      lines: [
        {
          id: "ln-004",
          product_name: "Trastevere di sera — Food tour a piedi",
          option_name: "Degustazione 6 tappe",
          slot_start: "2025-11-20T18:30:00+01:00",
          participant_count: 2,
          state: "active",
          unit_items: [
            {
              id: "ui-004",
              unit_label: "Adulto",
              unit_type: "adult",
              quantity: 2,
              state: "active",
              unit_price: eur(6500),
              total: eur(13000),
              participants: [],
            },
          ],
        },
      ],
      notes: null,
      contact_notes: null,
      hotel: null,
      pickup: { pickup_requested: false, pickup_location_id: null, pickup_notes: null },
      dropoff: { dropoff_requested: false, dropoff_location_id: null, dropoff_notes: null },
    },
  },
  {
    tab: "cancelled",
    booking: {
      uuid: "bk-castel-005",
      code: "TM-CS2F77",
      state: "cancelled",
      origin: "web",
      created_at: "2026-04-22T12:05:00Z",
      total: eur(7000),
      amount_paid: eur(0),
      balance: eur(0),
      payment_status: "open",
      customer: {
        first_name: "Elena",
        last_name: "Conti",
        email: "elena.conti@example.com",
        phone: "+39 351 4433221",
      },
      lines: [
        {
          id: "ln-005",
          product_name: "Castel Sant'Angelo — Salta la fila",
          option_name: "Ingresso standard",
          slot_start: "2026-05-01T10:00:00+02:00",
          participant_count: 2,
          state: "cancelled",
          unit_items: [
            {
              id: "ui-005",
              unit_label: "Adulto",
              unit_type: "adult",
              quantity: 2,
              state: "cancelled",
              unit_price: eur(3500),
              total: eur(7000),
              participants: [],
            },
          ],
        },
      ],
      notes: null,
      contact_notes: null,
      hotel: null,
      pickup: { pickup_requested: false, pickup_location_id: null, pickup_notes: null },
      dropoff: { dropoff_requested: false, dropoff_location_id: null, dropoff_notes: null },
    },
  },
  {
    tab: "cancelled",
    booking: {
      uuid: "bk-catacombe-006",
      code: "TM-CT9G33",
      state: "cancelled",
      origin: "web",
      created_at: "2026-02-28T08:50:00Z",
      total: eur(8000),
      amount_paid: eur(8000),
      balance: eur(0),
      payment_status: "paid",
      customer: {
        first_name: "Davide",
        last_name: "Greco",
        email: "davide.greco@example.com",
        phone: "+39 339 2211009",
      },
      lines: [
        {
          id: "ln-006",
          product_name: "Catacombe di San Callisto — Tour guidato",
          option_name: "Tour guidato in italiano",
          slot_start: "2026-03-12T15:00:00+01:00",
          participant_count: 2,
          state: "cancelled",
          unit_items: [
            {
              id: "ui-006",
              unit_label: "Adulto",
              unit_type: "adult",
              quantity: 2,
              state: "cancelled",
              unit_price: eur(4000),
              total: eur(8000),
              participants: [],
            },
          ],
        },
      ],
      notes: null,
      contact_notes: null,
      hotel: null,
      pickup: { pickup_requested: false, pickup_location_id: null, pickup_notes: null },
      dropoff: { dropoff_requested: false, dropoff_location_id: null, dropoff_notes: null },
    },
  },
];

const PER_PAGE = 10;

/** Match a booking against the free-text search (code, customer name or email). */
function matches(booking: Booking, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  const name = [booking.customer.first_name, booking.customer.last_name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return (
    booking.code.toLowerCase().includes(needle) ||
    name.includes(needle) ||
    (booking.customer.email ?? "").toLowerCase().includes(needle)
  );
}

/** Paginated agency bookings filtered by tab + free-text search. */
export function getAgencyBookingsMock(args: {
  tab?: BookingTab;
  q?: string;
  page?: number;
  perPage?: number;
}): Paginated<Booking> {
  const { tab = "all", q = "", page = 1, perPage = PER_PAGE } = args;
  const filtered = ENTRIES.filter((e) => tab === "all" || e.tab === tab)
    .map((e) => e.booking)
    .filter((b) => matches(b, q));

  const total = filtered.length;
  const last_page = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), last_page);
  const items = filtered.slice((current - 1) * perPage, current * perPage);

  return { items, meta: { current_page: current, per_page: perPage, total, last_page, tab } };
}

/** A single agency booking by uuid (for the detail page). `null` if unknown. */
export function getAgencyBookingMock(uuid: string): Booking | null {
  return ENTRIES.find((e) => e.booking.uuid === uuid)?.booking ?? null;
}

/**
 * PREVIEW: the SAME fixtures power the customer Area Riservata (`/area/prenotazioni`)
 * until its API lands — bookings are role-agnostic, so the demo customer reuses them.
 */
export const getCustomerBookingsMock = getAgencyBookingsMock;
export const getCustomerBookingMock = getAgencyBookingMock;
