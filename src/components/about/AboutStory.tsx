import Image from "next/image";

import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Chi è Tourismotion" narrative + "La nostra missione" (text + image).
 * Figma nodes 447:1256 and 447:1260.
 */
export function AboutStory({ dict }: { dict: Dictionary }) {
  const intro = dict.about.intro;
  const mission = dict.about.mission;
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="max-w-[760px]">
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{intro.title}</h2>
          <p className="mt-4 text-base font-bold leading-relaxed text-ink">{intro.lead}</p>
          {intro.body.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-base leading-relaxed text-ink/90">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{mission.title}</h2>
            <p className="text-base font-bold leading-relaxed text-ink">{mission.lead}</p>
            <p className="text-base leading-relaxed text-ink/90">{mission.body}</p>
            <p className="text-base leading-relaxed text-ink/90">{mission.closing}</p>
          </div>
          <div className="order-first lg:order-none">
            <div className="relative h-56 overflow-hidden rounded-[15px] sm:h-72 lg:h-[420px]">
              <Image
                src="/images/partner-musei-vaticani.png"
                alt={mission.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
