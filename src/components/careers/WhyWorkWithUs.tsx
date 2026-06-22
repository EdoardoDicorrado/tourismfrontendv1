"use client";

import Image from "next/image";
import { useState } from "react";

import { Container } from "@/components/ui/Container";
import { Rich } from "@/components/partner/Rich";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Perché lavorare con noi" — intro copy, team image and the "Cosa offriamo"
 * accordion (expand/collapse). Pixel-perfect to Figma "Lavora con Noi // Mobile"
 * (447:1466): the first paragraph is ExtraBold, the rest Medium; the accordion
 * header has a 1px ink divider + a 44px chevron and reveals a bulleted list.
 */
export function WhyWorkWithUs({ dict }: { dict: Dictionary }) {
  const t = dict.careers.why;
  // Figma state A shows this expanded; state B collapsed. Default open.
  const [open, setOpen] = useState(true);

  return (
    <section className="pb-4 pt-8 lg:py-16">
      <Container className="flex flex-col gap-4 lg:gap-10">
        {/* TOP — mobile: titolo, testo, immagine (stack). Desktop (Figma 606:493):
            2 colonne testo SX / immagine DX, centrate. */}
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="flex flex-col gap-4 lg:order-1">
            <h2 className="text-2xl font-extrabold text-ink lg:text-[33px] lg:font-bold">{t.title}</h2>{/* ds-guard-ignore: titolo sezione Figma desktop 40px, fuori type-scale */}

            <div className="flex flex-col gap-4 text-ink">
              {t.body.map((paragraph, i) => (
                <p key={paragraph} className={`text-base ${i === 0 ? "font-extrabold" : "font-medium"} lg:text-lg`}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="relative h-[146px] w-full overflow-hidden rounded-panel lg:order-2 lg:h-auto lg:aspect-[700/493]">{/* ds-guard-ignore: img why h-146 grandfathered + aspect Figma 700/493 */}
            <Image
              src="/images/partner-viaggio-persone.jpg"
              alt={t.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* "Cosa offriamo" accordion */}
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="cosa-offriamo"
            className="flex items-center justify-between gap-2 border-b border-ink text-left"
          >
            <span className="text-xl font-extrabold text-ink">{t.offerTitle}</span>
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className={`size-11 shrink-0 p-2.5 text-ink transition-transform ${open ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {open && (
            <ul
              id="cosa-offriamo"
              className="mt-4 flex list-disc flex-col gap-2 pl-6 text-base font-medium text-ink"
            >
              {t.offer.map((item) => (
                <li key={item}>
                  <Rich text={item} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}
