"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  createSupportRequest,
  endSupportConversation,
  markSupportRead,
  sendSupportMessage,
  useSupportThread,
} from "@/lib/account/supportStore";
import type { SupportAudience, SupportThread } from "@/lib/account/mockSupport";

/**
 * Full-screen chat page body for one support thread. The screen is a fixed,
 * viewport-height column (`fixed inset-0`): the top bar and the composer stay
 * pinned, only the middle messages list scrolls — so "Termina conversazione" and
 * the input are always visible without scrolling. Opening an existing chat clears
 * its unread badge.
 *
 * NEW REQUEST (`threadId === "new"`): instead of an empty chat, the user fills a
 * short form (titolo + descrizione). On submit we create the thread (subject =
 * titolo), send the description as the first message, and swap the URL to the
 * real id — the chat then continues normally. Leaving without submitting saves
 * nothing.
 *
 * ponytail: IT strings hardcoded (preview, like the rest of the support surface).
 */
export function SupportChatScreen({
  audience,
  threadId,
  basePath,
}: {
  audience: SupportAudience;
  threadId: string;
  basePath: string;
}) {
  const router = useRouter();
  const isNew = threadId === "new";
  const thread = useSupportThread(audience, threadId);
  const [draft, setDraft] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const listHref = `${basePath}/richieste`;

  // Opening an EXISTING chat marks the operator reply read (store mutation, not
  // setState). A brand-new chat has no thread yet — nothing to mark.
  useEffect(() => {
    if (!isNew) markSupportRead(audience, threadId);
  }, [isNew, audience, threadId]);

  if (!isNew && !thread) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-white p-6 text-center">
        <p className="text-ink/70">Richiesta non trovata.</p>
        <Link href={listHref} className="font-extrabold text-cta hover:underline">
          ← Torna alle richieste
        </Link>
      </div>
    );
  }

  const subject = thread?.subject ?? "Nuova richiesta";
  const messages = thread?.messages ?? [];
  const status: SupportThread["status"] = thread?.status ?? "open";
  const closed = status === "closed";
  const lastIsUser = messages.length > 0 && messages[messages.length - 1].from === "user";

  function send() {
    const text = draft.trim();
    if (!text) return;
    sendSupportMessage(audience, threadId, text);
    setDraft("");
  }

  function submitNew() {
    const t = title.trim();
    const d = desc.trim();
    if (!t || !d) return;
    // Now the request becomes real: subject = titolo, first message = descrizione.
    const id = createSupportRequest(audience, t);
    sendSupportMessage(audience, id, d);
    router.replace(`${basePath}/chat/${id}`);
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      <header className="flex items-center gap-3 border-b border-soft-grey px-4 py-3">
        <Link
          href={listHref}
          aria-label="Torna alle richieste"
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-soft"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <span className="min-w-0 flex-1 truncate font-extrabold text-ink">{subject}</span>
        {!isNew ? <StatusPill status={status} /> : null}
      </header>

      {isNew ? (
        <>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
            <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
              <p className="text-sm text-ink/70">
                Descrivi la tua richiesta: titolo e una breve descrizione. Un operatore ti
                risponderà nel più breve tempo possibile.
              </p>
              <div>
                <label htmlFor="req-title" className="mb-1 block text-sm font-bold text-ink">
                  Titolo
                </label>
                <input
                  id="req-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Es. Modifica orario tour"
                  className="w-full rounded-card border border-stroke px-3 py-2.5 text-sm text-ink outline-none focus:border-cta"
                />
              </div>
              <div>
                <label htmlFor="req-desc" className="mb-1 block text-sm font-bold text-ink">
                  Descrizione
                </label>
                <textarea
                  id="req-desc"
                  rows={5}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Descrivi la tua richiesta…"
                  className="w-full resize-none rounded-card border border-stroke px-3 py-2.5 text-sm text-ink outline-none focus:border-cta"
                />
              </div>
            </div>
          </div>
          <div className="border-t border-soft-grey p-4">
            <button
              type="button"
              onClick={submitNew}
              disabled={!title.trim() || !desc.trim()}
              className="w-full rounded-card bg-cta px-5 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Invia richiesta
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <p className="m-auto text-center text-sm text-ink/50">
                Scrivi il primo messaggio: un operatore ti risponderà al più presto.
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={m.from === "user" ? "flex justify-end" : "flex justify-start"}>
                  {/* ds-guard-ignore-next-line: larghezza bolla chat responsive, nessun token % */}
                  <div className="max-w-[80%]">
                    <div
                      className={
                        m.from === "user"
                          ? "rounded-card rounded-br-sm bg-cta px-3 py-2 text-sm text-white"
                          : "rounded-card rounded-bl-sm bg-soft px-3 py-2 text-sm text-ink"
                      }
                    >
                      {m.text}
                    </div>
                    <p className={m.from === "user" ? "mt-1 text-right text-xs text-ink/50" : "mt-1 text-xs text-ink/50"}>
                      {m.from === "operator" ? "Operatore · " : ""}
                      {m.at}
                    </p>
                  </div>
                </div>
              ))
            )}

            {/* Classic "we got it" note while waiting for the operator (shows once the
                user has sent a message and no operator reply has come yet). */}
            {!closed && lastIsUser ? (
              <p className="mt-1 text-center text-xs text-ink/50">
                Un operatore ti risponderà nel più breve tempo possibile.
              </p>
            ) : null}
          </div>

          {closed ? (
            <div className="border-t border-soft-grey px-4 py-5 text-center text-sm text-ink/60">
              Conversazione terminata.
            </div>
          ) : (
            <div className="flex flex-col gap-3 border-t border-soft-grey p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-center gap-2 rounded-full border border-stroke px-2 py-1.5 focus-within:border-cta"
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Scrivi un messaggio…"
                  aria-label="Scrivi un messaggio"
                  className="min-w-0 flex-1 bg-transparent px-2 text-sm text-ink outline-none"
                />
                <button
                  type="submit"
                  aria-label="Invia messaggio"
                  disabled={!draft.trim()}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cta text-white transition-colors hover:bg-cta-hover disabled:opacity-40"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M4 12l16-8-6 16-3.5-6.5L4 12z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </button>
              </form>
              <button
                type="button"
                onClick={() => endSupportConversation(audience, threadId)}
                className="self-center rounded-card border border-badge px-4 py-2 text-sm font-extrabold text-badge transition-colors hover:bg-badge hover:text-white"
              >
                Termina conversazione
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: SupportThread["status"] }) {
  const open = status === "open";
  return (
    <span
      className={
        open
          ? "shrink-0 rounded-full bg-cta/10 px-2 py-0.5 text-xs font-bold text-cta"
          : "shrink-0 rounded-full bg-soft px-2 py-0.5 text-xs font-bold text-ink/60"
      }
    >
      {open ? "Aperta" : "Chiusa"}
    </span>
  );
}
