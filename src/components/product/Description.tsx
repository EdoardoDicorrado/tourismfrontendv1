"use client";

import { useState } from "react";

import { Disclosure } from "@/components/ui/Disclosure";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Descrizione" accordion (Figma 64:10323): collapsible section with a chevron,
 * plus an inner "Mostra tutto" clamp on the body text. Separator cta (#007CA2)
 * above AND below — `divided={false}` so the primitive's own line doesn't double
 * up (the color/position is a product-page composition choice, not the primitive's).
 */
export function Description({ text, dict }: { text: string; dict: Dictionary }) {
  const [open, setOpen] = useState(false);

  return (
    <Disclosure
      defaultOpen
      divided={false}
      className="border-y border-cta"
      summary={
        <h2 className="text-xl font-extrabold text-ink sm:text-2xl lg:text-3xl">{dict.product.descriptionTitle}</h2>
      }
    >
      <div className="flex flex-col gap-2">
        <p className={`text-base text-ink/80 ${open ? "" : "line-clamp-3"}`}>{text}</p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="self-start text-sm font-bold text-ink underline"
        >
          {open ? dict.product.showLess : dict.product.showMore}
        </button>
      </div>
    </Disclosure>
  );
}
