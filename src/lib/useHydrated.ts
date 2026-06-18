"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClient = () => true;
const getServer = () => false;

/**
 * True only after client hydration; false during SSR and the first client render.
 *
 * Use to gate UI that depends on browser-only state (localStorage, sessionStorage)
 * so the SSR markup and first client render stay identical — no hydration mismatch.
 * Backed by `useSyncExternalStore`, so it never calls setState inside an effect.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getClient, getServer);
}
