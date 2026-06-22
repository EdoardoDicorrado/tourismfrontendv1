/**
 * Deterministic month-grid generation for the date selectors (booking + search).
 *
 * Pure & SSR-safe: never calls `Date.now()` or argless `new Date()` — every cell
 * is a function of (year, month, day) only, so server and client render the same
 * markup (no hydration drift). Pricing/availability are mocked here; when the
 * storefront availability API lands (see CLAUDE.md), feed real per-day data into
 * `MonthView` and drop `pricingFor`.
 */

export type Availability = "high" | "low" | "none";

export interface CalendarDay {
  iso: string; // "2026-06-12"
  day: number; // 12
  availability: Availability;
  price: number | null; // null when sold out
  discount?: number; // % badge
  disabled: boolean; // sold out or before minIso
}

export interface CalendarCell {
  /** null for leading/trailing blanks padding the grid to whole weeks. */
  day: CalendarDay | null;
}

export interface MonthView {
  year: number;
  month: number; // 0-11
  label: string; // "Giugno 2026"
  weeks: CalendarCell[][];
}

export interface PricingInput {
  basePrice: number;
  lowPrice: number;
  discountPercent: number;
}

const MONTHS = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO date string from numeric parts (month is 0-based). */
export function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function monthLabel(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`;
}

/** Italian month name → 0-based index ("Giugno" → 5). Falls back to 0. */
export function monthIndexFromLabel(label: string): number {
  const i = MONTHS.indexOf(label);
  return i === -1 ? 0 : i;
}

/** Year/month shifted by `delta` months, with rollover. */
export function addMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const total = year * 12 + month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

/** Deterministic mock pricing/availability keyed on weekday + day number. */
function pricingFor(
  weekday: number, // 0 Sun … 6 Sat
  day: number,
  p: PricingInput,
): { availability: Availability; price: number | null; discount?: number } {
  // Late-month Sundays sell out — seeds the grid with a few "none" cells.
  if (weekday === 0 && day > 21) return { availability: "none", price: null };
  // Weekends: fewer options, lower headline price.
  if (weekday === 0 || weekday === 6) return { availability: "low", price: p.lowPrice };
  // Fridays carry the promo discount badge.
  if (weekday === 5) return { availability: "high", price: p.basePrice, discount: p.discountPercent };
  // Mon–Thu: full availability at base price.
  return { availability: "high", price: p.basePrice };
}

/**
 * Build a Monday-first month grid. `minIso` (inclusive) disables earlier days,
 * e.g. dates before "today" — pass undefined to allow the whole month.
 */
export function buildMonth(
  year: number,
  month: number,
  pricing: PricingInput,
  minIso?: string,
): MonthView {
  const startCol = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < startCol; i++) cells.push({ day: null });

  for (let day = 1; day <= daysInMonth; day++) {
    const weekday = new Date(year, month, day).getDay();
    const { availability, price, discount } = pricingFor(weekday, day, pricing);
    const iso = isoDate(year, month, day);
    const disabled = availability === "none" || (minIso ? iso < minIso : false);
    cells.push({ day: { iso, day, availability, price, discount, disabled } });
  }

  while (cells.length % 7 !== 0) cells.push({ day: null });

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return { year, month, label: monthLabel(year, month), weeks };
}
