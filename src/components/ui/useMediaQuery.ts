"use client";

import { useSyncExternalStore } from "react";

/**
 * JS-side responsive switch for the desktop phase. `true` once the viewport is at
 * the desktop breakpoint (`lg` = 1024px) or wider — the SAME switch CSS uses via
 * Tailwind's `lg:` (design canvas is 1280px, but the switch fires at 1024px).
 *
 * Use ONLY when CSS `lg:` can't express the change because the two states render
 * structurally different DOM (e.g. {@link Popover} `responsive`: bottom-sheet in a
 * portal on mobile vs an inline anchored dropdown on desktop). For everything a
 * class toggle can do, use `lg:` / `hidden lg:block` — no JS.
 *
 * SSR + hydration return `false` (mobile-first): the server renders the mobile
 * shape and desktop swaps in after mount, so hydration always matches the server
 * (same `useSyncExternalStore` guard the portal-mount pattern relies on).
 */
const DESKTOP_QUERY = "(min-width: 1024px)";

export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}
