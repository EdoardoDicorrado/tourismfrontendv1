import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { Card } from "@/components/ui/Card";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = { lang: string };

export const metadata: Metadata = { title: "Impostazioni account — TourisMotion" };

/**
 * PREVIEW affiliate settings hub (`/[lang]/affiliati/impostazioni`). The affiliate
 * counterpart to the customer settings page: cards linking to the surfaces an
 * affiliate actually has. No auth gate yet (affiliate session pending — full-stack
 * #37); IT strings hardcoded (i18n deposited to marketing, like the rest of the
 * affiliate surface).
 */
export default async function AffiliateSettingsPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <AccountLayout lang={lang} dict={dict}>
      <h2 className="mb-6 text-xl font-extrabold text-ink">Impostazioni account</h2>

      <div className="grid gap-6 sm:grid-cols-2">
        <SettingLinkCard
          href={`/${lang}/affiliati/profilo`}
          title="Dati account"
          desc="Nome, email e recapiti del tuo account"
          icon={<UserIcon />}
        />
        <SettingLinkCard
          href={`/${lang}/affiliati/profilo/password`}
          title="Sicurezza"
          desc="Modifica la password del tuo account"
          icon={<LockIcon />}
        />
        <SettingLinkCard
          href={`/${lang}/affiliati/assistenza/richieste`}
          title="Assistenza"
          desc="Apri una richiesta o continua una chat"
          icon={<LifebuoyIcon />}
        />
      </div>
    </AccountLayout>
  );
}

/** Clickable settings card linking to an affiliate surface. */
function SettingLinkCard({
  href,
  title,
  desc,
  icon,
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="group block">
      <Card
        as="article"
        variant="white"
        className="flex h-full items-center gap-4 transition-shadow hover:shadow-md"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-soft text-cta">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-ink">{title}</h3>
          <p className="mt-1 text-sm text-ink/60">{desc}</p>
        </div>
        <ChevronRight />
      </Card>
    </Link>
  );
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LifebuoyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 5l4 4M19 5l-4 4M5 19l4-4M19 19l-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0 text-ink/40 transition-colors group-hover:text-cta"
    >
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
