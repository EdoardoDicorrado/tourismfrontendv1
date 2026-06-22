import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireRole } from "@/lib/account/session";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SupportRequestsList } from "@/components/account/support/SupportRequestsList";

type Params = { lang: string };

/** Agency support requests list (`/[lang]/agenzie/assistenza/richieste`). */
export default async function AgencySupportRequestsPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("agency", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <Container className="py-12 sm:py-16">
          <SupportRequestsList audience="agency" basePath={`/${lang}/agenzie/assistenza`} />
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
