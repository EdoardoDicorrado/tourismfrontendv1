"use client";

import Image from "next/image";
import { useState } from "react";

import { Container } from "@/components/ui/Container";
import { faqs } from "@/data/listing";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** "Domande generali" — FAQ accordion. Figma node 221:4847. */
export function Faq({ dict }: { dict: Dictionary }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-8 sm:py-12">
      <Container>
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">{dict.faq.title}</h2>

        <div className="mx-auto mt-6 max-w-[860px] divide-y divide-soft-grey border-y border-soft-grey">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-base font-bold text-ink sm:text-lg">{f.question}</span>
                  <Image
                    src="/images/icon-chevron-faq.svg"
                    alt=""
                    width={18}
                    height={10}
                    className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <p className="pb-5 text-sm text-ink/80 sm:text-base">{f.answer}</p>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
