import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
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
  return { title: `${dict.account.customerSettings.title} — TourisMotion` };
}

/**
 * Customer account-settings hub (`/[lang]/area/impostazioni`). Customer-gated.
 * The counterpart to the agency settings page: cards linking to personal data
 * (/area/profilo), payment methods (/area/profilo/pagamento) and security
 * (/area/profilo/password).
 */
export default async function CustomerSettingsPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("customer", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;

  const t = dict.account.customerSettings;

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="settings">
      <h2 className="mb-6 text-xl font-extrabold text-ink">{t.title}</h2>

      <div className="grid gap-6 sm:grid-cols-2">
        <SettingLinkCard
          href={`/${lang}/area/profilo`}
          title={t.personalTitle}
          desc={t.personalDesc}
          icon={<UserIcon />}
        />
        <SettingLinkCard
          href={`/${lang}/area/profilo/pagamento`}
          title={t.paymentTitle}
          desc={t.paymentDesc}
          icon={<CardIcon />}
        />
        <SettingLinkCard
          href={`/${lang}/area/profilo/password`}
          title={t.securityTitle}
          desc={t.securityDesc}
          icon={<LockIcon />}
        />
      </div>
    </AccountLayout>
  );
}

/** Clickable settings card linking to an edit page. */
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

function CardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
