import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/lib/i18n/config";
import type { AgenciesCopy } from "@/lib/i18n/dictionaries/agencies";

import { Rich } from "./Rich";

/** Hero band + title/subtitle/CTA, followed by the intro paragraph. Figma 447:2756 + 447:2765. */
export function AgenciesHero({ lang, t }: { lang: Locale; t: AgenciesCopy }) {
  return (
    <section className="py-4">
      <div className="relative h-[127px] w-full overflow-hidden">
        <Image
          src="/images/hero-agenzie-banner.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <Container className="mt-4 flex flex-col gap-4">
        <h1 className="text-[32px] font-bold leading-[1.1] text-ink">{t.hero.title}</h1>
        <p className="text-sm font-medium text-ink">{t.hero.subtitle}</p>
        <ButtonLink href={`/${lang}/agenzie/registrati`} size="lg" fullWidth>
          {t.hero.cta}
        </ButtonLink>
      </Container>

      <Container className="mt-4">
        <p className="text-base font-medium leading-relaxed text-ink">
          <Rich text={t.intro} />
        </p>
      </Container>
    </section>
  );
}
