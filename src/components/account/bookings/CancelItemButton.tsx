"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Flash } from "@/components/account/ui";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Cancel a single booking slot (orario). Two-step: a "Annulla orario" link that
 * reveals an inline confirm, then a destructive confirm that DELETEs via the BFF
 * (`/api/account/bookings/{id}/items/{itemId}`). On success it refreshes the
 * route so the detail re-renders with the slot marked cancelled.
 *
 * Client component: mutation runs in an onClick handler with `useState` for
 * pending/confirming/error (never setState-in-effect — React Compiler is ON).
 */
export function CancelItemButton({
  bookingId,
  itemId,
  lang,
  dict,
}: {
  bookingId: string;
  itemId: string;
  lang: Locale;
  dict: Dictionary["account"];
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function handleConfirm() {
    if (pending) return;
    setPending(true);
    setError(false);
    try {
      const res = await fetch(`/api/account/bookings/${bookingId}/items/${itemId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: lang }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (!res.ok || !data.ok) throw new Error("failed");
      setConfirming(false);
      router.refresh();
    } catch {
      setError(true);
      setPending(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm font-bold text-badge hover:underline"
      >
        {dict.bookingDetail.cancelItem}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-ink">{dict.bookingDetail.cancelItemConfirm}</p>
      {error ? <Flash variant="error">{dict.feedback.error}</Flash> : null}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={pending}
          aria-busy={pending || undefined}
          className="rounded-[10px] bg-badge px-4 py-2 text-sm font-extrabold text-white transition-colors hover:bg-badge/90 disabled:opacity-60"
        >
          {dict.bookingDetail.cancelItem}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="text-sm font-semibold text-ink/70 hover:text-ink"
        >
          {dict.bookingDetail.back}
        </button>
      </div>
    </div>
  );
}
