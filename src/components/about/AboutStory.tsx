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
 * Figma nodes 447:1256 and 447:1260 — mobile single column (393px, x=16).
 */
export function AboutStory({ dict }: { dict: Dictionary }) {
  const intro = dict.about.intro;
  const mission = dict.about.mission;
  return (
    <section className="text-ink">
      <Container>
        {/* Chi è Tourismotion — node 447:1256 (pt-32 / pb-16, gap-16) */}
        <div className="flex flex-col gap-4 pt-8 pb-4">
          <h2 className="text-2xl font-extrabold">{intro.title}</h2>
          <p className="text-base font-extrabold leading-[1.4]">{intro.lead}</p>
          <div className="flex flex-col gap-4">
            {intro.body.map((paragraph) => (
              <p key={paragraph} className="text-base font-medium leading-[1.4]">
                <BoldText text={paragraph} />
              </p>
            ))}
          </div>
        </div>

        {/* La nostra missione — node 447:1260 (p-16, gap-16) */}
        <div className="flex flex-col gap-4 py-4">
          <h2 className="text-2xl font-extrabold">{mission.title}</h2>
          <div className="flex flex-col gap-4">
            <p className="text-base font-extrabold leading-[1.4]">{mission.lead}</p>
            <p className="text-base font-medium leading-[1.4]">
              <BoldText text={mission.body} />
            </p>
          </div>
          <div className="relative h-[146px] w-full overflow-hidden rounded-[15px]">
            <Image
              src="/images/about-mission.png"
              alt={mission.imageAlt}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <p className="text-base font-medium leading-[1.4]">
            <BoldText text={mission.closing} />
          </p>
        </div>
      </Container>
    </section>
  );
}
