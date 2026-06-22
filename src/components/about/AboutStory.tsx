import Image from "next/image";

import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Renders `**…**` runs from the dict copy as ExtraBold emphasis — the Figma text
 * mixes Medium body with ExtraBold highlights within a paragraph (per-word weight).
 * Plain (unmarked) copy renders at the paragraph's base weight.
 */
function BoldText({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-extrabold">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * "Chi è Tourismotion" narrative + "La nostra missione" (text + image).
 * Mobile: single column (Figma 447:1256 / 447:1260). Desktop (lg+): Figma 605:820 /
 * 605:828 — testo a 2 colonne (700/700, gap-40, 24px) per "Chi è"; immagine SINISTRA
 * + testo DESTRA per "missione". Additivo: a mobile tutto resta in colonna con gli
 * stessi gap-4 (display flex), su desktop diventa griglia → mobile congelato.
 */
export function AboutStory({ dict }: { dict: Dictionary }) {
  const intro = dict.about.intro;
  const mission = dict.about.mission;
  return (
    <section className="text-ink">
      <Container>
        {/* Chi è Tourismotion — Figma 605:820 (py-40, gap-48, 2 colonne 700/700) */}
        <div className="flex flex-col gap-4 pt-8 pb-4 lg:pt-10 lg:pb-10">
          <h2 className="text-2xl font-extrabold lg:text-title lg:font-bold">{intro.title}</h2>
          {/* Desktop 2 colonne (Figma 700/700 gap-40). Mobile = stessa colonna, gli
              stessi gap-4 ovunque (lead, body0, body1, body2) → pixel-identico. */}
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-4">
            <div className="flex flex-col gap-4">
              <p className="text-base font-extrabold leading-[1.4] lg:text-xl">{intro.lead}</p>
              <p className="text-base font-medium leading-[1.4] lg:text-xl">
                <BoldText text={intro.body[0]} />
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {intro.body.slice(1).map((paragraph) => (
                <p key={paragraph} className="text-base font-medium leading-[1.4] lg:text-xl">
                  <BoldText text={paragraph} />
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* La nostra missione — Figma 605:828 (immagine SINISTRA 700, testo DESTRA 700) */}
        <div className="flex flex-col gap-4 py-4 lg:py-10">
          <h2 className="text-2xl font-extrabold lg:text-title lg:font-bold">{mission.title}</h2>
          {/* Mobile (flex-col): lead, body, immagine, closing (gap-4) = congelato.
              Desktop (grid 2col): immagine a sx (col1, span 2 righe), testo a dx
              (lead+body riga 1, closing riga 2). */}
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-4">
            <div className="flex flex-col gap-4 lg:col-start-2 lg:row-start-1">
              <p className="text-base font-extrabold leading-[1.4] lg:text-xl">{mission.lead}</p>
              <p className="text-base font-medium leading-[1.4] lg:text-xl">
                <BoldText text={mission.body} />
              </p>
            </div>
            <div className="relative h-[146px] w-full overflow-hidden rounded-panel lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:h-full">{/* ds-guard-ignore: immagine missione mobile 146px, nessun token (desktop lg:h-full) */}
              <Image
                src="/images/about-mission.jpg"
                alt={mission.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-cover"
              />
            </div>
            <p className="text-base font-medium leading-[1.4] lg:col-start-2 lg:row-start-2 lg:text-xl">
              <BoldText text={mission.closing} />
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
