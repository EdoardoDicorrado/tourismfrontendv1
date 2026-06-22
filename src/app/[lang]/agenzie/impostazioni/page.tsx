import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { AgencyCancellationCard } from "@/components/account/AgencyCancellationCard";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/account/session";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = { lang: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.account.settings.title} — TourisMotion` };
}

/**
 * Agency account settings hub (`/[lang]/agenzie/impostazioni`). Agency-gated.
 * Cards: edit agency data → /profilo, edit billing → /profilo/pagamento, and a
 * profile-cancellation request (preview — the real deactivation endpoint is a
 * full-stack task).
 */
export default async function AgencySettingsPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("agency", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;

  const t = dict.account.settings;

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="settings">
      <h2 className="mb-6 text-xl font-extrabold text-ink">{t.title}</h2>

      <div className="grid gap-6 sm:grid-cols-2">
        <SettingLinkCard
          href={`/${lang}/agenzie/profilo`}
          title={t.editAgency}
          desc={t.editAgencyDesc}
          icon={<BuildingIcon />}
        />
        <SettingLinkCard
          href={`/${lang}/agenzie/profilo/pagamento`}
          title={t.editBilling}
          desc={t.editBillingDesc}
          icon={<CardIcon />}
        />
      </div>

      <div className="mt-6">
        <AgencyCancellationCard dict={t} />
      </div>
    </AccountLayout>
  );
}

/** Clickable settings card linking to an existing edit page. */
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

function BuildingIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 21h18M5 21V8l7-4 7 4v13" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 21v-5h6v5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.5 11h1m3 0h1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
