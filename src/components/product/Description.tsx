"use client";

import { useState } from "react";

import type { Dictionary } from "@/lib/i18n/dictionaries";

/** "Descrizione" with a "Mostra tutto" expand toggle. Figma 64:9708. */
export function Description({ text, dict }: { text: string; dict: Dictionary }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl font-extrabold text-ink sm:text-2xl">{dict.product.descriptionTitle}</h2>
      <p className={`text-base text-ink/80 ${open ? "" : "line-clamp-3"}`}>{text}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="self-start text-sm font-bold text-ink underline"
      >
        {open ? dict.product.showLess : dict.product.showMore}
      </button>
    </section>
  );
}
