/**
 * Backend-controlled display order for the homepage catalog collections
 * (offers, destinations, search attractions/suggestions, partners, reviews).
 *
 * The CRM owns the order via an explicit, drag-to-reorder `position` (lower
 * shows first). This is the single seam the storefront sorts on: when a
 * collection's backend response carries `position`, {@link byPosition} applies
 * it; the local fixtures omit it, so today they keep their curated array order
 * unchanged. Items without a position sort *after* positioned ones, preserving
 * their incoming order among themselves (stable). Pure — safe to call from the
 * catalog facade, adapters, server or client.
 */

export interface Positioned {
  /** Lower = shown first. `undefined`/`null` = unpositioned (keeps incoming order, last). */
  position?: number | null;
}

/** Return a new array sorted by `position` ascending; stable for ties/unpositioned. */
export function byPosition<T extends Positioned>(items: readonly T[]): T[] {
  // Array.prototype.sort is stable (ES2019+), so ties/unpositioned keep incoming order.
  return [...items].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
}
