"use client";

import { useState, type ReactNode } from "react";

import {
  Alert,
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  Checkbox,
  Container,
  Divider,
  Disclosure,
  EmptyState,
  Eyebrow,
  Field,
  Flag,
  FlagStack,
  Heading,
  IconButton,
  Input,
  Radio,
  SearchPill,
  SectionTitle,
  Select,
  Skeleton,
  Spinner,
  Stars,
  Switch,
  Tabs,
  Textarea,
  Toast,
  Tooltip,
} from "@/components/ui";
import { CardSlider } from "@/components/ui/CardSlider";
import { Popover } from "@/components/ui/Popover";
import { Modal } from "@/components/ui/Modal";
import { CloseIcon } from "@/components/ui/icons";

/** A labelled block in the gallery. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-stroke/30 py-8">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-ink/50">{title}</h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

/** A labelled row of examples. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-center">
      <span className="text-xs font-semibold text-ink/60">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const TOKENS: Array<[string, string]> = [
  ["ink", "bg-ink"],
  ["cta", "bg-cta"],
  ["cta-hover", "bg-cta-hover"],
  ["cta-active", "bg-cta-active"],
  ["badge", "bg-badge"],
  ["rate", "bg-rate"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["danger-deep", "bg-danger-deep"],
  ["soft", "bg-soft"],
  ["soft-grey", "bg-soft-grey"],
  ["stroke", "bg-stroke"],
  ["stroke-2", "bg-stroke-2"],
];

export function DSGallery() {
  const [on, setOn] = useState(true);
  const [tab, setTab] = useState("roma");
  const [checked, setChecked] = useState(true);
  const [modal, setModal] = useState<null | "center" | "drawer">(null);

  return (
    <Container className="py-10">
      <header className="mb-6">
        <Eyebrow>Design System</Eyebrow>
        <Heading size="2xl" className="mt-1">
          Primitive & token — reference vivente
        </Heading>
        <p className="mt-2 text-sm text-ink/60">
          Tutto ciò che esiste in <code className="rounded bg-soft px-1">@/components/ui</code>. Consuma
          queste primitive: non ridefinire bottoni/badge/input inline. Variante mancante? Chiedila al{" "}
          <code className="rounded bg-soft px-1">design-system</code> con{" "}
          <code className="rounded bg-soft px-1">agency task &lt;chat-id&gt; design-system</code> — non forkare lo stile.
        </p>
      </header>

      <Section title="Token colore">
        <div className="flex flex-wrap gap-4">
          {TOKENS.map(([name, bg]) => (
            <div key={name} className="flex flex-col items-center gap-1">
              <span className={`size-12 rounded-card border border-stroke/30 ${bg}`} />
              <span className="text-2xs text-ink/60">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Token raggio">
        <div className="flex flex-wrap gap-4">
          {[
            ["badge (5)", "rounded-badge"],
            ["card (10)", "rounded-card"],
            ["panel (15)", "rounded-panel"],
            ["sheet (20)", "rounded-sheet"],
          ].map(([name, r]) => (
            <div key={name} className="flex flex-col items-center gap-1">
              <span className={`size-16 border border-stroke/40 bg-soft ${r}`} />
              <span className="text-2xs text-ink/60">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Token elevazione (ombre)">
        <div className="flex flex-wrap gap-6">
          {[
            ["card", "shadow-card"],
            ["popover", "shadow-popover"],
            ["sheet", "shadow-sheet"],
          ].map(([name, s]) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <span className={`size-16 rounded-card bg-white ${s}`} />
              <span className="text-2xs text-ink/60">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Token motion">
        {/* Durate/easing single-source in globals.css (mirror framer in lib/motion/tokens.ts,
            dominio `animations`). Demo CSS-only: hover sul box → transform con i token. */}
        <Row label="hover (transform + token)">
          <span className="cursor-pointer rounded-card bg-cta px-4 py-2 text-sm text-white transition-transform duration-[var(--duration-base)] ease-[var(--ease-entrance)] hover:-translate-y-1 hover:scale-105">
            Hover me
          </span>
        </Row>
        <Row label="durate">
          <span className="text-xs text-ink/60">fast 150 · base 300 · slow 600 · morph 1200ms</span>
        </Row>
        <Row label="easing">
          <span className="text-xs text-ink/60">ease-entrance (decelerate) · ease-emphasized (in-out)</span>
        </Row>
      </Section>

      <Section title="Typography">
        <Eyebrow>Eyebrow</Eyebrow>
        <Heading size="3xl">Heading 3xl</Heading>
        <Heading size="2xl">Heading 2xl</Heading>
        <SectionTitle>SectionTitle (xl)</SectionTitle>
        <p className="text-sm text-ink/70">Body — Raleway, text-ink/70.</p>
        <p className="text-2xs text-ink/60">text-2xs (10px) meta</p>
      </Section>

      <Section title="Card / superfici">
        <Row label="white (default)">
          <Card className="w-full max-w-xs text-sm text-ink/70">Card bianca bordata — panel &amp; form.</Card>
        </Row>
        <Row label="soft">
          <Card variant="soft" className="w-full max-w-xs text-sm text-ink/70">Card soft — bg-soft.</Card>
        </Row>
        <Row label="padding sm / lg">
          <Card padding="sm" className="text-sm text-ink/70">sm</Card>
          <Card padding="lg" className="text-sm text-ink/70">lg</Card>
        </Row>
      </Section>

      <Section title="Button">
        <Row label="variant">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </Row>
        <Row label="size">
          <Button size="sm">sm</Button>
          <Button size="md">md</Button>
          <Button size="lg">lg</Button>
        </Row>
        <Row label="pill / fullWidth / disabled">
          <Button pill>Pill</Button>
          <Button disabled>Disabled</Button>
          <ButtonLink href="#">ButtonLink</ButtonLink>
        </Row>
        <Row label="IconButton">
          <IconButton label="Solid" variant="solid"><Glyph /></IconButton>
          <IconButton label="Soft" variant="soft"><Glyph /></IconButton>
          <IconButton label="Outline" variant="outline"><Glyph /></IconButton>
          <IconButton label="Ghost" variant="ghost"><Glyph /></IconButton>
          <IconButton label="Elevated" variant="elevated"><Glyph /></IconButton>
          <IconButton label="Danger" variant="danger"><CloseIcon /></IconButton>
          <IconButton label="Large" size="lg"><Glyph /></IconButton>
        </Row>
        <Row label="on-media (su foto scura)">
          <span className="flex gap-3 rounded-card bg-ink p-3">
            <IconButton label="On media prev" variant="on-media"><Glyph /></IconButton>
            <IconButton label="On media close" variant="on-media"><CloseIcon /></IconButton>
          </span>
        </Row>
      </Section>

      <Section title="SearchPill">
        <SearchPill leadingIcon={<Glyph />} className="max-w-md">
          <span className="text-sm text-ink/50">Buscar destinos, tours…</span>
        </SearchPill>
      </Section>

      <Section title="EmptyState">
        <Row label="soft (default)">
          <EmptyState
            className="max-w-md"
            title="Sin resultados"
            description="Prueba a cambiar los filtros o la búsqueda."
            action={<Button size="sm">Limpiar filtros</Button>}
          />
        </Row>
        <Row label="solid">
          <EmptyState tone="solid" className="max-w-md" description="No hay elementos todavía." />
        </Row>
      </Section>

      <Section title="Badge">
        <Row label="solid">
          <Badge variant="solid" tone="badge">-20%</Badge>
          <Badge variant="solid" tone="cta">CTA</Badge>
          <Badge variant="solid" tone="ink">Si esaurisce in fretta</Badge>
          <Badge variant="solid" tone="badge" size="sm">sm</Badge>
        </Row>
        <Row label="count">
          <Badge variant="count" tone="cta">3</Badge>
          <Badge variant="count" tone="badge">9+</Badge>
        </Row>
        <Row label="soft">
          <Badge variant="soft" tone="cta">Confermato</Badge>
          <Badge variant="soft" tone="neutral">In attesa</Badge>
          <Badge variant="soft" tone="badge">Annullato</Badge>
        </Row>
      </Section>

      <Section title="Form controls">
        <Row label="Field">
          <div className="w-full max-w-sm">
            <Field id="ex-email" name="email" label="Email" placeholder="tu@esempio.com" />
          </div>
        </Row>
        <Row label="Field error">
          <div className="w-full max-w-sm">
            <Field id="ex-err" name="x" label="Con errore" defaultValue="non valido" error="Campo obbligatorio" />
          </div>
        </Row>
        <Row label="Input / invalid / disabled">
          <Input placeholder="Input" className="max-w-[180px]" />
          <Input placeholder="invalid" invalid className="max-w-[180px]" />
          <Input placeholder="disabled" disabled className="max-w-[180px]" />
        </Row>
        <Row label="Select / Textarea">
          <Select className="max-w-[180px]" defaultValue="it">
            <option value="it">Italiano</option>
            <option value="es">Español</option>
            <option value="en">English</option>
          </Select>
          <Textarea placeholder="Messaggio…" className="max-w-[260px]" />
        </Row>
        <Row label="Checkbox / Radio">
          <Checkbox id="cb1" label="Cancellazione gratuita" defaultChecked />
          <Checkbox id="cb2" label="Con hint" hint="Fino a 24h prima" />
          <Radio id="r1" name="g" label="Mattina" defaultChecked />
          <Radio id="r2" name="g" label="Pomeriggio" />
        </Row>
        <Row label="Switch (controlled)">
          <Switch checked={on} onChange={setOn} label={on ? "Attivo" : "Spento"} />
        </Row>
      </Section>

      <Section title="Navigation & structure">
        <Row label="Tabs (controlled)">
          <Tabs
            value={tab}
            onValueChange={setTab}
            items={[
              { value: "roma", label: "Roma", count: 12 },
              { value: "firenze", label: "Firenze", count: 5 },
              { value: "venezia", label: "Venezia" },
            ]}
          />
        </Row>
        <Row label="Divider">
          <div className="w-full max-w-sm space-y-3">
            <Divider />
            <Divider label="oppure" />
          </div>
        </Row>
        <Row label="Avatar">
          <Avatar name="Maria Rossi" />
          <Avatar name="Luca" size={32} />
          <Avatar name="Ada Bianchi" size={56} />
        </Row>
        <Row label="Tooltip">
          <Tooltip content="Basato su 1.240 recensioni">
            <span className="cursor-help text-sm font-semibold text-cta underline">Hover / focus me</span>
          </Tooltip>
        </Row>
        <Row label="Disclosure">
          <div className="w-full max-w-md">
            <Disclosure summary="Cosa è incluso" defaultOpen>
              Ingresso, guida, auricolari.
            </Disclosure>
            <Disclosure summary="Punto di incontro">Piazza del Colosseo, 1.</Disclosure>
          </div>
        </Row>
        <Row label="Disclosure · divided={false} (divider dal parent)">
          <div className="w-full max-w-md divide-y divide-soft-grey border-y border-soft-grey">
            <Disclosure summary="Cose da sapere" divided={false} defaultOpen>
              Documento d&apos;identità obbligatorio.
            </Disclosure>
            <Disclosure summary="Accessibilità" divided={false}>
              Percorso accessibile in sedia a rotelle.
            </Disclosure>
          </div>
        </Row>
        <Row label="Stars">
          <Stars value={4.5} />
          <Stars value={3} size={20} />
        </Row>
        <Row label="Flag (singola + fallback codice)">
          <Flag code="it" />
          <Flag code="es" />
          <Flag code="en" />
          <Flag code="ja" />
          <Flag code="ar" />
          <Flag code="xx" />
        </Row>
        <Row label="FlagStack (max 3 + +N)">
          <FlagStack codes={["it", "es", "en"]} />
          <FlagStack codes={["it", "es", "en", "fr", "de", "pt"]} />
          <FlagStack codes={["it", "es", "en", "fr"]} size={24} max={2} />
        </Row>
      </Section>

      <Section title="Feedback">
        <Row label="Alert">
          <div className="w-full max-w-sm space-y-2">
            <Alert variant="success">Operazione riuscita.</Alert>
            <Alert variant="error">Qualcosa è andato storto.</Alert>
            <Alert variant="warning">Posti limitati.</Alert>
            <Alert variant="info">Promemoria informativo.</Alert>
          </div>
        </Row>
        <Row label="Spinner">
          <Spinner />
          <Spinner size={32} />
        </Row>
        <Row label="Skeleton">
          <div className="w-full max-w-sm space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="size-12 rounded-full" />
          </div>
        </Row>
        <Row label="Toast">
          <Toast variant="success" title="Aggiunto al carrello" onClose={() => {}}>
            Colosseo by night × 2
          </Toast>
        </Row>
        <Row label="checkbox state">
          <Checkbox id="cb-state" label={`Controlled: ${checked}`} checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        </Row>
      </Section>

      <Section title="CardSlider">
        <CardSlider label="Avanti" className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
          {["Roma", "Firenze", "Venezia", "Napoli", "Milano"].map((c) => (
            <li key={c} className="w-48 shrink-0 snap-start rounded-card border border-stroke/30 bg-soft p-4 text-sm text-ink/70">
              <span className="font-bold text-ink">{c}</span>
              <p className="mt-1 text-ink/60">Card di esempio nello slider orizzontale.</p>
            </li>
          ))}
        </CardSlider>
      </Section>

      <Section title="Popover (dropdown ancorato + sheet)">
        <Row label="anchored">
          <Popover
            align="start"
            trigger={({ toggle, open, id }) => (
              <Button variant="outline" onClick={toggle} aria-expanded={open} aria-controls={id}>
                Apri dropdown
              </Button>
            )}
            panelClassName="w-64 rounded-card border border-stroke/30 bg-white p-3 shadow-popover"
          >
            {({ close }) => (
              <div className="space-y-2 text-sm text-ink/70">
                <p>Pannello ancorato sotto il trigger. Chiude su outside-click / Esc.</p>
                <Button size="sm" onClick={close}>Chiudi</Button>
              </div>
            )}
          </Popover>
        </Row>
        <Row label="sheet (mobile)">
          <Popover
            sheet
            label="Esempio sheet"
            trigger={({ toggle, open, id }) => (
              <Button onClick={toggle} aria-expanded={open} aria-controls={id}>
                Apri bottom-sheet
              </Button>
            )}
          >
            {({ close }) => (
              <div className="space-y-3 p-4 pt-8 text-sm text-ink/70">
                <p className="font-bold text-ink">Bottom-sheet</p>
                <p>Grabber, scroll-lock, focus-trap ed Esc dal primitive (useFocusTrap). Trascina giù o premi Esc.</p>
                <Button onClick={close}>Chiudi</Button>
              </div>
            )}
          </Popover>
        </Row>
      </Section>

      <Section title="Modal / Drawer">
        <Row label="variant">
          <Button onClick={() => setModal("center")}>Modal center</Button>
          <Button variant="outline" onClick={() => setModal("drawer")}>Drawer destro</Button>
        </Row>
        <Modal open={modal === "center"} onClose={() => setModal(null)} variant="center" label="Esempio modal">
          <div className="space-y-3 p-6 text-sm text-ink/70">
            <p className="font-bold text-ink">Modal centrato</p>
            <p>Backdrop, scroll-lock, focus-trap, Esc — tutto da useFocusTrap. Tab resta dentro.</p>
            <Button onClick={() => setModal(null)}>Chiudi</Button>
          </div>
        </Modal>
        <Modal open={modal === "drawer"} onClose={() => setModal(null)} variant="drawer" label="Esempio drawer">
          <div className="space-y-3 p-6 text-sm text-ink/70">
            <p className="font-bold text-ink">Drawer destro</p>
            <p>Stessa a11y del modal; entra slide-x da destra (cart/menu account).</p>
            <Button onClick={() => setModal(null)}>Chiudi</Button>
          </div>
        </Modal>
      </Section>
    </Container>
  );
}

function Glyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
