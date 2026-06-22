import { Container } from "@/components/ui/Container";
import type { AffiliatesCopy } from "@/lib/i18n/dictionaries/affiliates";

/** "Strumenti a disposizione" — intro + the affiliate-tools list. Figma 447:3680. */
export function AffiliatesTools({ t }: { t: AffiliatesCopy }) {
  return (
    <section className="py-4">
      <Container className="flex flex-col gap-4">
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t.tools.title}</h2>
        <p className="text-base font-medium text-ink">{t.tools.intro}</p>
        <ul className="flex list-disc flex-col gap-2 pl-6 text-base font-medium text-ink">
          {t.tools.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
