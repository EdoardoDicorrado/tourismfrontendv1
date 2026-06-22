"use client";

import { useSyncExternalStore } from "react";

/**
 * PREVIEW-ONLY client store of booking UUIDs the user has "cancelled" locally.
 *
 * There is no real customer cancellation endpoint yet (the DELETE BFF doesn't
 * exist), and the mock bookings are regenerated server-side on every request, so
 * a cancellation can't persist server-side. This keeps the cancelled ids in
 * localStorage so the UI can flip the booking's state badge to "cancelled" (and
 * keep the row on screen) across navigations — without actually deleting anything.
 *
 * Mirrors the demoUser external-store pattern (SSR-safe: server snapshot is the
 * shared EMPTY set). Remove this together with the real cancellation wiring
 * (full-stack).
 */

const KEY = "tm_cancelled_bookings";

/** Shared stable empty set — used as the server snapshot and the default. */
const EMPTY: ReadonlySet<string> = new Set();

let snapshot: ReadonlySet<string> = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function parse(raw: string | null): ReadonlySet<string> {
  if (!raw) return EMPTY;
  try {
    const arr: unknown = JSON.parse(raw);
    return Array.isArray(arr)
      ? new Set(arr.filter((x): x is string => typeof x === "string"))
      : EMPTY;
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

function getSnapshot(): ReadonlySet<string> {
  ensureLoaded();
  return snapshot;
}

function getServerSnapshot(): ReadonlySet<string> {
  return EMPTY;
}

/** Mark a booking as locally cancelled (preview). No-op if already marked. */
export function markBookingCancelled(id: string) {
  ensureLoaded();
  if (snapshot.has(id)) return;
  const next = new Set(snapshot);
  next.add(id);
  snapshot = next;
  try {
    localStorage.setItem(KEY, JSON.stringify([...next]));
  } catch {
    // non-fatal
  }
  emit();
}

/** Reactive set of locally-cancelled booking uuids. SSR-safe (empty on the server). */
export function useCancelledBookings(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
