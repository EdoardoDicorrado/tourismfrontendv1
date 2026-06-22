"use client";

/**
 * Cross-component request to open the search overlay (e.g. from the empty cart's
 * "explore" CTA). The overlay itself is owned by the page's search trigger —
 * {@link HeaderSearch} on internal pages, {@link HomeSearchBar} on the home hero —
 * so they listen for this and open in place. A plain window event keeps it
 * provider-free; only one trigger is mounted per page, so exactly one responds.
 */
const EVENT = "tm:open-search";

/** Ask the current page's search trigger to open the overlay. */
export function emitOpenSearch() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

/** Subscribe a search trigger to open requests. Returns an unsubscribe fn. */
export function onOpenSearch(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
