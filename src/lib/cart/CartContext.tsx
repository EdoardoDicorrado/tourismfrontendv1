"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { useHydrated } from "@/lib/useHydrated";
import type { CartItem } from "./types";

/**
 * Cart state — client-only, persisted to localStorage.
 *
 * This is pre-order UI state, not an order: the backend remains the single writer
 * for orders/bookings (see CLAUDE.md). On checkout the cart is POSTed to the BFF
 * (`/api/checkout`), which proxies to the backend; nothing here is authoritative.
 *
 * The cart lives in a module-level external store read through `useSyncExternalStore`
 * (not React state hydrated in an effect): SSR-safe via `getServerSnapshot`, and it
 * keeps every component — and browser tab — in sync off a single source of truth.
 */

const STORAGE_KEY = "tm_cart";

const EMPTY: CartItem[] = [];

// Cached client snapshot — a stable reference so `getSnapshot` doesn't loop renders.
let snapshot: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function parseCart(raw: string | null): CartItem[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** Read localStorage once into the cached snapshot (client-only; never on the server). */
function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  try {
    snapshot = parseCart(localStorage.getItem(STORAGE_KEY));
  } catch {
    // Storage unavailable — start empty.
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage full/blocked — non-fatal.
  }
}

function commit(next: CartItem[]) {
  snapshot = next;
  persist();
  emit();
}

function subscribe(listener: () => void): () => void {
  ensureLoaded();
  listeners.add(listener);

  // Keep other tabs in sync.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    snapshot = parseCart(event.newValue);
    emit();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): CartItem[] {
  ensureLoaded();
  return snapshot;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

// Mutations operate on the cached snapshot and notify subscribers (stable identities).
function addItem(item: CartItem) {
  commit([...snapshot.filter((i) => i.id !== item.id), item]);
}
function removeItem(id: string) {
  commit(snapshot.filter((i) => i.id !== id));
}
function clear() {
  commit(EMPTY);
}

interface CartValue {
  items: CartItem[];
  /** False during the first client render (before localStorage is read) — gate UI that must not flash. */
  hydrated: boolean;
  /** Number of bookings in the cart (badge count). */
  count: number;
  /** Sum of line totals in EUR. */
  total: number;
  /** Add or replace a booking (matched by `item.id`). */
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  /** Whether the slide-in cart drawer is open. */
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const value = useMemo<CartValue>(
    () => ({
      items,
      hydrated,
      count: items.length,
      total: items.reduce((sum, i) => sum + i.total, 0),
      addItem,
      removeItem,
      clear,
      open,
      openCart,
      closeCart,
    }),
    [items, hydrated, open, openCart, closeCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
