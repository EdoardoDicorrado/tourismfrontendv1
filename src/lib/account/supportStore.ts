"use client";

import { useSyncExternalStore } from "react";

import {
  getSupportThreads,
  type SupportAudience,
  type SupportThread,
} from "./mockSupport";

/**
 * PREVIEW-ONLY client store for the support chat, split across pages.
 *
 * The chat now lives on separate routes (requests list → full-screen chat), so a
 * plain per-component `useState` would lose sent messages / closed status when
 * navigating between them. This keeps the threads (seeded from {@link
 * getSupportThreads}) in a module store mirrored to localStorage, so the state
 * survives navigation. SSR-safe: the server snapshot is the stable mock seed.
 *
 * ponytail: swap for the real support-chat BFF (GET threads / POST message /
 * PATCH close) when it lands (full-stack) — the components stay unchanged.
 */

const KEY = "tm_support_threads";

type State = Record<SupportAudience, SupportThread[]>;

function seed(): State {
  return {
    customer: getSupportThreads("customer"),
    agency: getSupportThreads("agency"),
    affiliate: getSupportThreads("affiliate"),
  };
}

/** Stable server snapshot (also the pre-hydration client default). */
const SERVER: State = seed();

let snapshot: State = SERVER;
let loaded = false;
let newCount = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    // storage unavailable — keep in-memory only
  }
}

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<State>;
    snapshot = {
      customer: parsed.customer ?? SERVER.customer,
      agency: parsed.agency ?? SERVER.agency,
      affiliate: parsed.affiliate ?? SERVER.affiliate,
    };
  } catch {
    // bad JSON — stay on the seed
  }
}

function update(audience: SupportAudience, fn: (threads: SupportThread[]) => SupportThread[]) {
  load();
  snapshot = { ...snapshot, [audience]: fn(snapshot[audience]) };
  persist();
  emit();
}

/** Append a user message to a thread (no-op on empty text). */
export function sendSupportMessage(audience: SupportAudience, threadId: string, text: string) {
  const t = text.trim();
  if (!t) return;
  update(audience, (threads) =>
    threads.map((th) =>
      th.id === threadId
        ? {
            ...th,
            messages: [
              ...th.messages,
              { id: `${th.id}-${th.messages.length}`, from: "user", text: t, at: "ora" },
            ],
          }
        : th,
    ),
  );
}

/** Mark a thread closed ("Termina conversazione"). */
export function endSupportConversation(audience: SupportAudience, threadId: string) {
  update(audience, (threads) =>
    threads.map((th) => (th.id === threadId ? { ...th, status: "closed" } : th)),
  );
}

/** Clear the unread operator-reply counter (called when the chat is opened). */
export function markSupportRead(audience: SupportAudience, threadId: string) {
  load();
  if (!snapshot[audience].some((t) => t.id === threadId && t.unread > 0)) return;
  update(audience, (threads) =>
    threads.map((th) => (th.id === threadId ? { ...th, unread: 0 } : th)),
  );
}

/** Create an open request (optionally with a subject) and return its id. */
export function createSupportRequest(
  audience: SupportAudience,
  subject = "Nuova richiesta",
): string {
  load();
  const id = `new-${audience}-${snapshot[audience].length}-${newCount++}`;
  update(audience, (threads) => [
    { id, subject: subject.trim() || "Nuova richiesta", status: "open", unread: 0, messages: [] },
    ...threads,
  ]);
  return id;
}

function subscribe(cb: () => void): () => void {
  load();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    loaded = false;
    load();
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): State {
  load();
  return snapshot;
}

function getServerSnapshot(): State {
  return SERVER;
}

/** Reactive threads for an audience. SSR-safe (mock seed on the server). */
export function useSupportThreads(audience: SupportAudience): SupportThread[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)[audience];
}

/** Reactive single thread, or null if the id is unknown. */
export function useSupportThread(audience: SupportAudience, id: string): SupportThread | null {
  return useSupportThreads(audience).find((t) => t.id === id) ?? null;
}
