"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Container } from "@/components/ui/Container";
import { faqs } from "@/data/listing";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Domande generali" — FAQ accordion. Figma node 221:4847.
 * Single-open: only one answer expanded at a time. Each answer opens/closes with
 * the SAME fluid height+fade animation as the footer sections
 * ({@link FooterSection}): framer-motion `height 0↔auto` + opacity, 0.3s
 * ease [0.4,0,0.2,1]. Honours `prefers-reduced-motion` (plain fade, no height).
 */
export function Faq({ dict }: { dict: Dictionary }) {
  const [open, setOpen] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();
  const baseId = useId();

  return (
    <section className="py-8 sm:py-12">
      <Container>
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">{dict.faq.title}</h2>

        <div className="mx-auto mt-6 max-w-[860px] divide-y divide-soft-grey border-y border-soft-grey">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            const panelId = `${baseId}-${i}`;
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-base font-bold text-ink sm:text-lg">{f.question}</span>
                  <Image
                    src="/images/icon-chevron-faq.svg"
                    alt=""
                    width={18}
                    height={10}
                    className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      key="content"
                      className="overflow-hidden"
                      initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                      exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={
                        reduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
                      }
                    >
                      <p className="pb-5 text-sm text-ink/80 sm:text-base">{f.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
