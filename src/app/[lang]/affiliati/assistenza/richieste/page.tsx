import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SupportRequestsList } from "@/components/account/support/SupportRequestsList";

type Params = { lang: string };

/** Affiliate support requests list (`/[lang]/affiliati/assistenza/richieste`). */
export default async function AffiliateSupportRequestsPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <Container className="py-12 sm:py-16">
          <SupportRequestsList audience="affiliate" basePath={`/${lang}/affiliati/assistenza`} />
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
