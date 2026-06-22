import { Container } from "@/components/ui/Container";
import { Disclosure } from "@/components/ui/Disclosure";
import type { AffiliatesCopy } from "@/lib/i18n/dictionaries/affiliates";

/** "Domande frequenti" — affiliate FAQ accordion. Figma 447:3763 + faq 447:3766. */
export function AffiliatesFaq({ t }: { t: AffiliatesCopy }) {
  return (
    <section className="py-4">
      <Container className="flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t.faq.title}</h2>
        <div className="flex flex-col">
          {t.faq.items.map((item) => (
            <Disclosure
              key={item.q}
              summary={<span className="text-base font-bold text-ink">{item.q}</span>}
            >
              <p className="text-sm leading-relaxed text-ink/80">{item.a}</p>
            </Disclosure>
          ))}
        </div>
      </Container>
    </section>
  );
}
