import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

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

/**
 * Support landing (`/[lang]/supporto`) — target of the account menu's "Supporto"
 * link. Minimal placeholder so the menu never 404s: heading (from the shared menu
 * label) + a contact CTA. ⚠️ Real support content/copy (FAQ, channels, hours) is a
 * ui-ux/content deliverable — deposited; replace this stub when it lands.
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
          <div className="mx-auto flex w-full max-w-[560px] flex-col items-start gap-6">
            <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
              {dict.account.menu.support}
            </h1>
            <p className="text-ink/70">{dict.confirmation.supportNote}</p>
            <ButtonLink href="mailto:supporto@tourismotion.it" size="md">
              supporto@tourismotion.it
            </ButtonLink>
          </div>
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
