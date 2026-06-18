"use client";

import type { ParticipantType } from "@/data/product";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Popover } from "@/components/ui/Popover";
import { ParticipantsSelector, type Counts } from "./ParticipantsSelector";
import { FieldButton, PersonIcon } from "./glyphs";

/**
 * Booking-box participants field: a bordered trigger pill summarising the
 * current selection that opens the {@link ParticipantsSelector} in a popover.
 */
export function ParticipantsField({
  participants,
  counts,
  onChange,
  placeholder,
  selectorLabels,
  confirmLabel,
}: {
  participants: ParticipantType[];
  counts: Counts;
  onChange: (key: ParticipantType["key"], delta: number) => void;
  placeholder: string;
  selectorLabels: Dictionary["booking"]["participants"];
  confirmLabel: string;
}) {
  const summary =
    participants
      .filter((p) => counts[p.key] > 0)
      .map((p) => `${counts[p.key] === 1 ? p.label : p.labelPlural} x${counts[p.key]}`)
      .join("  ·  ") || placeholder;

  return (
    <Popover
      align="stretch"
      sheet
      trigger={({ open, toggle, id }) => (
        <FieldButton id={id} active={open} onClick={toggle} icon={<PersonIcon />} label={summary} />
      )}
    >
      {({ close }) => (
        <ParticipantsSelector
          participants={participants}
          counts={counts}
          onChange={onChange}
          onConfirm={close}
          onClose={close}
          labels={selectorLabels}
          confirmLabel={confirmLabel}
        />
      )}
    </Popover>
  );
}
