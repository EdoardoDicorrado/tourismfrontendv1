"use client";

import Image from "next/image";

import { Popover } from "@/components/ui/Popover";

/**
 * Info "i" affordance shown to the right of the reviews heading. On click it
 * opens a small tooltip explaining the reviews are an aggregated selection from
 * multiple platforms (Google, etc.). Client component so `Reviews` stays a
 * Server Component (Popover uses a render-prop API that can't cross the RSC
 * boundary).
 */
export function ReviewsInfoTooltip({ label, text }: { label: string; text: string }) {
  return (
    <Popover
      animated
      align="end"
      className="relative inline-flex shrink-0"
      panelClassName="w-64 max-w-[calc(100vw-2rem)] rounded-[10px] border border-stroke-2 bg-white p-4 text-sm font-medium leading-snug text-ink shadow-lg"
      trigger={({ open, toggle, id }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label={label}
          aria-expanded={open}
          aria-controls={id}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta"
        >
          <Image src="/images/icon-info-circle.svg" alt="" width={28} height={28} />
        </button>
      )}
    >
      {() => <p>{text}</p>}
    </Popover>
  );
}
