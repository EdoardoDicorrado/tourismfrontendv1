/**
 * Cart + checkout domain types.
 *
 * The cart is ephemeral, pre-order UI state held client-side (see CartContext) —
 * it is NOT an order. Orders are created only by the tatanka3 backend (the single
 * writer) when the customer checks out (see `src/app/api/checkout/route.ts`).
 */

/** One participant tier within a booking line (e.g. "2 Adulti × 64€"). */
export interface CartLine {
  key: string;
  label: string;
  qty: number;
  unitPrice: number;
}

/** A single booking in the cart: one product option, on one date + time slot. */
export interface CartItem {
  /** Stable identity for upsert/remove: productKey|optionId|date|slot. */
  id: string;
  productKey: string;
  city: string;
  slug: string;
  title: string;
  image: string;
  optionId: string;
  optionTitle: string;
  /** ISO booking date chosen in the calendar, e.g. "2026-06-15". */
  date: string;
  /** Time slot, e.g. "12:30". */
  slot: string;
  /**
   * Backend slot id (ULID) the order binds to. Populated from the chosen live
   * availability slot; empty string until the availability API ships (the order
   * then stays in preview). The backend resolves price/capacity from this id —
   * `unitPrice`/`total` are display-only.
   */
  slotId: string;
  currency: string;
  /** Slot discount percentage already reflected in `total`. */
  discountPercent: number;
  lines: CartLine[];
  /** Line total in the product currency, discount applied. */
  total: number;
  // --- Product meta for the checkout/confirmation summary chips (Figma 76:14193 /
  // 85:16877). Carried from the product detail at add-to-cart so the summary shows
  // real per-tour data instead of preview constants. Optional: older cart entries
  // (and any non-product line) simply omit them and the UI falls back to preview.
  /** Product rating shown left of the summary title. */
  rating?: number;
  /** Feature chips (Durata · Visita guidata · Lingua) — the option's bullets. */
  features?: string[];
  /** Free-cancellation deadline copy for the summary's cancellation box. */
  cancellationNote?: string;
}

/** Lead-booker details collected at checkout. */
export interface CartCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  notes: string;
}
