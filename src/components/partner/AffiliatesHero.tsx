import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Rich } from "@/components/partner/Rich";
import type { Locale } from "@/lib/i18n/config";
import type { AffiliatesCopy } from "@/lib/i18n/dictionaries/affiliates";

/** Hero band + title/subtitle, the "Diventa affiliato" CTA (→ the 2-step request
 *  page) and the intro paragraph. Figma 447:3589 + 447:3598. */
export function AffiliatesHero({ lang, t }: { lang: Locale; t: AffiliatesCopy }) {
  return (
    <section className="py-4">
      <div className="relative h-[115px] w-full overflow-hidden">
        <Image
          src="/images/affiliati/hero.jpg"
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
        <ButtonLink href={`/${lang}/partner/affiliati/candidati`} size="lg" fullWidth>
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
