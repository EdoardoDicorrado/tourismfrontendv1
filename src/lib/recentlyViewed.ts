"use client";

import { useSyncExternalStore } from "react";

import type { Product } from "@/data/home";

/**
 * Client-only "recently viewed tours" store (localStorage) so the home
 * "Sei ancora interessato a:" row reflects what the user actually opened, not a
 * sample. Per-BROWSER, not a session — when real auth/tracking lands, bind it to
 * the user (server/cookie). Mirrors the cart / demoUser external-store pattern so
 * SSR is safe (`getServerSnapshot` → empty) and every consumer stays in sync.
 */
const KEY = "tm_recently_viewed";
const MAX = 8;
/** Stable empty reference — useSyncExternalStore requires getServerSnapshot to be referentially stable. */
const EMPTY: Product[] = [];

let snapshot: Product[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function parse(raw: string | null): Product[] {
  if (!raw) return EMPTY;
  try {
    const p: unknown = JSON.parse(raw);
    return Array.isArray(p) ? (p as Product[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  try {
    snapshot = parse(localStorage.getItem(KEY));
  } catch {
    // storage unavailable — stay empty
  }
}

function commit(next: Product[]) {
  snapshot = next;
  try {
    if (next.length) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  } catch {
    // non-fatal
  }
  emit();
}

function subscribe(cb: () => void): () => void {
  ensureLoaded();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    snapshot = parse(e.newValue);
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Product[] {
  ensureLoaded();
  return snapshot;
}

function getServerSnapshot(): Product[] {
  return EMPTY;
}

/** Record a viewed tour: prepend (most recent first), dedup by id, cap to MAX. */
export function recordViewed(product: Product) {
  ensureLoaded();
  const next = [product, ...snapshot.filter((p) => p.id !== product.id)].slice(0, MAX);
  commit(next);
}

/** The viewed tours, most recent first. SSR-safe (renders empty). */
export function useRecentlyViewed(): Product[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
