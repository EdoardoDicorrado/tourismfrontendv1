# Area riservata — API contract (storefront)

> **Stato:** v0.5 — **as-built (2026-06-15)**: l'**auth cliente** è stata convertita da *passwordless*
> (email + codice prenotazione) a **registrazione classica email + password con double opt-in**
> (verifica email obbligatoria al primo login). Cambi full-stack consegnati su **entrambi** i repo
> (backend tatanka3 + questo frontend): nuovi `auth/customer/register|login`, verifica email su tabella
> dedicata `email_verification_tokens`, **scope token cliente da `{booking_uuid}` → `{user_id}`**,
> `auth/booking/lookup` **rimosso**, reset password **esteso ai clienti** (anche per attivare gli
> account-shell ADR-0044). Backend **70/70 test verdi**; frontend `tsc`/`lint`/`build` verdi.
> Restano azioni di config/deploy lato backend — vedi **§11** (`STOREFRONT_EMAIL_VERIFY_URL` +
> `STOREFRONT_PASSWORD_RESET_URL` esteso ai clienti). La base v0.3 (verificata contro il codice
> tatanka3 + audit 28-agent) regge; i dettagli sotto sono allineati al codice reale.
> **Scope:** ricostruzione dell'area riservata di tatanka2 sul nuovo frontend Next.js 16. Copre
> **entrambe** le aree: **cliente** (utente finale) e **agenzia** (B2B).
> **Versione:** 0.5 — 2026-06-15. Riferimenti `file:riga` puntano a `../tatanka3/backend`.

> ⚠️ **Nota di lettura:** i blocchi JSON sotto sono una **proposta di forma API** (snake_case,
> nested per leggibilità). Dove un campo mappa una **colonna reale** lo si indica esplicitamente; non
> dare per scontato che la forma JSON rispecchi 1:1 lo schema DB (spesso non lo fa — es. i campi
> bancari sono colonne flat `bank_*`).

---

## 0. Contesto e perché serve

Il nuovo frontend è un **puro client API** (nessun DB, nessun accesso diretto a Postgres). Tutta la
logica dell'area riservata che in tatanka2 viveva dentro `SiteController` (Yii2 monolite) qui deve
diventare **endpoint sul backend tatanka3** (Laravel 13), consumati via pattern BFF (route handler
Next che proxano al backend tenendo i token lato server, httpOnly).

Oggi lo storefront espone **solo catalogo read-only** (`/api/storefront/v1/destinations`,
`/monuments` — `routes/storefront.php`). Mancano **tutti** gli endpoint autenticati dell'area
riservata. Questo documento li specifica e li ancora alle convenzioni e ai modelli **realmente
esistenti** in tatanka3.

### Cosa esiste già (verificato)

| Superficie | Prefisso | Auth | Consumer | Note |
|---|---|---|---|---|
| Storefront catalogo | `/api/storefront/v1/*` | nessuna (`throttle:storefront-read`, 300/min/IP) | questo frontend | read-only, brand-scoped via `?brand=` |
| OCTO partner API | `/octo/*` | **JWT custom HS256** (`OctoJwtService`) per-agency | OTA / reseller | ha `bookings` create/confirm/cancel/update, **ma** è B2B reseller, **non** è l'area riservata |
| Redsys payments | `/api/payments/redsys/*` | firma HMAC + `Idempotency-Key` | checkout 3DS2 InSite | gateway pagamento |

> ⚠️ **Gli endpoint OCTO `bookings` non sono l'area riservata** (auth, semantica e gating diversi —
> vedi §2 e §9.4). Ma — scoperta importante — **scrivono sulla stessa tabella `reservations`**,
> discriminata dalla colonna `origin` (`'web'` | `'octo'` | `'admin'`). Quindi l'area riservata e OCTO
> **condividono il modello dati**, non l'autenticazione.

---

## 1. Convenzioni (allineate a quelle storefront REALI)

Corrette rispetto alla v0.1 dopo lettura del codice. **Tre cose erano sbagliate nella v0.1** e sono
state riallineate: envelope errori, assenza del wrapper `data`, e localizzazione via query param.

- **Base URL:** `/api/storefront/v1` (montato in `bootstrap/app.php:37-41`).
- **Niente wrapper `data`.** `JsonResource::withoutWrapping()` è attivo globalmente
  (`AppServiceProvider`): le liste sono **array nudi**, i dettagli **oggetti nudi**. La v0.1 assumeva
  `{ "data": ... }` — **errato**. Le response sotto sono già senza wrapper.
- **Formato:** JSON, campi `snake_case` in inglese (come `DestinationResource`: `cover_url`,
  `products_count`).
- **Money:** **interi in centesimi** + valuta separata. **Precisazione (era impreciso in v0.2):** le
  colonne `*_cents` (`reservations.total_amount_cents`, `reservation_lines.unit_price_cents`,
  `reservation_unit_items.unit_price_cents/total_amount_cents`) sono reali, **ma la colonna `currency`
  NON sta su `reservations` né su `reservation_lines`**. `currency` (char(3), default `EUR`) vive su
  **`reservation_unit_items`** (`2026_04_27_120003:22`) e `reservation_offers` (`:65`); su
  `payment_transactions`/`invoices` è con CHECK che forza `EUR`. → A livello prenotazione la valuta va
  **derivata dagli unit item** (in pratica sempre `EUR`). Proposta di serializzazione:
  `{ "amount_cents": 12000, "currency": "EUR" }`. **Non** usare float/decimali per i soldi.
- **Localizzazione:** **query param `?lang=it|en|es`** (NON header `Accept-Language` — la v0.1 era
  errata). Whitelist `config/storefront.content_locales = it,en,es`; fallback locale→IT→null
  (`Model::localized()`). Il BFF Next passa `?lang={lang}` dalla route locale-prefixed.
- **Errori (envelope REALE, corretto):**
  ```json
  { "error": { "code": "validation_failed", "message": "...", "details": { "campo": ["..."] } } }
  ```
  Codici già in uso (`bootstrap/app.php` render storefront): `validation_failed` (422),
  `not_found` (404), `rate_limited` (429), `internal_error` (500). I nuovi endpoint auth aggiungono
  codici di dominio (es. `invalid_credentials`, `agency_not_active`) **dentro lo stesso envelope**.
- **Rate limiting:** named limiter già definiti in `AppServiceProvider`:
  `storefront-read` (300/min/IP), `storefront-submit` (**composito 3/min + 30/giorno per IP**, già
  pronto ma non ancora montato su rotte). **Proposta:** usare `storefront-submit` su login/lookup/
  signup/reset, ed eventualmente un `storefront-auth` dedicato.
- **Idempotency (riusabile così com'è):** esiste `App\Models\IdempotencyKey` + middleware
  `OctoIdempotency` **generico** (claim su `(user_id, method, path, Idempotency-Key)`, replay della
  response cached, 409 su reuse con payload diverso). Va montato sulle **write** dell'area riservata
  (signup, PATCH profilo/prenotazione, DELETE line) col solito header `Idempotency-Key`.

### Token & sessione (RISOLTO — niente Sanctum)

**Scoperta:** in tatanka3 **non c'è Sanctum/Passport/JWT-consumer**. L'unica auth a token esistente è
un **JWT custom HS256** per OCTO: `OctoJwtService` (`app/OCTO/Services/OctoJwtService.php`), secret da
`config/octo.jwt_secret` (fallback `APP_KEY`), TTL da `config/octo.jwt_ttl_minutes` (default 60),
claims `sub`/`exp`/`jti`/`agency_id`/`type`. L'admin Filament usa il guard `web` (sessione).

**Decisione presa (era la domanda #1):** **non introdurre Sanctum**. Si **riusa il pattern JWT
custom** già in produzione, con un servizio gemello per lo storefront (es. `StorefrontTokenService`)
che emette JWT HS256 con claims **proposti** (design nostro, non colonne esistenti):

```
sub        → user_id (agenzia)  |  reservation uuid (cliente, che in pratica NON ha un account)
type       → "customer" | "agency"
scope      → { booking_uuid }   (cliente, sessione legata a UNA prenotazione)
             { agency_id }       (agenzia)
exp        → TTL breve cliente (es. 30–60 min) · più lungo/rinnovabile agenzia
jti        → revoca
```

Il **browser non vede mai il token**. Flusso BFF invariato:

```
Browser ──POST /api/auth/agency──► Next route handler (BFF)
                                       │ proxa al backend
                                       ▼
                            POST /api/storefront/v1/auth/agency/login
                                       │ { token, expires_at, ... }
                                       ▼
        Next setta cookie httpOnly ◄───┘   (cookie `tm_account`, vedi nota)
Browser ◄── 200 (nessun token nel body lato browser)
```

Le chiamate successive: il BFF legge il cookie httpOnly e lo gira come `Authorization: Bearer <token>`
(già supportato da `backendFetch({ token })`).

> **Nota cookie:** l'implementazione UI usa già il cookie httpOnly `tm_account`
> (`src/lib/account/session.ts`). Allineare il nome qui (la v0.1 diceva `tm_session`).

---

## 2. Modello di autenticazione (due flussi — confermato dal codice)

> **🔄 Cambio v0.5:** il cliente **ha ora un account `User`** (`type='customer'`) con **password** e
> **verifica email** (double opt-in). Sparisce il login passwordless per codice prenotazione. Il token
> cliente è ora scoped all'**utente** (`scope.user_id`), non più a una singola prenotazione.

| | **Cliente** | **Agenzia** |
|---|---|---|
| Ha un account `User`? | **Sì** — `User` con `type='customer'`, password hashed, `email_verified_at` (double opt-in). Gli ordini web "guest" creano comunque uno **shell account** denormalizzato (ADR-0044); la registrazione **non** lo fa merge (vedi §3.1). | **Sì** — `User` con `type='agency'`, `agency_id` valorizzato |
| Credenziali | **email + password** (`users.password`) | **email + password** (`users.password`) |
| Endpoint login | `POST /auth/customer/login` | `POST /auth/agency/login` |
| Scope token | tutte le prenotazioni dell'utente (`scope.user_id`) | tutte le risorse dell'agenzia (`scope.agency_id`) |
| Gating | `users.status='active'` **e** `email_verified_at` valorizzato (double opt-in) | `users.status='active'` **e** `agency.is_active=true` |
| `role` nel token | `customer` | `agency` |
| Registrazione | `POST /auth/customer/register` + verifica email obbligatoria | `POST /auth/agency/signup` + attivazione admin |

**Prove nel codice (corrette dopo audit):**
- `users.type` è una **colonna `string`** (ex `role`), **senza enum/CHECK a DB**. Valori reali:
  `admin | holding | partner | agency | customer` (`app/Filament/Resources/Users/Schemas/UserForm.php:69-73`),
  default **`customer`** (`UserForm.php:75`, `UserFactory.php:32`). → **Correzione v0.2:** il set NON
  è `customer|agency|staff` (non esiste `staff`), e **`customer` È un tipo di `User` valido**. La
  premessa "i clienti non sono User" era errata a livello di schema. La realtà operativa: gli ordini
  **web** non creano un `User` cliente, ma usano i campi denormalizzati `reservations.customer_*` →
  per questo il login cliente resta passwordless-by-codice. (Altri colonne `users`: `status`,
  `partner_id`, `locale`, `api_enabled` da migration `2026_04_27_102300`; `agency_id` da
  `2026_04_17_000004:12`; `email_verified_at` dalla base `0001_01_01_000000:18`.)
- **Filtro auth OCTO = tre condizioni** (`app/OCTO/Http/Middleware/OctoJwtAuth.php:43-45`):
  `where('type','agency')->where('status','active')->where('api_enabled',true)`. → **Correzione v0.2:**
  la v0.2 ne citava solo due (mancava `status='active'`).
- `agencies.is_active` (default `true`) = flag attivazione manuale via admin Filament. → **Correzione
  v0.2:** sta in `2026_06_05_000001_restore_agency_b2b_anagrafica.php:16` (**non** in
  `2026_04_17_000004:16` — il numero di riga coincideva per caso). La maggior parte delle colonne
  agency di §5 vive in questa migration del 2026-06-05.

> **Decisione di prodotto (v0.5 — cambiata):** il login cliente passa da **passwordless** (email +
> codice prenotazione) a **registrazione classica email + password con double opt-in**. Motivo: un
> account utente vero permette di vedere **tutte** le proprie prenotazioni (non una sola), è il modello
> atteso dagli utenti e abilita il riuso (login ricorrente, recupero password). Il gating "prenotazione
> confermata" non si applica più: l'accesso è gated da **`email_verified_at` valorizzato** + `status`.
>
> **Stato pagamento — invariato come informazione:** lo stato di pagamento resta derivato da
> `Reservation::paymentStatusKey()` (`app/Models/Reservation.php:254-264`): valori **minuscoli**
> `paid|partial|open|overpaid`, calcolati da **`balance_cents` *e* `amount_paid_cents`**
> (`balance_cents` = colonna **generated stored** = `total_amount_cents - amount_paid_cents`). Si
> **mostra** nel dettaglio prenotazione ma non gate-a nulla.
>
> **Gating agenzia — nota di sicurezza:** l'auth OCTO controlla `type='agency'` + `status='active'` +
> `api_enabled=true`, ma **non** controlla `agency.is_active`. Per il **portale** area riservata il
> gate corretto è `user.type='agency'` **+** `user.status='active'` **+** `agency.is_active=true`.
> `api_enabled` è un flag **diverso**, specifico per l'accesso all'API OCTO (§7), e **non** deve
> gate-are il login al portale.

---

## 3. Endpoint — AUTENTICAZIONE

### 3.1 Cliente — registrazione (double opt-in)

```
POST /api/storefront/v1/auth/customer/register     (Idempotency-Key)
```

**Request**
```json
{
  "first_name": "Mario", "last_name": "Rossi",
  "email": "mario@example.com",
  "password": "Str0ngPass", "password_confirm": "Str0ngPass",
  "policy_check": true, "locale": "it"
}
```

Crea `User(type='customer', status='pending_verification', registration_source='storefront',
email_verified_at=null, password hashed)`, normalizza l'email a `Str::lower`, genera un token di
verifica in `email_verification_tokens` e invia l'email di verifica. **Nessun token in risposta**
(double opt-in: prima si verifica, poi si fa login).

**Response 201**
```json
{ "status": "pending_verification" }
```

**Errori** (envelope `{ error: { code, message, details? } }`)
- `422` `validation_failed` — campi mancanti/deboli, `password`≠`password_confirm`, `policy_check`
  falso, **o email già presente** (anche un account-shell ADR-0044). L'email è **unica**: niente
  merge/claim automatico → il frontend invita a usare **"Password dimenticata"** (§3.5) per attivare
  l'account esistente.

> **🔒 Account separato (ADR-0044):** se l'email esiste già — incluso uno shell account creato da una
> prenotazione "guest" — la registrazione risponde **422** e **non** fa merge. L'unico modo per
> "prendere possesso" di uno shell account è il **reset password** (§3.5), che per un cliente non
> verificato setta anche `email_verified_at=now()` + `status='active'`.

### 3.1bis Cliente — login con password

```
POST /api/storefront/v1/auth/customer/login
```

**Request**
```json
{ "email": "mario@example.com", "password": "Str0ngPass" }
```

**Response 200** (envelope senza `data`)
```json
{
  "token": "<jwt>",
  "token_type": "Bearer",
  "expires_at": "2026-06-15T18:00:00Z",
  "role": "customer",
  "scope": { "user_id": "8a21…" },
  "customer": { "first_name": "Mario", "last_name": "Rossi", "email": "mario@example.com" }
}
```

**Errori** (ordine: credenziali → sospensione → verifica)
- `401` `invalid_credentials` — email inesistente / password errata (`Hash::check`).
- `403` `account_suspended` — `users.status='suspended'`.
- `403` `email_unverified` — `email_verified_at===null`. Il frontend mostra una CTA "reinvia email di
  verifica" (§3.6).

### 3.1ter Cliente — verifica email

```
GET /api/storefront/v1/auth/email/verify/{token}     → 200 | 400
```

Risolve il token in `email_verification_tokens` (lookup per `sha256(token)`, entro
`email_verification_ttl_minutes`, default 1440), setta `email_verified_at=now()` + `status='active'`.
**Idempotente:** il token **non** viene consumato → un secondo click restituisce comunque `200`
(`already_verified`). Token assente/scaduto → `400 invalid_verification_token`.

### 3.2 Agenzia — login con password

```
POST /api/storefront/v1/auth/agency/login
```

**Request** `{ "email": "...", "password": "..." }`

**Response 200** — stesso shape di 3.1 con `role: "agency"`, `scope: { "agency_id": "…" }`,
oggetto `agency` invece di `customer`.

**Errori**
- `401` `invalid_credentials`
- `403` `agency_not_active` — `user.status!='active'` **o** `agency.is_active=false` (non ancora
  abilitata dall'admin).

### 3.3 Logout / revoca token

```
POST /api/storefront/v1/auth/logout      (Bearer)  →  204
```
Revoca il token corrente (`jti` in blacklist o invalidazione). Il BFF cancella il cookie `tm_account`.

### 3.4 Agenzia — registrazione

```
POST /api/storefront/v1/auth/agency/signup
```
Crea `agency` (`is_active=false`) **+** `user` (`type='agency'`, `status='active'`,
`agency_id` collegato) in transazione, invia email a utente + admin, attende attivazione manuale.

**Request** — campi allineati alle colonne reali `agencies` + `agency_billing_details` + `users`:
```json
{
  "agency": {
    "legal_name": "Viajes Roma SL",
    "display_name": "Viajes Roma",
    "code": null,
    "address_street": "Calle ...", "address_street_number": "10",
    "postal_code": "28001", "city": "Madrid",
    "country_alpha2": "ES", "municipality_code": null,
    "email": "info@viajesroma.es",
    "phone_prefix": "+34", "phone": "600000000",
    "website": "https://...", "facebook_url": null, "tripadvisor_url": null,
    "collaboration_reason": "Operiamo tour a Roma per clienti spagnoli…",
    "billing": {
      "vat_id": "B12345678", "tax_code": null,
      "identity_document_type": null, "identity_document_number": null,
      "identity_document_country_alpha2": "ES"
    }
  },
  "user": {
    "name": "Ana García",
    "email": "ana@viajesroma.es", "email_confirm": "ana@viajesroma.es",
    "password": "Str0ngPass", "password_confirm": "Str0ngPass",
    "locale": "es",
    "policy_check": true
  }
}
```
> Differenze chiave vs tatanka2: paese = `country_alpha2` (char 2), **non** `country_id`; nome
> ragione sociale = `legal_name`/`display_name`; `code` agenzia di solito lo assegna l'admin (può
> essere null al signup). `vat_id`/`tax_code`/documenti vivono in `agency_billing_details`.

**Response** `201` `{ "status": "pending_activation" }`.

**Validazione email async** (come l'AJAX di tatanka2): endpoint leggero
`POST /auth/agency/signup/validate-email` → `{ "available": true|false }`.

### 3.5 Reset password (agenzie **e** clienti)

```
POST /api/storefront/v1/auth/password/forgot   { "email": "..." }   → 200 sempre (anti-enumeration)
POST /api/storefront/v1/auth/password/reset     { "token": "...", "password": "...", "password_confirm": "..." } → 200 | 400
```
> **🔄 v0.5 — esteso ai clienti.** `forgotPassword`/`resetPassword` ora selezionano
> `whereIn('type', ['agency','customer'])` (prima solo `agency`); `forgot` sceglie la notification per
> tipo (cliente → `StorefrontCustomerResetPasswordNotification`). **Perché è obbligatorio per i
> clienti:** con email unica e "account separato" (§3.1), chi ha già prenotato come guest (shell
> account ADR-0044) **non può registrarsi** (422 email in uso) → il reset password è l'**unico** modo
> per attivare quell'account. Quando il cliente era **non verificato**, il callback di reset setta
> anche `email_verified_at=now()` + `status='active'` (ha dimostrato il possesso della casella).
> **⚠️ Azione di config (§11):** `STOREFRONT_PASSWORD_RESET_URL` deve instradare per `users.type`
> (cliente → `/{lang}/area/recupera-password`, agenzia → `/{lang}/agenzie/recupera-password`).

### 3.6 Verifica email (ATTIVA — double opt-in)

```
POST /api/storefront/v1/auth/email/resend       { "email": "..." }   → 200 sempre (anti-enumeration)
GET  /api/storefront/v1/auth/email/verify/{token}                    → 200 | 400
```
> **🔄 v0.5 — ATTIVA.** La verifica email è ora **obbligatoria** (double opt-in) per i clienti, vedi
> §3.1ter. Non usa `MustVerifyEmail` né il password broker: ha una **tabella dedicata**
> `email_verification_tokens` (`token_hash` PK = `sha256(token)`, `user_id`, `created_at`; TTL
> `email_verification_ttl_minutes`, default 1440) servita da `EmailVerificationTokenService`
> (`generate`/`resolve`/`clearFor`). `resend` è **sempre 200** (anti-enumeration): rigenera e reinvia
> solo se esiste un cliente non verificato con quell'email. La notification è
> `StorefrontCustomerVerifyEmailNotification` (link a `config('storefront.email_verification_url')` +
> `?token=`). **⚠️ Azione di config (§11):** `STOREFRONT_EMAIL_VERIFY_URL` →
> `/{lang}/area/verifica-email`.

---

## 4. Endpoint — PRENOTAZIONI (cliente **e** agenzia)

Stesso set, scoping diverso dal token: cliente → **tutte** le sue prenotazioni
(`reservations.user_id = scope.user_id`); agenzia → tutte quelle con
`reservations.agency_id = scope.agency_id` (qualsiasi `origin`).

> **🔄 v0.5:** il ramo customer di `scopedReservationQuery()`
> (`AccountBookingController`) filtra ora `where('user_id', context.user.id)` (prima
> `where('uuid', reservation.uuid)` — una sola prenotazione). **Dipendenza nota:** la lista resta
> **vuota** finché il checkout (oggi stub, `src/app/api/checkout/route.ts`) non valorizza
> `reservations.user_id` legando l'ordine all'utente loggato. Non bloccante per l'auth.

**Modello dati reale (verificato):**
`Reservation` → `ReservationLine` → `ReservationUnitItem` (per tariffa/`option_unit`) →
`ReservationParticipant` (per passeggero). I partecipanti pendono dall'**unit item**
(`ReservationParticipant.belongsTo(ReservationUnitItem)`, FK `reservation_unit_item_id`), **non** dalla
line. Una `ReservationLine` `belongsTo` uno `Slot` (`slot_id`): è un riferimento, **non** un vincolo
di unicità (più line possono puntare allo stesso slot). Più `ReservationHotelDetail` (0/1 per
prenotazione) e `ReservationOffer` (0/1, codice sconto applicato). `Reservation.agency_id` = chi ha
venduto; dati cliente in `customer_name/email/phone`.

**Stati (stringhe, nessun enum/CHECK a DB):**
- `reservations.state` = `pending | on_hold | confirmed | cancelled | expired | redeemed`
  (`expired`/`redeemed` usati in `ReservationService.php:428`; `on_hold` per gli hold OCTO).
- `reservation_lines.state` / `reservation_unit_items.state` = `active | cancelled`.
- `reservation_participants.state` ha default `active`, **ma nessun code path scrive mai `cancelled`**
  sul partecipante (la cancellazione tocca solo line + unit_items). → Un flusso di cancellazione del
  **singolo passeggero** oggi non esiste; da confermare se serve.
- **Nessun soft-delete** (`deleted_at`) su lines/items: la cancellazione è `state='cancelled'`
  (+ `reservations.cancelled_at`).

**Date / timezone:** la partenza vive su `ReservationLine.slot_id → Slot.starts_at/ends_at`, storage
**UTC**. Lo snapshot `reservation_lines.slot_local_start_snapshot` (nome **fuorviante**) congela lo
`starts_at` **in UTC** al momento del confirm (`ReservationService.php:1118`), e viene poi **reso** in
`config('app.display_timezone')` = **Europe/Rome** solo in fase di display — non è memorizzato in ora
locale.

### 4.1 Lista

```
GET /api/storefront/v1/account/bookings?tab=all|current|travelled|cancelled&q=<codice>&page=<n>
```
(Bearer). `tab`: `current` = slot futuro & non cancellata; `travelled` = slot passato & non cancellata;
`cancelled` = `state='cancelled'`. (`current/travelled` confrontano `Slot.starts_at` con `now()`.)

**Response 200** (array + meta di paginazione — vedi nota)
```json
{
  "items": [
    {
      "uuid": "9f3a…",
      "code": "TM-AB12CD",
      "state": "confirmed",
      "origin": "web",
      "created_at": "2026-05-01T10:00:00Z",
      "total": { "amount_cents": 12000, "currency": "EUR" },
      "amount_paid": { "amount_cents": 12000, "currency": "EUR" },
      "balance": { "amount_cents": 0, "currency": "EUR" },
      "payment_status": "paid",
      "customer": { "first_name": "Mario", "last_name": "Rossi", "email": "..." },
      "lines": [
        {
          "id": "rl_1",
          "product_name": "Colosseo Skip-the-Line",
          "slot_start": "2026-07-10T09:30:00+02:00",
          "participant_count": 3,
          "state": "active",
          "unit_items": [
            { "id": "ui_1", "unit_label": "Adult", "quantity": 2, "unit_price": { "amount_cents": 4000, "currency": "EUR" } },
            { "id": "ui_2", "unit_label": "Child", "quantity": 1, "unit_price": { "amount_cents": 4000, "currency": "EUR" } }
          ]
        }
      ]
    }
  ],
  "meta": { "current_page": 1, "per_page": 10, "total": 12, "last_page": 2, "tab": "all" }
}
```
> `payment_status` ∈ `paid|partial|open|overpaid` (minuscolo, vedi §2). `currency` per item viene da
> `reservation_unit_items.currency`; a livello `total/amount_paid/balance` non c'è colonna currency →
> si propaga quella degli item (EUR).
>
> **Paginazione — nota:** lo storefront **oggi non pagina** (ritorna collezioni intere via `->get()`).
> Lo shape `meta` qui è **nuovo** e va standardizzato col backend (proposto: `paginate()` Laravel con
> `items` + `meta`). Stesso shape `meta` anche in §6 (era incoerente nella v0.1).

### 4.2 Dettaglio

```
GET /api/storefront/v1/account/bookings/{uuid}      (Bearer)
```
Prenotazione completa con campi modificabili: partecipanti per unit item, dettagli hotel,
pickup/dropoff. `404`/`403` se fuori scope token.

### 4.3 Modifica (cliente: solo se non ancora "travelled")

```
PATCH /api/storefront/v1/account/bookings/{uuid}    (Bearer, Idempotency-Key)
```
Aggiorna passeggeri e dettagli hotel/pickup. Il backend invia email di modifica (vedi §11 — **da
costruire**).

**Campi reali editabili:**
- **Partecipanti** (`reservation_participants`): `first_name`, `last_name`, `email`, `phone_prefix`,
  `phone`, `birth_date` (il tipo adulto/bambino è **derivato** dalla data di nascita, non è colonna),
  `passport`, `identity_document`, `nationality`.
- **Hotel** (`reservation_hotel_details`, 0/1 per prenotazione): `hotel_name`, `hotel_street_address`,
  `hotel_street_number`, `hotel_city`, `hotel_postal_code`, `booking_name_at_hotel`, `room_number`,
  `front_desk_phone`, `front_desk_language`, `latitude`, `longitude`.
- **Pickup/Dropoff** (campi su `reservations`): `pickup_requested`, `pickup_location_id`,
  `pickup_notes`; idem `dropoff_*`.

**Request (estratto)**
```json
{
  "participants": [
    { "id": "rp_1", "first_name": "Mario", "last_name": "Rossi", "birth_date": "1985-04-12" }
  ],
  "hotel": { "hotel_name": "Hotel Roma", "hotel_city": "Roma", "booking_name_at_hotel": "Rossi", "room_number": "214" },
  "pickup": { "pickup_requested": true, "pickup_location_id": "pl_3", "pickup_notes": "Reception 08:45" }
}
```
**Regole:** `403`/`404` se fuori scope o prenotazione già `travelled`/`cancelled`. Supportare
`?validate_only=1` → solo errori `422` senza salvare (come l'`ActiveForm::validate` AJAX di tatanka2).

### 4.4 Cancellazione di una singola riga/orario

```
DELETE /api/storefront/v1/account/bookings/{uuid}/lines/{lineId}   (Bearer, Idempotency-Key)
```
Imposta `reservation_lines.state='cancelled'` (+ propagazione su unit items, ricalcolo importi),
email di cancellazione (**da costruire**, §11), log cronologia. Solo entro lo scope del token.

> Nota nomenclatura: in tatanka2 era "prn_orario" → qui l'unità cancellabile è la **`ReservationLine`**
> (legata a uno `slot`). Endpoint nominato `/lines/{lineId}` invece di `/items/{itemId}` per aderire
> al modello reale.

### 4.5 Voucher PDF

```
GET /api/storefront/v1/account/bookings/{uuid}/voucher.pdf      (Bearer)
```
**Il PDF lo genera il backend** — confermato: esiste già `app/Vouchers/ReservationVoucherPdf.php`
(Spatie LaravelPdf), filename `voucher-{bookingCode}.pdf` → es. `voucher-TM-XXXXXXXX.pdf` (`:152-154`).
Il frontend non genera PDF: il BFF fa solo da **proxy/stream**; basta lo scope del Bearer.

> **🔴 Correzione importante v0.2 (sbagliava l'integrazione check-in):** il **QR del voucher NON
> codifica `tatanka3:{uuid}`**. Il QR codifica l'**URL di check-in firmato**
> `https://check-in.tourismotion.com/v?t={token}` (`:92`, renderizzato a `:114`). La stringa
> `tatanka3:{uuid}` è soltanto l'**alt-text** del QR (`:115`, `qrAlt`), **mai** il payload scansionato.
> Il `{token}` è un **JWT HS256** firmato con `config('app.voucher_jwt_secret')` (`:168-174`), payload
> `{ "rid": reservation.uuid, "rline": line.id, "exp": <ends_at+7g>, "iss": "tatanka3", "ver": 1 }` —
> quindi **non** è solo `rid={uuid}` come scriveva la v0.2. Chi costruisce lo scanner/proxy deve
> aspettarsi l'URL di check-in, non l'URN `tatanka3:`.

---

## 5. Endpoint — AGENZIA: profilo & pagamento

> Solo `role = agency`. Colonne reali in `agencies` + `agency_billing_details` (gran parte introdotte
> dalla migration `2026_06_05_000001_restore_agency_b2b_anagrafica.php`). I blocchi JSON sotto sono la
> **forma API proposta**; i nomi colonna reali sono annotati dove divergono.

### 5.1 Profilo (dati utente + agenzia)

```
GET   /api/storefront/v1/agency/profile     (Bearer)
PATCH /api/storefront/v1/agency/profile     (Bearer, Idempotency-Key)
```

**Response 200**
```json
{
  "user": { "name": "Ana García", "email": "ana@viajesroma.es", "phone": "...", "locale": "es" },
  "agency": {
    "id": "…", "code": "VIA123",
    "legal_name": "Viajes Roma SL", "display_name": "Viajes Roma",
    "address_street": "...", "address_street_number": "...", "postal_code": "...",
    "city": "...", "country_alpha2": "ES", "municipality_code": null,
    "phone_prefix": "+34", "phone": "...", "fax": null, "email": "...",
    "website": "...", "facebook_url": "...", "twitter_url": "...", "tripadvisor_url": "...",
    "description": "...", "collaboration_reason": "...",
    "commission_percent": 8.00,          // read-only (lo gestisce l'admin)
    "network_commission_percent": 0.00,  // read-only
    "is_active": true,                    // read-only
    "api_enabled": true                   // read-only — accesso API OCTO (vedi §7)
  }
}
```
> **Correzione v0.1:** non esiste `discount_percentage`. Esiste **`commission_percent`** (commissione
> commerciale dell'agenzia), semantica diversa, **read-only** lato agenzia. `is_active`, `api_enabled`,
> `commission_percent`, `network_commission_percent` sono tutti gestiti dall'admin.

### 5.2 Dati di pagamento / fatturazione

```
GET   /api/storefront/v1/agency/payment    (Bearer)
PATCH /api/storefront/v1/agency/payment    (Bearer, Idempotency-Key)
```
Tabella `agency_billing_details` (1:1 con agency). **Forma API proposta** (nested per leggibilità):
```json
{
  "vat_id": "...", "tax_code": "...",
  "identity_document_type": "...", "identity_document_number": "•••• (masked)",
  "identity_document_country_alpha2": "ES",
  "paypal_email": "...", "paypal_country_alpha2": "ES",
  "bank_transfer": {
    "beneficiary": "...", "iban": "•••• (masked)", "account_number": "...",
    "bank_name": "...", "swift": "...", "aba": "...",
    "address": "...", "city": "...", "country_alpha2": "...", "intermediary": "..."
  },
  "guarantees": {
    "bank_transfer_guarantee": { "amount_cents": 0, "threshold_percent": 0 },
    "check_guarantee":        { "amount_cents": 0, "threshold_percent": 0 }
  },
  "deposit": { "amount_cents": 0, "paid": false }   // read-only
}
```
> **Colonne reali (flat, prefisso `bank_`)** — `2026_06_05_000001:44-68`: `vat_id`, `tax_code`,
> `bank_beneficiary`, `bank_iban`, `bank_iban_fingerprint`, `bank_account_number`, `bank_name`,
> `bank_swift`, `bank_aba`, `bank_address`, `bank_city`, `bank_intermediary`, `bank_country_alpha2`,
> `paypal_email`, `paypal_email_fingerprint`, `paypal_country_alpha2`,
> `bank_transfer_guarantee_amount_cents`, `bank_transfer_guarantee_threshold_percent`,
> `check_guarantee_amount_cents`, `check_guarantee_threshold_percent`, `deposit_amount_cents`,
> `deposit_paid`. → **Non** esistono `iban`/`beneficiary`/`country_alpha2` "nudi": il nesting JSON
> sopra è solo presentazione, mappa a queste colonne `bank_*`.
> **Sicurezza:** i campi bancari/documento sono **`encrypted` cast** nel model `AgencyBillingDetail`,
> con colonne `*_fingerprint` (SHA, per lookup senza decrypt) su IBAN/PayPal. **Proposta API:** in
> `GET` valori **mascherati** (es. ultime 4 cifre IBAN); in `PATCH` valori in chiaro **write-only**
> (campo vuoto/assente = non modificare).

### 5.3 Cambio password

```
POST /api/storefront/v1/agency/password    (Bearer)
{ "current_password": "...", "new_password": "...", "new_password_confirm": "..." }
```
`200` ok · `422` current errata / mismatch. (Usa `Hash::check` sul `users.password`.)

---

## 6. Endpoint — AGENZIA: codici sconto (offerte)

> Solo `role = agency`. **Correzione architetturale importante vs tatanka2.**

**Scoperta:** in tatanka3 i codici sconto **non appartengono all'agenzia**, ma al **Partner**. Modello:
`Offer` (regole di sconto) ↔ `OfferCode` (codici campagna, N per offerta) ↔ pivot `offer_product_scope`
(prodotti applicabili; vuoto = tutti i prodotti del partner) ↔ `ReservationOffer` (applicazione/uso).

> **Caveat (audit):** la query "offerte dell'agenzia = `WHERE offers.partner_id = agency.partner_id`"
> è una **derivazione plausibile ma NON implementata** in tatanka3. Le chiavi `partner_id` esistono su
> entrambi, ma l'unico codice che lega offerta e partner è l'**eligibility a livello prodotto**
> (`OfferApplicationService.php:248-251`: confronta `product.partner_id` con `offer.partner_id`), non
> il `partner_id` dell'agenzia. Da concordare col backend come filtrare "le offerte visibili a questa
> agenzia" (per partner? per prodotti venduti? per brand?).

Mapping campi reali:

| Proposto (v0.1) | Reale (tatanka3) |
|---|---|
| `percentage` | `offers.discount_value` (se `discount_type='PERCENT'`; per `FIXED` serve `currency`) |
| `valid_from` / `valid_to` | `offers.valid_from` / `offers.valid_until` |
| `quantity_initial/used/left` | per codice: `offer_codes.max_uses` / `used_count` / derivato; globale: `offers.max_uses_total` / `used_count` |
| `block_agency_discount` | `!offers.combinable_with_agency_discount` (logica inversa; **default `true`** = cumulabile) |
| `is_valid_now` | `Offer::scopeUsable()` (status active + finestra date + usi residui) |

> `offers.currency` è **nullable** (richiesta solo per `discount_type='FIXED'` via CHECK; per
> `PERCENT` è `null`).

### 6.1 Lista offerte/codici del partner dell'agenzia

```
GET /api/storefront/v1/agency/discount-codes?code=&name=&page=    (Bearer)
```
**Response 200**
```json
{
  "items": [
    {
      "offer_id": "of_1",
      "code": "VERANO20",
      "internal_name": "Promo estate",
      "discount_type": "PERCENT",
      "discount_value": 20,
      "currency": null,
      "valid_from": "2026-06-01T00:00:00Z", "valid_until": "2026-09-30T23:59:59Z",
      "max_uses": 100, "used_count": 37, "remaining": 63,
      "combinable_with_agency_discount": true,
      "is_valid_now": true,
      "status": "active"
    }
  ],
  "meta": { "current_page": 1, "per_page": 10, "total": 5, "last_page": 1 }
}
```

### 6.2 Utilizzo di un codice

```
GET /api/storefront/v1/agency/discount-codes/{offerCodeId}/usage?page=     (Bearer)
```
Prenotazioni che hanno applicato il codice — fonte `reservation_offers`
(`WHERE offer_code_id = ?`, snapshot `snapshot_*`, `customer_email_hash`, `applied_at_state`
`HOLD|CONFIRMED`). `403` se l'offerta non è visibile all'agenzia (vedi caveat sopra).

### 6.3 Prodotti a cui si applica il codice

```
GET /api/storefront/v1/agency/discount-codes/{offerId}/products?page=  (Bearer)
```
Da pivot `offer_product_scope`. **Whitelist vuota = tutti i prodotti del partner/brand** (semantica
reale di `OfferApplicationService`): in tal caso il backend espande/etichetta "tutti i prodotti".

### 6.4 "Default code" (affiliate) — **lato frontend, non API**

Resta **stato client** (cookie/localStorage, coerente con `checkout-cart-architecture`), non un
endpoint dedicato. L'unica esigenza API è validare che il codice esista/sia valido (riusa 6.1 + la
logica di applicazione al cart in fase di checkout).

---

## 7. Endpoint — AGENZIA: accesso API (= OCTO)

> **Domanda #9 RISOLTA.** L'"API agenzia" di tatanka2 (`abilitato_api` su `Utente`) **è** l'attuale
> **OCTO partner API** di tatanka3. La prova: l'auth OCTO filtra `type='agency'` + `status='active'` +
> `api_enabled=true` (`OctoJwtAuth.php:43-45`); tatanka2 filtrava su `Utente->abilitato_api`. Il flag
> è migrato da agenzia → `users.api_enabled`.

```
GET /api/storefront/v1/agency/api-access     (Bearer, solo se user.api_enabled=true)
```
Pagina credenziali/documentazione: mostra come ottenere/rinnovare il **JWT OCTO** (`OctoJwtService`,
TTL `config/octo.jwt_ttl_minutes`) e linka la doc OCTO. Non è una nuova API: è il **pannello** verso
l'API OCTO già esistente. Se `api_enabled=false`, la voce di menu non compare (come tatanka2).

---

## 8. Mappa riassuntiva tatanka2 → contratto (aggiornata)

| tatanka2 `SiteController` | Endpoint | Area | Note backend |
|---|---|---|---|
| `actionUserLogin` | `POST /auth/customer/login` | cliente | **v0.5**: email+password (era `booking/lookup`, rimosso); gate `email_verified_at` |
| _(nuovo)_ | `POST /auth/customer/register` | cliente | **v0.5**: double opt-in; email unica → 422 (no merge shell) |
| _(nuovo)_ | `GET /auth/email/verify/{token}` · `POST /auth/email/resend` | cliente | **v0.5**: tabella `email_verification_tokens`, idempotente |
| `actionAgencyLogin` | `POST /auth/agency/login` | agenzia | gate `type+status` + `agency.is_active` |
| `actionLogout` | `POST /auth/logout` | both | revoca `jti` |
| `actionTravelAgencyInItaly` | `POST /auth/agency/signup` (+ validate-email) | agenzia | crea agency+user |
| `actionRequestPasswordReset` | `POST /auth/password/forgot` | **agenzia + cliente** | **v0.5**: esteso ai clienti (attiva shell account) |
| `actionResetPassword` | `POST /auth/password/reset` | **agenzia + cliente** | **v0.5**: reset cliente non verificato setta `email_verified_at` |
| `actionBookings` | `GET /account/bookings` | both | nuovo (paginazione nuova) |
| `actionBookingsUpdate` | `GET`/`PATCH /account/bookings/{uuid}` | both | participants/hotel/pickup |
| `actionDeletePrnOrario` | `DELETE /account/bookings/{uuid}/lines/{lineId}` | both | `state='cancelled'`, no hard delete |
| `actionVoucherPdf` | `GET /account/bookings/{uuid}/voucher.pdf` | both | **già esiste** (QR = URL check-in, §4.5) |
| `actionProfile` | `GET`/`PATCH /agency/profile` | agenzia | `commission_percent` read-only |
| `actionProfilePayment` | `GET`/`PATCH /agency/payment` | agenzia | colonne `bank_*` **cifrate** |
| `actionProfileUpdatePassword` | `POST /agency/password` | agenzia | |
| `actionDiscountCodesList` | `GET /agency/discount-codes` | agenzia | offerte del **partner** (filtro da definire) |
| `actionDiscountCodeUsage` | `GET /agency/discount-codes/{offerCodeId}/usage` | agenzia | da `reservation_offers` |
| `actionDiscountCodeProducts` | `GET /agency/discount-codes/{offerId}/products` | agenzia | pivot `offer_product_scope` |
| `actionApi` | `GET /agency/api-access` | agenzia | = **OCTO API** |

---

## 9. Domande aperte v0.1 → RISPOSTE (dal codice)

1. **Tipo di token / auth guard** → **niente Sanctum/Passport**. Riusare il **JWT custom HS256**
   esistente (`OctoJwtService`) con un servizio gemello storefront e claims `type`/`scope`. TTL breve
   cliente, più lungo agenzia. Revoca via `jti`. (§1)
2. **Scope token cliente** → ~~una sola prenotazione (`scope.booking_uuid`)~~ **superato in v0.5**: ora
   **`{user_id}`** — il cliente ha un account e vede **tutte** le sue prenotazioni. (§2)
3. **Schema dati** → mappato sui modelli reali tatanka3. Differenze chiave: `country_alpha2` (non
   `country_id`), `commission_percent` (non `discount_percentage`), soldi in `*_cents` con `currency`
   solo su unit_items/offers/payments, colonne billing flat `bank_*` cifrate.
4. **Bookings vs OCTO** → **stessa tabella `reservations`**, discriminata da `origin`
   (`web|octo|admin`). Auth diversa (OCTO = JWT per-agency); logica core di `ReservationService`
   parzialmente riusabile, ma l'orchestrazione OCTO (hold lifecycle, idempotency, unitItem
   replacement) è OCTO-specifica.
5. **Voucher PDF** → **lo genera il backend** (`ReservationVoucherPdf`); il QR è un **URL di check-in
   firmato** (JWT con `rid`+`rline`), non `tatanka3:{uuid}`. Frontend = solo proxy/stream. (§4.5)
6. **Email transazionali** → infrastruttura job-based esiste (`SendReservationNotification` +
   `ReservationConfirmedMail` con voucher allegato), **ma** mancano le email di
   modifica/cancellazione/reset/signup → **da costruire** (§11).
7. **reCAPTCHA / anti-abuse** → **nessun captcha** oggi; solo rate limiter. Proposta: montare
   `throttle:storefront-submit` (3/min + 30/giorno) su login/lookup/signup/reset; captcha opzionale
   lato BFF in fase 2. (§1, §11)
8. **Attivazione agenzia** → **manuale** via admin Filament, flag `agencies.is_active`
   (default `true`, `2026_06_05_000001:16`). (§2)
9. **"API agenzia"** → **sì, è l'attuale OCTO partner API**, gate `users.api_enabled`. (§7)

---

## 10. Lato frontend (UI COLLEGATA ALL'API REALE — as-built 2026-06-09)

L'area riservata è **scaffoldata e ora collegata alla tranche 1 dell'API storefront** (auth +
account + agency). Route App Router locale-prefixed:

```
/[lang]/area/accedi                 → login cliente (email + password)         ← v0.5
/[lang]/area/registrati             → registrazione cliente (double opt-in)     ← v0.5
/[lang]/area/verifica-email         → verifica email (?token=) / reinvio        ← v0.5
/[lang]/area/recupera-password      → forgot/reset cliente (?token=)            ← v0.5
/[lang]/area/prenotazioni[/[id]]    → lista (tutte le sue) + dettaglio/modifica/voucher
/[lang]/agenzie/accedi · registrati · recupera-password
/[lang]/agenzie/prenotazioni[/[id]] → lista (scope agency)
/[lang]/agenzie/codici-sconto[/[id]/{utilizzo,prodotti}]
/[lang]/agenzie/profilo[/{pagamento,password}]

app/api/auth/*                      → BFF (settano cookie httpOnly `tm_account`)
  └ auth/customer/{login,register,verify-email,resend-verification}             ← v0.5
app/api/account/*  ·  app/api/agency/*   → proxy autenticati al backend
```

> **🔄 v0.5 — cut auth cliente.** Rimossi: `BookingLookupForm` + BFF `app/api/auth/booking/`.
> Aggiunti: `CustomerLoginForm`/`CustomerSignupForm`/`CustomerSignupView`/`CustomerVerifyEmail` e i 4
> BFF customer. Il seam `client.ts` espone `customerLogin`/`customerRegister`/`customerVerifyEmail`/
> `customerResendVerification` (al posto di `bookingLookup`). Lo scope di sessione customer è
> `{ user_id }`; i 5 consumer di `scope.booking_uuid` (pagina dettaglio + 3 BFF booking) **non**
> verificano più l'ownership lato FE — la fa il backend filtrando per `user_id`. Per il React Compiler,
> la verifica email avviene su **click di un bottone**, non in un `useEffect` (no setState-in-effect).

**Seam unico = `src/lib/account/client.ts`**: ogni metodo ora chiama **`backendFetch` verso
`/api/storefront/v1`** (non più mock), tenendo il bearer token lato server. Ogni funzione riceve il
`token` (letto dal cookie httpOnly `tm_account` da `src/lib/account/session.ts`); le 6 write guardate
(signup pubblico + PATCH booking + DELETE line + PATCH profilo + PATCH payment + POST password)
inviano un header `Idempotency-Key: crypto.randomUUID()`, richiesto dal middleware
`StorefrontIdempotency`. I tipi in `src/lib/account/types.ts` rispecchiano i Resource reali 1:1
(no wrapper `data`; liste `{ items, meta }`; money in centesimi; reservation con DUE assi di stato
`state` + `payment_status`; bookings `lines[] → unit_items[] → participants[]`; hotel/pickup/dropoff
**uno** per reservation, solo nel dettaglio). Convenzioni di errore della seam: read "legittimamente
assenti" (404 / 403 fuori-scope) → `null`; bad-credentials/validation su write → `null`/`false`;
tutto il resto (5xx, rete) propaga come `BackendError`.

---

## 11. Stato backend (tranche 1 CONSEGNATA — as-built 2026-06-09)

I gap 1–6 dell'audit sono **risolti** dalla tranche 1 dell'API storefront; il frontend è collegato.
Restano alcune **azioni di config/deploy** e le rifiniture.

✅ **Risolti (tranche 1):**

1. ✅ **Auth guard/token consumer** — JWT storefront **separato da OCTO** (secret distinto,
   `aud=storefront`; OCTO ora richiede `aud=octo`), risolve scope `customer|agency`. Gate agenzia
   `status=active` + `agency.is_active`. **v0.5:** scope cliente = **`{user_id}`**
   (`issueCustomerByUserToken`); il middleware risolve `User type='customer'` da `scope.user_id`/`sub`,
   `suspended`→403.
2. ✅ **Auth cliente email + password (v0.5)** — `auth/customer/register` (double opt-in, 422 su email
   esistente, Idempotency-Key) + `auth/customer/login` (gate `email_verified_at`). `auth/booking/lookup`
   e la colonna/lookup `booking_reference` **non sono più usati** dall'area riservata (il login per
   codice è stato rimosso).
3. ✅ **Password reset agenzie + clienti (v0.5)** — broker collegato con notification custom storefront
   per tipo; esteso ai clienti (attiva gli shell account, setta `email_verified_at` se non verificato).
   ⚠️ **vedi azione di config sotto** (URL del link di reset, ora anche per i clienti).
4. ✅ **Email transazionali** — reset password agency + signup + **verifica email cliente (v0.5,
   `StorefrontCustomerVerifyEmailNotification`)** + reset cliente; gli eventi di audit per
   `line_cancelled` sono emessi.
5. ✅ **Endpoint area riservata** — §3–§7 esistono sotto `/api/storefront/v1` (auth + account +
   agency), con Idempotency sulle write account/agency e sul signup pubblico.
6. ✅ **Paginazione** — shape `{ items, meta }` applicato a bookings + discount-codes.

🟡 **Azioni di config/deploy aperte (NON codice frontend):**

- 🔴 **`STOREFRONT_EMAIL_VERIFY_URL` (v0.5, NUOVA)** — il link nell'email di verifica cliente DEVE
  puntare alla route **frontend** `/{lang}/area/verifica-email?token={token}`. Config:
  `config('storefront.email_verification_url')` ←`env('STOREFRONT_EMAIL_VERIFY_URL')`. In locale →
  `http://localhost:3001/it/area/verifica-email`; in prod il base URL pubblico del frontend. **Da
  impostare (locale + prod).**
- 🔴 **`STOREFRONT_PASSWORD_RESET_URL`** — il link nell'email di reset DEVE puntare alla route
  **frontend**; **v0.5: ora copre anche i clienti** → instradare per `users.type` (cliente →
  `/{lang}/area/recupera-password?token={token}&email={email}`, agenzia →
  `/{lang}/agenzie/recupera-password?…`). Il default di config è `APP_URL/auth/password/reset` → punta
  al **backend** ed è errato. **Fatto in locale (2026-06-09, agenzia):** `.env` dev →
  `http://localhost:3001/it/agenzie/recupera-password`. **Resta:** aggiungere il branch cliente e
  impostare in prod.
- ⚠️ **Deploy OCTO** — con `aud=octo` ora obbligatorio, gli eventuali token OCTO già emessi vanno
  **rigenerati**.
- 🟡 **Validazione hotel su `PATCH /account/bookings/{uuid}`** *(trovato in integration test
  2026-06-09)*: il backend NON valida le colonne NOT NULL di `reservation_hotel_details`
  (`hotel_name`, `hotel_city`, `booking_name_at_hotel` — migration `2026_05_28_000002:14-19`) e un
  patch `hotel` parziale o vuoto esplode in **500 `internal_error`** (constraint violation Postgres,
  `ConvertEmptyStringsToNull` trasforma `""`→`NULL`) invece di **422 `validation_failed`**.
  **Mitigato lato frontend:** il form omette l'oggetto `hotel` quando la sezione è tutta vuota e il
  BFF rifiuta con `400 hotel_incomplete` un hotel parziale senza i 3 campi obbligatori. La
  validazione va comunque aggiunta lato backend (qualsiasi altro client la salta).

🔵 **Rifiniture (fase 2):**

7. ✅ **Verifica email** — **fatta in v0.5** (double opt-in obbligatorio per i clienti, tabella
   `email_verification_tokens`). Resta opzionale il **captcha** (oggi solo rate limiter
   `throttle:storefront-submit` su register/login/reset).
8. **`product_slug` sulla line** — il serializer della booking line non espone lo slug prodotto, quindi
   niente deep-link al prodotto dal dettaglio prenotazione (gap tranche 2). (§4)
9. **Checkout → `reservations.user_id`** — il checkout (stub) deve legare l'ordine all'utente loggato
   perché la lista prenotazioni cliente si popoli (vedi §4). Dipendenza backend tranche successiva.

---

## Appendice — Changelog verifiche

- **v0.1** — proposta iniziale (assunzioni, non verificata).
- **v0.2** — verificata contro tatanka3 (6 agenti di esplorazione); chiuse le 9 domande aperte.
- **v0.5** — **auth cliente: da passwordless a registrazione classica (2026-06-15).** Cut full-stack
  su entrambi i repo. **Backend:** nuovi `auth/customer/register` (double opt-in, 422 su email
  esistente — no merge shell ADR-0044, Idempotency-Key) e `auth/customer/login` (gate
  `email_verified_at`); verifica email su tabella dedicata `email_verification_tokens` +
  `EmailVerificationTokenService` + `GET auth/email/verify/{token}` (idempotente) + `auth/email/resend`
  (anti-enum); **scope token cliente `{booking_uuid}`→`{user_id}`** (`issueCustomerByUserToken`,
  middleware risolve `User`, `AccountBookingController` filtra `user_id`); `auth/booking/lookup`
  **rimosso**; reset password **esteso ai clienti** (`whereIn type agency,customer`; attiva shell
  account settando `email_verified_at`+`status`); `StorefrontIdempotency` namespacing customer →
  `customer:{user_id}`. **70/70 test verdi.** **Frontend:** sessione customer scope `{user_id}`; seam
  `customerLogin/Register/VerifyEmail/ResendVerification` (–`bookingLookup`); 4 BFF `auth/customer/*`;
  pagine `area/{accedi,registrati,verifica-email,recupera-password}`; componenti
  `CustomerLoginForm/SignupForm/SignupView/VerifyEmail` (–`BookingLookupForm`); rimosso il check FE di
  ownership su `scope.booking_uuid` nei 5 consumer; i18n it/en/es (`customerLogin` ridisegnato +
  blocchi `customerSignup`/`verifyEmail`); `tsc`/`lint`/`build` verdi. **Azioni di config aperte
  (§11):** `STOREFRONT_EMAIL_VERIFY_URL` (nuova) + `STOREFRONT_PASSWORD_RESET_URL` esteso ai clienti.
- **v0.4** — **as-built** (2026-06-09): tranche 1 dell'API storefront consegnata (auth + account +
  agency) e **frontend collegato**. `src/lib/account/types.ts` riscritto sui Resource reali
  (`{ items, meta }`; money in centesimi; reservation con assi `state`+`payment_status`; bookings
  `lines→unit_items→participants`; hotel/pickup/dropoff uno per reservation); seam
  `src/lib/account/client.ts` ora chiama `backendFetch` con `Idempotency-Key` sulle write; BFF, pagine,
  componenti e dizionari (it/en/es) riallineati; `tsc`/`lint`/`build` verdi. §10/§11 aggiornati.
  **Azione aperta:** env backend `STOREFRONT_PASSWORD_RESET_URL` → route frontend (§11). Deploy: token
  OCTO da rigenerare (`aud=octo` obbligatorio).
- **v0.3** — corretta dopo audit indipendente (28 agenti). Fix **🔴 errori**: (1) QR voucher = URL di
  check-in firmato, non `tatanka3:{uuid}`; (2) `users.type` = `admin|holding|partner|agency|customer`
  (no `staff`); (3) `customer` è un `users.type` valido (i clienti web però non hanno account in
  pratica). Fix **🟡 imprecisioni**: posizione colonna `currency`; terza condizione `status='active'`
  in `OctoJwtAuth`; attribuzioni migration (`agency_id`, `email_verified_at`, `agencies.is_active` →
  `2026_06_05_000001`); colonne billing flat `bank_*`; grafo participants (FK su unit_item);
  `line→slot` non univoco; stati `expired|redeemed`, `origin=admin`, `participants.cancelled` mai
  scritto; `paymentStatusKey()` minuscolo + legge `amount_paid_cents`; `slot_local_start_snapshot` è
  UTC; filename voucher; `reseller_reference` non indicizzato; offerte-per-agenzia derivazione non
  implementata; `combinable` default `true`, `currency` nullable; password broker presente-ma-scollegato.
