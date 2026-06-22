"use client";

import { useToast } from "@/lib/toast/ToastContext";

/** Share glyph (currentColor) — three nodes connected, classic share icon. */
function ShareGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="18" cy="5" r="2.6" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="6" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="18" cy="19" r="2.6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.3 10.8 15.7 6.6M8.3 13.2l7.4 4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/**
 * "Condividi" — share the current product page. Uses the Web Share API on
 * supported devices (mobile/Safari), else copies the URL to the clipboard with a
 * toast. Reads the URL at click time (client) so it works on any route.
 * i18n: label/copiedLabel sono IT preview hardcoded (chiavi dict ancora assenti)
 * → vedi task i18n a marketing.
 */
export function ShareButton({
  title,
  label = "Condividi",
  copiedLabel = "Link copiato",
}: {
  title: string;
  label?: string;
  copiedLabel?: string;
}) {
  const { toast } = useToast();

  async function share() {
    const url = window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* utente ha annullato lo share nativo */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({
        variant: "success",
        duration: 2000,
        message: <span className="font-bold text-ink">{copiedLabel}</span>,
      });
    } catch {
      /* clipboard negata → no-op */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 rounded-badge border border-stroke px-3 py-2 text-sm font-extrabold text-ink transition hover:bg-soft active:scale-95"
    >
      <ShareGlyph />
      {label}
    </button>
  );
}
