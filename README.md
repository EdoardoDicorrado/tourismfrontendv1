# TourisMotion — Frontend (storefront)

Storefront **Next.js 16** (App Router) + React 19 + Tailwind 4 della piattaforma di
booking TourisMotion (mercato LATAM/spagnolo). Puro client dell'API backend (BFF in
`src/app/api`), nessun DB locale. Vedi `CLAUDE.md` per l'architettura.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # BACKEND_API_URL (server-only)
pnpm dev                     # http://localhost:3000
```

## Design System (leggi PRIMA di costruire UI)

- **Anteprima viva di ogni primitiva** con varianti/size/stati: rotta **`/<lang>/ds`** (es. `/it/ds`).
- **Indice "mi serve X → usa Y"**: `src/components/ui/CATALOG.md`. Riusa le primitive in
  `src/components/ui/*` (Button, IconButton, Badge, Input/Field, Card, Popover, Modal, Tabs,
  Disclosure, Toast…), **non** ridefinire stili inline.
- **Token** (colori/raggi/ombre/z/motion) = `src/app/globals.css`. Manca una variante?
  Chiedila al ruolo `design-system` (`agency task <chat-id> design-system "…"`), non forkare lo stile.

## Quality gates (anche in CI)

```bash
pnpm lint        # eslint (Next + jsx-a11y)
pnpm typecheck   # tsc --noEmit
pnpm ds:check    # design-system guard — blocca NUOVE divergenze (baseline grandfathered)
pnpm test        # smoke node:assert su lib (ordering/slots)
```

Il `ds:check` usa un **baseline** (`scripts/ds-guard.baseline.json`): fallisce solo su
divergenze nuove. Dopo aver migrato del backlog, restringi il baseline con
`pnpm ds:check:update-baseline`.
