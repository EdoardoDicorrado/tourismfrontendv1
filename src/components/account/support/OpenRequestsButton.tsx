"use client";

import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { useSupportThreads } from "@/lib/account/supportStore";
import type { SupportAudience } from "@/lib/account/mockSupport";

/**
 * Support chat entry: a primary CTA that opens a brand-new chat directly
 * ({@link basePath}/chat/new) plus a link to the requests list (badged with the
 * unread operator replies). A "new" chat is only persisted once the user actually
 * sends a message — see {@link SupportChatScreen}.
 *
 * ponytail: IT strings hardcoded (preview, like the rest of the support surface).
 */
export function OpenRequestsButton({
  audience,
  basePath,
}: {
  audience: SupportAudience;
  basePath: string;
}) {
  const threads = useSupportThreads(audience);
  const totalUnread = threads.reduce((n, t) => n + t.unread, 0);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-extrabold text-ink">Assistenza via chat</h2>
      <ButtonLink href={`${basePath}/chat/new`} variant="primary" size="lg" fullWidth>
        Avvia una nuova chat
      </ButtonLink>
      <Link
        href={`${basePath}/richieste`}
        className="flex items-center justify-between gap-3 rounded-panel border border-soft-grey bg-white px-5 py-4 transition-colors hover:border-cta"
      >
        <span className="flex min-w-0 flex-col">
          <span className="font-extrabold text-ink">Richieste aperte</span>
          <span className="text-sm text-ink/60">Vedi e rispondi alle tue richieste di assistenza</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {totalUnread > 0 ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-badge px-1.5 py-0.5 text-xs font-bold text-white">
              +{totalUnread}
            </span>
          ) : null}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="text-ink/40">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Link>
    </section>
  );
}
