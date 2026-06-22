"use client";

import Link from "next/link";

import { useSupportThreads } from "@/lib/account/supportStore";
import type { SupportAudience, SupportThread } from "@/lib/account/mockSupport";

/**
 * Requests list page body: all of the user's support requests, each linking to
 * its own chat page (`{basePath}/chat/{id}`). "Nuova richiesta" opens an empty
 * `/chat/new` — that request is only saved once the user sends a message.
 *
 * ponytail: IT strings hardcoded (preview, like the rest of the support surface).
 */
export function SupportRequestsList({
  audience,
  basePath,
}: {
  audience: SupportAudience;
  basePath: string;
}) {
  const threads = useSupportThreads(audience);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href={basePath} className="text-sm font-semibold text-cta hover:underline">
          ← Assistenza
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Richieste aperte</h1>
          <Link
            href={`${basePath}/chat/new`}
            className="inline-flex items-center gap-2 rounded-[10px] bg-cta px-4 py-2.5 text-sm font-extrabold text-white transition-opacity hover:opacity-90"
          >
            + Nuova richiesta
          </Link>
        </div>
      </div>

      {threads.length === 0 ? (
        <p className="rounded-panel border border-soft-grey bg-white px-4 py-8 text-center text-sm text-ink/60">
          Non hai ancora richieste.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-panel border border-soft-grey bg-white">
          {threads.map((t) => {
            const last = t.messages[t.messages.length - 1];
            return (
              <li key={t.id}>
                <Link
                  href={`${basePath}/chat/${t.id}`}
                  className="flex w-full items-center gap-3 border-b border-soft-grey px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-soft"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-bold text-ink">{t.subject}</span>
                      <StatusPill status={t.status} />
                    </span>
                    {last ? (
                      <span className="mt-0.5 block truncate text-sm text-ink/60">
                        {last.from === "operator" ? "Operatore: " : "Tu: "}
                        {last.text}
                      </span>
                    ) : null}
                  </span>
                  {t.unread > 0 ? (
                    <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-badge px-1.5 py-0.5 text-xs font-bold text-white">
                      +{t.unread}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
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
