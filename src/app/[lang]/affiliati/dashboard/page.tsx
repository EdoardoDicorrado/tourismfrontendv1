import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CopyButton } from "@/components/affiliate/CopyButton";
import { OpenRequestsButton } from "@/components/account/support/OpenRequestsButton";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/ui/Container";
import { getAffiliateDashboard } from "@/lib/affiliate";
import { formatMoney } from "@/lib/format";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = { lang: string };

export const metadata: Metadata = { title: "Dashboard affiliato — TourisMotion" };

/**
 * PREVIEW affiliate dashboard (ui-ux). Data comes from the `@/lib/affiliate` seam
 * (mock fixture until the affiliate API + session land — swap there, page unchanged);
 * no auth gate yet (affiliate role/session pending backend). Strings hardcoded IT
 * for this first pass (i18n deposited to marketing).
 */
function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-[15px] border border-soft-grey bg-white p-5">
      <p className="text-sm font-semibold text-ink/60">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-ink">{value}</p>
      {note ? <p className="text-sm text-ink/60">{note}</p> : null}
    </div>
  );
}

export default async function AffiliateDashboardPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const a = await getAffiliateDashboard();

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1 bg-soft/30">
        <Container className="py-8 sm:py-12">
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Dashboard affiliato</h1>
          <p className="mt-1 text-ink/70">Ciao, {a.name}</p>

          {/* Payout — what they'll be paid at month end (on top, per Edoardo). */}
          <div className="mt-6 rounded-[15px] bg-cta p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Verrai pagato a fine mese
            </p>
            <p className="mt-1 text-4xl font-extrabold">{formatMoney(a.payout, lang)}</p>
            <p className="mt-2 text-sm text-white/80">Pagamento previsto il {a.payoutDate}</p>
          </div>

          {/* Stats: clicks + bookings generated + commission per sale. */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat label="Click generati" value={a.clicks.toLocaleString(lang)} />
            <Stat label="Prenotazioni generate" value={a.bookings.toLocaleString(lang)} />
            <Stat
              label="La tua commissione"
              value={`${a.commissionPercent}%`}
              note="su ogni vendita"
            />
          </div>

          {/* Reserved discount codes. */}
          <section className="mt-8">
            <h2 className="text-xl font-extrabold text-ink">I tuoi codici sconto</h2>
            <p className="mt-1 text-sm text-ink/70">Codici riservati ai tuoi clienti.</p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {a.codes.map((code) => (
                <li
                  key={code}
                  className="rounded-card border border-dashed border-cta bg-white px-4 py-2 font-bold tracking-wide text-cta"
                >
                  {code}
                </li>
              ))}
            </ul>
          </section>

          {/* Referral link (copyable). */}
          <section className="mt-8">
            <h2 className="text-xl font-extrabold text-ink">Il tuo referral link</h2>
            <p className="mt-1 text-sm text-ink/70">Condividilo per guadagnare commissioni.</p>
            <div className="mt-4 flex items-center gap-3 rounded-card border border-soft-grey bg-white p-3">
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{a.referralUrl}</span>
              <CopyButton text={a.referralUrl} label="Copia" copiedLabel="Copiato" />
            </div>
          </section>

          {/* Affiliate customer support. */}
          <section className="mt-8 rounded-[15px] border border-soft-grey bg-white p-6">
            <h2 className="text-xl font-extrabold text-ink">Servizio clienti affiliati</h2>
            <p className="mt-1 text-sm text-ink/70">
              Hai bisogno di aiuto con il tuo account affiliato?
            </p>
            <a
              href="mailto:affiliati@tourismotion.com"
              className="mt-4 inline-flex rounded-card bg-cta px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              Contatta il supporto affiliati
            </a>

            {/* Chat di assistenza interna (preview) — apre la pagina delle richieste. */}
            <div className="mt-6 border-t border-soft-grey pt-6">
              <OpenRequestsButton audience="affiliate" basePath={`/${lang}/affiliati/assistenza`} />
            </div>
          </section>
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
