import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SupportRequestsList } from "@/components/account/support/SupportRequestsList";

type Params = { lang: string };

/** Customer support requests list (`/[lang]/supporto/richieste`). */
export default async function SupportRequestsPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <Container className="py-12 sm:py-16">
          <SupportRequestsList audience="customer" basePath={`/${lang}/supporto`} />
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
