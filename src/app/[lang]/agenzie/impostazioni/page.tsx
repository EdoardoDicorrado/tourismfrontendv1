import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { AgencyCancellationCard } from "@/components/account/AgencyCancellationCard";
import { Card } from "@/components/ui/Card";
import { getAgencyProfile } from "@/lib/account/client";
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
 * Agency account page (`/[lang]/agenzie/impostazioni`). Agency-gated.
 *
 * Read-only summary cards for "Dati di contatto" and "Dati di fatturazione", each
 * with "Modifica" → the editable page (/profilo, /profilo/pagamento). The
 * admin-managed values (agency code, commission, API access) sit right under the
 * contact card as title-less stat cards (affiliate-dashboard style) because they
 * are NOT editable. Security + profile-cancellation below.
 */
export default async function AgencySettingsPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("agency", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;

  const t = dict.account.settings;
  const p = dict.account.profile;
  const profile = await getAgencyProfile(session.token);
  const { agency } = profile;

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="settings">
      <h2 className="mb-6 text-xl font-extrabold text-ink">{t.title}</h2>

      <div className="flex flex-col gap-6">
        {/* In alto: codice agenzia / commissione / accesso API — NON modificabili. */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label={p.agencyCode} value={agency.code || "—"} />
          <Stat
            label={p.commission}
            value={agency.commission_percent == null ? "—" : `${agency.commission_percent}%`}
          />
          <Stat label={p.apiEnabled} value={agency.api_enabled ? t.apiActive : t.apiInactive} />
        </div>

        {/* Dati di contatto + fatturazione vivono in una pagina dedicata. */}
        <SettingLinkCard
          href={`/${lang}/agenzie/dati-agenzia`}
          title={t.editAgency}
          desc={t.editAgencyDesc}
          icon={<BuildingIcon />}
        />

        {/* Sicurezza — resta link card. */}
        <SettingLinkCard
          href={`/${lang}/agenzie/profilo/sicurezza`}
          title={t.security}
          desc={t.securityDesc}
          icon={<ShieldIcon />}
        />

        <AgencyCancellationCard dict={t} />
      </div>
    </AccountLayout>
  );
}

/** Non-editable value, styled like the affiliate-dashboard stat cards. */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-panel border border-soft-grey bg-white p-5">
      <p className="text-sm font-semibold text-ink/60">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
    </div>
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
      <path d="M3 21h18M5 21V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 8h1m4 0h1M9 12h1m4 0h1M9 16h1m4 0h1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
