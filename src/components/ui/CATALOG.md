# Catalogo Design System — REUSE-FIRST

> **Regola.** Prima di costruire QUALSIASI UI nuova (pagina o componente), cerca qui
> se la primitiva esiste già. Riusa la primitiva, **non re-inventarla inline**.
> Anteprima dal vivo di tutte le primitive: rotta **`/ds`** (`DSGallery`).
> Manca una variante/size/stato? **Chiedila al Design System** con
> `agency task <chat-id> design-system "<cosa serve> — <perché>"` — non forkare lo stile.
>
> Token (colori/raggi/ombre/z/motion) = `src/app/globals.css`, presidiati da `node scripts/ds-guard.mjs`:
> niente hex/raggi/spacing/shadow/z arbitrari o `color-mix`/colore inline → usa i token (gate CI con baseline).
>
> **Invariante:** ogni file in `components/ui` deve comparire in questa tabella **E** in `/ds` (DSGallery).

## "Mi serve… → usa…"

| Mi serve | Primitiva | Import |
|---|---|---|
| **Slider/carosello orizzontale di card** (come homepage: Destinazioni, Offerte, TrustBar, Related) | **`CardSlider`** | `@/components/ui/CardSlider` |
| Bottone (azione) | `Button` | `@/components/ui/Button` |
| Bottone-link (naviga, stesso look) | `ButtonLink` | `@/components/ui/Button` |
| **Bottone solo-icona** (close ×, frecce, back, stepper, rimuovi) | **`IconButton`** (variant solid/soft/outline/ghost/**elevated**/**on-media**/**danger**, size sm28/md36/**lg44**) | `@/components/ui/IconButton` |
| Stile bottone in classi (helper puro) | `buttonVariants`, `cx` | `@/components/ui/buttonVariants` |
| Etichetta/pill stato, contatore | `Badge` | `@/components/ui/Badge` |
| Input testo + label + errore inline | `Field` / `Input` | `@/components/ui/Input` |
| Textarea · Select · Checkbox · Radio · Switch | omonimi | `@/components/ui/{Textarea,Select,Checkbox,Radio,Switch}` |
| Titoli/occhiello/sezione | `Heading`, `SectionTitle`, `Eyebrow` | `@/components/ui/Typography` |
| **Contenitore / superficie** (panel bianco bordato o card soft — sostituisce gli inline `rounded-[15px] border border-soft-grey bg-white`) | **`Card`** (`variant` white/soft, `padding`, `as` per article/section/fieldset) | `@/components/ui/Card` |
| Wrapper larghezza sito (max-w + padding) | `Container` | `@/components/ui/Container` |
| **Barra di ricerca** a pillola (home/listing/overlay/cerca) | **`SearchPill`** (`as`, `leadingIcon`) | `@/components/ui/SearchPill` |
| **Stato vuoto** "nessun risultato" | **`EmptyState`** (tone soft/solid, title/description/action) | `@/components/ui/EmptyState` |
| **Glyph condivisi** (×, caret) — NON ridisegnare l'SVG inline | `CloseIcon`, `CaretDown` | `@/components/ui/icons` |
| Separatore (anche con label "o") | `Divider` | `@/components/ui/Divider` |
| **Chip filtro** (es. città in Offerte) | `Tabs` | `@/components/ui/Tabs` |
| **Accordion / FAQ / "Cose da sapere"** | `Disclosure` | `@/components/ui/Disclosure` |
| **Dropdown ancorato** o **bottom-sheet** (picker mobile: calendario, partecipanti) | `Popover` (`sheet` = sheet sempre · **`responsive`** = sheet <lg, ancorato ≥lg) | `@/components/ui/Popover` |
| **Modal / Drawer full-screen** (dialog centrato, drawer laterale: cart, menu account, login) | **`Modal`** (variant center/drawer — backdrop + scroll-lock + Esc + **focus-trap** condiviso) | `@/components/ui/Modal` |
| **Focus-trap modale** in un overlay custom (scroll-lock + Esc + trap Tab + restore) | **`useFocusTrap`** (hook) | `@/components/ui/useFocusTrap` |
| **Switch responsive in JS** (solo quando il DOM mobile/desktop è strutturalmente diverso e `lg:` non basta) | **`useIsDesktop`** (hook, lg=1024) | `@/components/ui/useMediaQuery` |
| Tooltip (hint hover/focus/tap) | `Tooltip` | `@/components/ui/Tooltip` |
| Banner inline (info/success/warning/error) | `Alert` | `@/components/ui/Alert` |
| Notifica transitoria | `Toast` + `ToastViewport` | `@/components/ui/Toast` |
| Loading: spinner · placeholder | `Spinner` · `Skeleton` | `@/components/ui/{Spinner,Skeleton}` |
| Avatar (foto/iniziali) | `Avatar` | `@/components/ui/Avatar` |
| Rating a stelle | `Stars` | `@/components/ui/Stars` |
| Bandiera lingua / stack bandiere | `Flag` / `FlagStack` | `@/components/ui/Flag` |

> Import dal **path diretto** del file (il barrel `@/components/ui` espone solo un
> sottoinsieme). Mercato spagnolo/LATAM, tap-target ≥44px.

## Fase desktop (fondazione DS)
Mobile-first **additivo**: il render <lg resta IDENTICO, il desktop è SOLO override `lg:` / branch.
- **Switch** = Tailwind `lg` (1024px). Design canvas Figma 1280px ma il flip è a 1024.
  Lato JS lo stesso switch è `useIsDesktop` (`useMediaQuery`) — usalo SOLO se il DOM mobile/desktop
  differisce in struttura (es. `Popover responsive`: sheet in portal vs dropdown ancorato); altrove `lg:`.
- **Container** = `max-w-[var(--container-site)]` (**1200px**) + gutter `px-4 sm:px-6 lg:px-8` (già nel primitive). Larghezza desktop voluta da Edoardo = quella originale (1200, NON 1440/fluido — provati e scartati come troppo larghi).
- **Popover `responsive`** = sheet <lg, ancorato ≥lg. Mobile byte-identico a `sheet`.
- **Listing desktop** = util `listing-shell` (globals.css): <lg stack invariato, ≥lg grid
  `[var(--listing-sidebar) 1fr]` (sidebar filtri + risultati). Larghezza sidebar tunabile da Figma.
- **Type scale desktop** = token NUOVI in globals.css per gli step Figma fuori scala Tailwind:
  `text-headline` (32px), `text-title` (40px = "titolo sezione"), `text-display` (64px = numeri hero/rating).
  Applica via `lg:` (es. `lg:text-title`) → NIENTE `text-[40px]` arbitrari (ds-guard li blocca). Mobile invariato.
  Il `cx` non fa merge ma `text-xl` + `lg:text-title` non confliggono (breakpoint diversi). End-state: rendere
  `SectionTitle`/`Heading` responsive di default (una fonte) DOPO che i consumer tolgono i loro `lg:` inline.
- **@container**: NON adottato ora (YAGNI). Le card riusate scalano con util `lg:`. Rivalutare solo se
  una card deve rendere sia nella sidebar stretta sia nel main largo nella STESSA viewport.

## Confini
- **Stile/varianti delle primitive + token** = Design System. Una primitiva = una fonte di verità.
- **Motion** (durate/spring/transizioni, `lib/motion/tokens.ts`, reduced-motion) = ruolo `animations`.
- **Comporre** le primitive in pagine/sezioni = ruolo `ui-ux` — ma **consumando** le primitive, non ridefinendole.
