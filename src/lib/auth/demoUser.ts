"use client";

import { useSyncExternalStore } from "react";

/**
 * DEMO-ONLY client "logged in" flag (name + email), persisted to localStorage so the
 * avatar menu can be previewed end-to-end without the real customer-auth backend.
 *
 * This is NOT a session: the backend remains the single source of truth for auth
 * (see CLAUDE.md). Remove this store + its callers once real sessions are wired
 * (deposited to full-stack). Mirrors the cart's external-store pattern so SSR is
 * safe (`getServerSnapshot` → null) and every component stays in sync.
 */
export interface DemoUser {
  name: string;
  email: string;
  /** Which preview area the demo flag represents. Absent = customer (legacy). */
  role?: "customer" | "affiliate";
}

const KEY = "tm_demo_user";

let snapshot: DemoUser | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function parse(raw: string | null): DemoUser | null {
  if (!raw) return null;
  try {
    const p: unknown = JSON.parse(raw);
    return p && typeof (p as DemoUser).email === "string" && typeof (p as DemoUser).name === "string"
      ? (p as DemoUser)
      : null;
  } catch {
    return null;
  }
}

function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  try {
    snapshot = parse(localStorage.getItem(KEY));
  } catch {
    // storage unavailable — stay logged out
  }
}

function commit(next: DemoUser | null) {
  snapshot = next;
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
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

function getSnapshot(): DemoUser | null {
  ensureLoaded();
  return snapshot;
}

function getServerSnapshot(): DemoUser | null {
  return null;
}

export function signInDemo(user: DemoUser) {
  commit(user);
}

export function signOutDemo() {
  commit(null);
}

/** Current demo user, or `null` when logged out. SSR-safe (renders logged out). */
export function useDemoUser(): DemoUser | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
