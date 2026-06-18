"use client";

import type { ParticipantType } from "@/data/product";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/Button";
import { Chevron, CloseButton, Stepper } from "./glyphs";

export type Counts = Record<string, number>;

/**
 * Reusable participants overlay: header + close ×, one stepper row per type
 * (bounded by each type's `min`) and a confirm action. Localized via `labels`.
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
    <div className="rounded-[15px] border border-stroke-2 bg-white p-4 shadow-xl">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="font-bold text-cta">{labels.title}</p>
        <CloseButton onClick={onClose} label={labels.close} />
      </div>

      <ul className="divide-y divide-soft-grey">
        {participants.map((p) => (
          <li key={p.key} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="font-bold text-ink">{p.label}</p>
              <p className="text-xs text-ink/60">{p.ageRange}</p>
            </div>
            <div className="flex items-center gap-4">
              <Stepper
                aria-label={fill(labels.decrease, { label: p.label })}
                disabled={counts[p.key] <= p.min}
                onClick={() => onChange(p.key, -1)}
              >
                <Chevron dir="left" />
              </Stepper>
              <span className="w-4 text-center font-bold text-ink">{counts[p.key]}</span>
              <Stepper aria-label={fill(labels.increase, { label: p.label })} onClick={() => onChange(p.key, 1)}>
                <Chevron dir="right" />
              </Stepper>
            </div>
          </li>
        ))}
      </ul>

      <Button type="button" onClick={onConfirm} size="md" fullWidth className="mt-3">
        {confirmLabel}
      </Button>
    </div>
  );
}
