"use client";

import type { ParticipantType } from "@/data/product";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/Button";
import { Chevron } from "./glyphs";

export type Counts = Record<string, number>;

/**
 * Participants picker bottom sheet — Figma "Partecipanti" (node 64:11891): grabber +
 * header ("Seleziona partecipanti" + close ○), one row per type (label + età a sinistra,
 * `‹ n ›` chevron-stepper a destra) e CTA "Conferma" piena. Stesso trattamento sheet di
 * {@link Calendar}/RangeCalendar. Localizzato via `labels`.
 */
export function ParticipantsSelector({
  participants,
  counts,
  onChange,
  onConfirm,
  onClose,
  labels,
  confirmLabel,
}: {
  participants: ParticipantType[];
  counts: Counts;
  onChange: (key: ParticipantType["key"], delta: number) => void;
  onConfirm: () => void;
  onClose: () => void;
  labels: Dictionary["booking"]["participants"];
  confirmLabel: string;
}) {
  return (
    <div className="flex flex-col rounded-t-[20px] bg-white">
      {/* Grabber + header (stesso top treatment degli altri sheet) */}
      <div className="shrink-0 border-b border-soft-grey px-4 pb-3 pt-3">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-stroke/60" aria-hidden />
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold text-cta">{labels.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-cta text-cta transition hover:bg-soft"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Una riga per tipo: label + range età · stepper a chevron ‹ n › */}
      <ul className="divide-y divide-soft-grey px-4">
        {participants.map((p) => (
          <li key={p.key} className="flex items-center justify-between gap-4 py-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-base font-bold text-ink">{p.label}</p>
              <p className="text-sm text-ink/60">{p.ageRange}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={fill(labels.decrease, { label: p.label })}
                disabled={counts[p.key] <= p.min}
                onClick={() => onChange(p.key, -1)}
                className="flex h-11 w-11 items-center justify-center text-ink transition active:scale-90 disabled:opacity-30"
              >
                <Chevron dir="left" />
              </button>
              <span className="w-6 text-center text-xl font-extrabold text-ink">{counts[p.key]}</span>
              <button
                type="button"
                aria-label={fill(labels.increase, { label: p.label })}
                onClick={() => onChange(p.key, 1)}
                className="flex h-11 w-11 items-center justify-center text-ink transition active:scale-90"
              >
                <Chevron dir="right" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="px-4 pb-5 pt-3">
        <Button type="button" onClick={onConfirm} size="lg" fullWidth>
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
