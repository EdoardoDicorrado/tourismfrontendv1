import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/lib/i18n/config";
import type { AgenciesCopy } from "@/lib/i18n/dictionaries/agencies";

import { Rich } from "./Rich";

/** "Diventa partner" — heading + paragraph + "Vai al modulo" CTA. Figma 447:2955. */
export function AgenciesJoin({ lang, t }: { lang: Locale; t: AgenciesCopy }) {
  return (
    <section className="py-4">
      <Container className="flex flex-col gap-4">
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t.join.title}</h2>
        <div className="flex flex-col gap-4 text-base font-medium leading-relaxed text-ink">
          {t.join.paragraphs.map((p) => (
            <p key={p}>
              <Rich text={p} />
            </p>
          ))}
        </div>
        <ButtonLink href={`/${lang}/agenzie/registrati`} size="lg" fullWidth>
          {t.join.cta}
        </ButtonLink>
      </Container>
    </section>
  );
}
