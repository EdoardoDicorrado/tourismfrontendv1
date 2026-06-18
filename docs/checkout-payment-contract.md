# Contratto checkout & pagamento (frontend ⇄ backend)

Il frontend è collegato end-to-end (ordine → promo → pagamento Redsys InSite + 3DS2)
e il backend **espone tutti** gli endpoint storefront sotto (landed 2026-06-17).
`CHECKOUT_PAYMENT_PROVIDER=redsys` è **attivo in produzione** (2026-06-17): il flusso
ordine+pagamento è reale (niente più anteprima/mock sul dominio live).
Il pagamento è gated da `CHECKOUT_PAYMENT_PROVIDER` (server-only): `none` (default) =
anteprima/ordine mock (niente addebito), `redsys` = InSite reale. Il promo degrada da
solo a "non disponibile" finché l'endpoint non risponde — non viene **mai** applicato uno
sconto lato client (offer integrity).

- Swap point lato frontend: `src/lib/checkout/server.ts` (`createOrder`, `quotePromo`,
  `startPaymentSession`, `authorizeRedsys`) + i route handler `src/app/api/checkout/**`.
- Tipi condivisi: `src/lib/checkout/types.ts`.
- Componente carta (browser): `src/components/checkout/RedsysInSiteForm.tsx`.
- Validazione sandbox / SDK: vedi `redsys-insite-sandbox-runbook.md`.

Tutti i path sono **definitivi** e montati sotto `/api/storefront/v1` (brand-scoped via
`?brand=`, error envelope `{ error: { code, message } }`, `Accept-Language` per la lingua).
Se il backend cambia un path, aggiornare le 4 costanti in `server.ts`.

## Flusso

```
[scelta data + slot]                → GET  /api/availability/{slug}     → slot reali (slotId, prezzi)
[contatti + partecipanti + fattura] → POST /api/checkout                → { reference }
[codice promo, opzionale]           → POST /api/checkout/promo          → quote sconto (server)
                                    → POST /api/checkout/payment/session → provider none|redsys
   provider=none  → ordine mock confermato (niente addebito)             ← anteprima attuale
   provider=redsys→ monta form InSite → idOper
                  → POST /api/checkout/payment/authorize                → authorized|challenge|failed
```

## Endpoint che il backend deve esporre

Auth: **guest checkout** (contatto inline) oppure JWT storefront (`Authorization: Bearer`)
se loggato — **customer** (B2C) o **agenzia** (B2B: il backend applica prezzi/commissione
agenzia dallo stesso token). Stesso flusso e stessi endpoint per tutti e tre. Tutti i write
sotto richiedono `Idempotency-Key`.

> ⚠️ **Gate preview.** `createOrder` (passo 1) scrive sul backend SOLO quando
> `CHECKOUT_PAYMENT_PROVIDER=redsys`. Col default (`none`) il frontend resta in
> anteprima: reference mock, **zero scritture** sul backend (nessun hold). Flippare
> l'env rende reale l'intero flusso (ordine + pagamento insieme).

### 0. Disponibilità reale — `GET /api/storefront/v1/products/{slug}/availability`
READ, brand-scoped (`?brand=`), per il calendario + gli slot del booking widget.
Frontend seam: `src/lib/api/availability.ts` → BFF `GET /api/availability/{slug}`.
Due forme sullo stesso endpoint (degradano a `null` finché non è live → il widget
usa gli slot placeholder):

- `?variant={variantId}&month=YYYY-MM` → giorni prenotabili del mese (calendario,
  niente default su giorni sold-out). Risposta `["2026-06-12", …]` (o `{ "days": [ … ] }`).
- `?variant={variantId}&date=YYYY-MM-DD` → slot del giorno:

```json
[ { "slotId": "01J…", "time": "10:00", "available": 18, "soldOut": false,
    "prices": { "adult": 64.00, "child": 40.00 }, "currency": "EUR" } ]
```

`prices` in **euro** (cents/100); le chiavi sono il `reference` della tariffa (le
stesse di `product.participants[].key`). Lo `slotId` è ciò che il carrello porta
nell'ordine (passo 1) e che il backend usa per derivare prezzo/capacità autorevoli.

### 1. Creazione ordine — `POST /api/storefront/v1/checkout/orders`
Single writer → `ReservationService::createOctoHold` / `createConfirmedReservation`.
Body:

```json
{
  "items": [ { "slotId": "01J…", "units": [ { "reference": "adult", "quantity": 2 }, { "reference": "child", "quantity": 1 } ] } ],
  "customer": { "firstName": "…", "lastName": "…", "email": "…", "phone": "…", "country": "IT", "notes": "" },
  "participants": [ { "itemId": "…", "label": "Adulto 1", "firstName": "…", "lastName": "…" } ],
  "invoice": { "name": "…", "taxId": "…", "address": "…", "city": "…", "zip": "…", "country": "IT" },
  "promo_code": "ESTATE10"
}
```

`participants`, `invoice`, `promo_code` sono opzionali. `promo_code` va **ri-validato e
applicato server-side** qui (offer integrity: lock TOCTOU + limiti per-utente) — il quote
del passo 2 è solo indicativo. Risposta: `{ "reference": "…" }` (la reservation del cliente).

### 2. Quote codice promo — `POST /api/storefront/v1/checkout/promo`
Validazione/quote **non vincolante** del codice sul carrello (dry-run di
`OfferApplicationService`, nessun binding). Body
`{ "code": "ESTATE10", "items": [ { "slotId": "01J…", "units": [ … ] } ] }` (stessa
forma `items` dell'ordine).
Risposta (adattata in `quotePromo`); `discount` in **euro** (cents/100, stessa scala di
`priceFrom`/`prices` dello storefront — il carrello è in unità display, non centesimi):

```json
{ "code": "ESTATE10", "discount": 15.00, "label": "Sconto estate -10%" }
```

| esito backend | UI frontend |
|---|---|
| `200` con `discount > 0` | riga sconto nel riepilogo + totale ricalcolato (dal server) |
| `422` (codice non valido/non applicabile) | messaggio "codice non valido" |
| `404`/assente | messaggio "non ancora disponibile" (stato attuale) |

Lo sconto mostrato viene **sempre** dal server; il binding autorevole è al passo 1.

### 3. Apertura sessione InSite — `POST /api/storefront/v1/checkout/redsys/session`
Esegue `PaymentInitiationService::start(Reservation, Partner, idempotencyKey)`. Body
`{ "reference": "…" }`. Risposta (snake_case, adattata in `adaptSession`):

```json
{
  "transaction_id": "01J…",
  "merchant_order": "1234ABCD1234",
  "merchant_code": "154217244",
  "terminal": "100",
  "amount_cents": 150,
  "currency": "978",
  "signature_version": "HMAC_SHA256_V1",
  "sdk_url": "https://sis-t.redsys.es:25443/sis/NC/sandbox/redsysV3.js",
  "idioma": "IT"
}
```

`idioma` è opzionale: se assente il frontend lo deriva dalla lingua (it→IT, es→ES, en→EN).
L'`amount_cents` autorevole lo ri-deriva il backend dalla reservation (incluso lo sconto
promo già applicato al passo 1).

### 4. Autorizzazione — `POST /api/storefront/v1/checkout/redsys/authorize`
Esegue `AuthorizationService::authorize(PaymentTransaction, sdkParams, idempotencyKey)`. Body
`{ "transaction_id": "…", "sdkParams": { "idOper": "…", "browser": { /* EMV3DS */ } } }`.
Risposta:

| status | campi aggiuntivi | UI frontend |
|---|---|---|
| `authorized` | — | → pagina di conferma |
| `challenge` | `acsURL`, `creq`, `protocol_version?` | monta l'ACS in iframe, poi polla §5 |
| `failed` | `code` (es. `"0190"`) | errore + retry sul form carta |

### 5. Esito post-challenge — `GET /api/storefront/v1/checkout/redsys/status`
READ, brand-scoped. Body query `?transaction_id=…`. Risposta:

```json
{ "status": "authorized", "state": "captured", "reference": "TM-…" }
```

`status` ∈ `authorized` (captured/authorized) | `failed` | `pending` (challenge in corso).
Dopo aver montato l'ACS (`status=challenge`), il frontend polla questo endpoint finché lo
stato lascia `pending`, poi instrada a conferma (`authorized`) o errore (`failed`). Il
completamento del challenge (POST `cres` dall'ACS) avviene server-side sulla leg condivisa
`/payments/redsys/3ds-callback`: il `notificationURL` è già impostato dal backend e correla
la charge per `three_ds_server_trans_id` — nessuna azione frontend sul callback, solo il poll.

## Aperti / fuori scope di questa predisposizione

- **3DS2 challenge**: completato. La leg di callback backend `/payments/redsys/3ds-callback`
  esiste ed è flow-agnostic (chiude la charge correlando per `three_ds_server_trans_id`); il
  frontend monta l'ACS in iframe e risolve l'esito via il poll di §5. Non serve un endpoint
  `/3ds-callback` frontend né altra azione sul return leg.
- **Whitelist dominio InSite**: il form carta resta bianco finché Redsys non autorizza il
  dominio (staging/prod) al framing (vedi gotcha nel runbook). Azione lato account merchant.
- La card PAN non transita mai dai nostri server: viaggia solo l'`idOper` mono-uso (PCI SAQ-A).

## Stato Beads

Tutto il contratto è **landed** (backend + frontend), `CHECKOUT_PAYMENT_PROVIDER=redsys`
è **attivo in produzione** e il flusso è stato **verificato end-to-end** su staging al
2026-06-17: availability reale → ordine (`TM-…`) → sessione Redsys InSite con importo
ri-derivato server-side dallo slot (offer integrity). Catena prenotabile seminata su
`colosseo-tour-notturno` (3 varianti it/en/es, slot giornalieri con prezzi).

Resta **una sola** cosa, **esterna al codice**: la whitelist del dominio InSite
(`frontend.tourismotion.stiamolavorando.net`) lato account merchant Redsys — la sessione
apre regolarmente ma l'iframe carta hosted ha bisogno del dominio autorizzato per il
framing (senza, il form carta resta bianco). Vedi `bd tatanka3-9rai`.

- `tatanka3-c78o` — **frontend** wiring (fatto): swap point reali, `slotId` nel
  carrello, BFF availability, token customer inoltrato.
- `tatanka3-70wv` — backend (fatto): `GET /products/{slug}/availability` (passo 0).
- `tatanka3-blcc` — backend (fatto): `POST /checkout/orders` (passo 1), prezzi server-side
  + `promo_code` applicato server-side (addebito netto dello sconto).
- `tatanka3-ux3d` — backend (fatto): `POST /checkout/promo` quote (passo 2).
- `tatanka3-2ol5` — backend (fatto): `POST /checkout/redsys/session|authorize` (passi 3-4).
- `tatanka3-z8yw` — backend (fatto): `GET /checkout/redsys/status` (passo 5) + riuso della
  leg 3DS2 `/payments/redsys/3ds-callback` esistente.
- `tatanka3-fyk4` — backend (aperto, fuori scope): il capture Redsys non aggiorna ancora
  `reservation.payment_status`/`amount_paid_cents` (gap pre-esistente, condiviso con il
  flusso operatore). Il frontend usa lo `status` della **transazione** (§5), non quello
  della reservation, quindi non è bloccante per il checkout.
