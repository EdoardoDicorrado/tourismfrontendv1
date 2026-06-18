"use client";

import { useState, type ReactNode } from "react";

import {
  Alert,
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Checkbox,
  Container,
  Divider,
  Disclosure,
  Eyebrow,
  Field,
  Heading,
  IconButton,
  Input,
  Radio,
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
          <code className="rounded bg-soft px-1">design-system</code> via <code className="rounded bg-soft px-1">tasks.md</code>.
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

      <Section title="Typography">
        <Eyebrow>Eyebrow</Eyebrow>
        <Heading size="3xl">Heading 3xl</Heading>
        <Heading size="2xl">Heading 2xl</Heading>
        <SectionTitle>SectionTitle (xl)</SectionTitle>
        <p className="text-sm text-ink/70">Body — Raleway, text-ink/70.</p>
        <p className="text-2xs text-ink/60">text-2xs (10px) meta</p>
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
          <IconButton label="Large" size="lg"><Glyph /></IconButton>
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
        <Row label="Stars">
          <Stars value={4.5} />
          <Stars value={3} size={20} />
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
