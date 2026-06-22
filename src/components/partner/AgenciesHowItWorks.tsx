import { Container } from "@/components/ui/Container";
import type { AgenciesCopy } from "@/lib/i18n/dictionaries/agencies";

/** "Come funziona?" — 4 numbered, outlined steps. Figma 447:2806. */
export function AgenciesHowItWorks({ t }: { t: AgenciesCopy }) {
  return (
    <section className="py-4">
      <Container className="flex flex-col gap-4">
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t.how.title}</h2>
        <ol className="flex flex-col gap-4">
          {t.how.steps.map((step) => (
            <li key={step.n} className="flex flex-col gap-2 rounded-card border border-stroke p-4">
              <span className="text-base font-extrabold text-cta">{step.n}</span>
              <h3 className="text-2xl font-extrabold text-ink">{step.title}</h3>
              <p className="text-sm font-medium text-ink">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
