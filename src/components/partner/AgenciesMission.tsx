import Image from "next/image";

import { Container } from "@/components/ui/Container";
import type { AgenciesCopy } from "@/lib/i18n/dictionaries/agencies";

import { Rich } from "./Rich";

/** "Perché i nostri partner ci scelgono" — heading + paragraph + image. Figma 447:2951. */
export function AgenciesMission({ t }: { t: AgenciesCopy }) {
  return (
    <section className="py-4">
      <Container className="flex flex-col gap-4">
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t.mission.title}</h2>
        <div className="flex flex-col gap-4 text-base font-medium leading-relaxed text-ink">
          {t.mission.paragraphs.map((p) => (
            <p key={p}>
              <Rich text={p} />
            </p>
          ))}
        </div>
        <div className="relative h-[146px] w-full overflow-hidden rounded-panel">
          <Image
            src="/images/partner-viaggio-persone.jpg"
            alt={t.mission.imageAlt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </Container>
    </section>
  );
}
