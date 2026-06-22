import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Disclosure } from "@/components/ui/Disclosure";
import { OpenRequestsButton } from "@/components/account/support/OpenRequestsButton";

type Params = { lang: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.account.menu.support} — TourisMotion` };
}

// ponytail: customer FAQ + support email hardcoded IT (preview, like the affiliate
// dashboard). i18n deposited to marketing alongside the SupportRequests strings.
const FAQ: { q: string; a: string }[] = [
  { q: "Come ricevo il mio voucher?", a: "Il voucher viene inviato via email subito dopo il pagamento e resta sempre scaricabile dall'area Prenotazioni." },
  { q: "Posso modificare o annullare una prenotazione?", a: "Sì, dalle tue prenotazioni puoi modificare gli orari o cancellare l'intera prenotazione finché è ancora aperta e non effettuata." },
  { q: "Quali metodi di pagamento accettate?", a: "Carte di credito/debito e PayPal. Il pagamento è sicuro e criptato." },
  { q: "Il tour si svolge anche in caso di pioggia?", a: "La maggior parte dei tour si svolge con qualsiasi meteo; in caso di annullamento da parte nostra ricevi il rimborso completo." },
];

/**
 * Customer support (`/[lang]/supporto`). Contact email + FAQ + the internal
 * support chat entry ({@link OpenRequestsButton} → requests/chat pages, preview/mock).
 */
export default async function SupportPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <Container className="py-12 sm:py-16">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-10">
            <header className="flex flex-col gap-2">
              <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
                {dict.account.menu.support}
              </h1>
              <p className="text-ink/70">{dict.confirmation.supportNote}</p>
              <p className="text-sm text-ink/70">
                Scrivici a{" "}
                <a href="mailto:supporto@tourismotion.it" className="font-bold text-cta hover:underline">
                  supporto@tourismotion.it
                </a>{" "}
                oppure apri una richiesta di assistenza qui sotto.
              </p>
            </header>

            {/* Internal support chat (preview) — opens the requests list page. */}
            <OpenRequestsButton audience="customer" basePath={`/${lang}/supporto`} />

            {/* FAQ */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-extrabold text-ink">Domande frequenti</h2>
              <div className="rounded-panel border border-soft-grey bg-white px-5">
                {FAQ.map((item, i) => (
                  <Disclosure key={item.q} summary={item.q} divided={i < FAQ.length - 1}>
                    <p className="pb-4 text-sm text-ink/70">{item.a}</p>
                  </Disclosure>
                ))}
              </div>
            </section>
          </div>
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
