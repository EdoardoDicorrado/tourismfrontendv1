import type { TimeSlot } from "@/data/product";

/**
 * ⚠️ DEMO (testing): live availability gating isn't wired yet, so every booking
 * option must always offer at least {@link MIN_SLOTS} selectable times — the
 * booking → checkout path has to be reachable for every product (mirrors the
 * product page's force-rendered preview sections). Remove the `ensureMinSlots`
 * call in `BookingBox` (and restore the real "no availability" empty state) once
 * live availability may legitimately surface a sold-out / empty day.
 */
export const MIN_SLOTS = 2;

/** Synthetic times used to top a thin day up to {@link MIN_SLOTS}. */
export const DEMO_TIMES = ["09:00", "11:00", "14:00", "16:00"];

/** Guarantee ≥ {@link MIN_SLOTS} bookable times, padding with demo times not already present. */
export function ensureMinSlots(slots: TimeSlot[]): TimeSlot[] {
  if (slots.filter((s) => !s.soldOut).length >= MIN_SLOTS) return slots;
  const out = [...slots];
  for (const time of DEMO_TIMES) {
    if (out.filter((s) => !s.soldOut).length >= MIN_SLOTS) break;
    if (!out.some((s) => s.time === time)) out.push({ time });
  }
  return out;
}
