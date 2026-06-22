"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import type { Booking } from "@/lib/account/types";
import type { Locale } from "@/lib/i18n/config";

import { formatStartAt } from "./datetime";

/**
 * Voucher action for agency/affiliate bookings: opens a PREVIEW of the voucher
 * with "Aggiungi a Wallet" + "Scarica PDF". The PDF streams from the existing BFF
 * (`/api/account/bookings/{id}/voucher`); Wallet (.pkpass / Google Wallet pass) is
 * a backend-pending seam, so that button is a preview stub for now.
 *
 * ponytail: IT strings hardcoded (preview), mirroring the affiliate dashboard;
 * i18n + the real QR/wallet pass deposited to marketing/full-stack.
 */
export function VoucherPreview({ booking, lang }: { booking: Booking; lang: Locale }) {
  const [open, setOpen] = useState(false);
  const [walletNote, setWalletNote] = useState(false);
  const pdfHref = `/api/account/bookings/${encodeURIComponent(booking.uuid)}/voucher`;
  const line = booking.lines[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-[10px] border border-stroke px-5 py-2.5 text-sm font-extrabold text-ink transition-colors hover:border-cta hover:text-cta"
      >
        Scarica voucher
      </button>

      {/* Gutter so the panel never touches the viewport edges on mobile (1rem each
          side = the site's px-4). The `!` beats the Modal primitive's max-w-md.
          ponytail: depositato a design-system per fixare il gutter nel primitive. */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        label="Voucher"
        className="max-w-[min(28rem,calc(100vw-2rem))]! p-6"
      >
        <div className="flex flex-col gap-5">
          <header className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink/60">Voucher</p>
              <p className="text-lg font-extrabold text-ink">{booking.code}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Chiudi"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-soft"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          {/* Voucher preview card. Real QR + layout come from the backend voucher.pdf;
              this is a visual placeholder until that renders inline. */}
          <div className="rounded-[15px] border border-dashed border-stroke bg-soft/40 p-5 text-center">
            <div className="mx-auto flex size-28 items-center justify-center rounded-[10px] border border-stroke bg-white text-xs font-bold text-ink/40">
              QR
            </div>
            {line ? (
              <>
                <p className="mt-4 font-extrabold text-ink">{line.product_name ?? "—"}</p>
                <p className="text-sm text-ink/70">{formatStartAt(line.slot_start, lang)}</p>
                <p className="text-sm text-ink/70">Partecipanti: {line.participant_count}</p>
              </>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setWalletNote(true)}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-ink px-5 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-90"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2H3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path
                  d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-4a2 2 0 0 0 0 4h6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              Aggiungi a Wallet
            </button>
            {walletNote ? (
              <p className="text-center text-xs text-ink/60">Funzione in arrivo.</p>
            ) : null}

            <a
              href={pdfHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-stroke px-5 py-3 text-sm font-extrabold text-ink transition-colors hover:border-cta hover:text-cta"
            >
              Scarica PDF
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
}
