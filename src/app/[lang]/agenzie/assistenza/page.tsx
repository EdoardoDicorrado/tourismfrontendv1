import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { requireRole } from "@/lib/account/session";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { AgencySupportView } from "@/components/account/AgencySupportView";

type Params = { lang: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.account.agencySupport.title} — TourisMotion` };
}

/**
 * Agency support (`/[lang]/agenzie/assistenza`). Agency-gated, reached from the
 * agency avatar drawer ("Assistenza"). Request form + FAQ + phone contacts.
 */
export default async function AgencySupportPage({ params }: { params: Promise<Params> }) {
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
          <AgencySupportView dict={dict.account.agencySupport} />
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
