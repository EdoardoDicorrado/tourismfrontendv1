# Runbook — test flusso pagamento Redsys InSite (sandbox)

Scopo: validare **dal vivo** le credenziali Redsys sandbox e — soprattutto — l'unica
incognita aperta, l'abbinamento **merchant ↔ `signature_version`** (`HMAC_SHA512_V2`
di default vs `HMAC_SHA256_V1` "fully verified").

## Cosa valida / cosa NO

- ✅ Valida: gateway config sandbox, generazione `idOper` col JS SDK V3, le due chiamate
  REST 3DS2 (`iniciaPeticionREST` + `trataPeticionREST`) e la **verifica firma** della
  risposta → cioè `signature_version`.
- ❌ NON tocca la storefront pubblica: l'API storefront non ha ancora prezzi/availability/
  ordini, e `/api/checkout` del frontend è uno stub. Gli endpoint `/api/payments/redsys/*`
  sono la superficie **backoffice** (sessione operatore, `actingAs` nei test) — un browser
  non può autenticarvisi (gruppo route `api` stateless, niente Sanctum). Per questo qui
  `start`/`authorize` si invocano **via tinker** chiamando i service direttamente: zero
  auth/CSRF/CORS, deterministico.

⚠️ Lo **Step 5 (`authorize`) è una chiamata reale al gateway sandbox**. È il test vero del
flusso, ed è esattamente ciò a cui serve il sandbox — ma sii consapevole che parte una
richiesta verso Redsys (diverso dalla probe `iniciaPeticion` a freddo che avevamo escluso).

Tutti i comandi tinker girano nel backend:

```bash
cd ../tatanka3/backend
php artisan tinker
```

---

## Step 1 · Gateway config sandbox (admin Filament)

In `/admin` → **Redsys Gateway Configs** → crea (o edita) la config del Partner:

| Campo | Valore |
|---|---|
| `environment` | `sandbox` |
| `sandbox_merchant_code` | `154217244` |
| `sandbox_terminal` | `100` |
| `sandbox_secret_key` (campo "chiave"/secret) | `sq7HjrUOBfKmC576ILgskD5srU870gJ7` |
| `sandbox_currency` | `978` |
| `is_enabled` | ✅ true |

Verifica in tinker che sia risolvibile e completa:

```php
$cfg = App\Models\RedsysGatewayConfig::where('is_enabled', true)->firstOrFail();
[$cfg->environment, $cfg->merchantCode(), $cfg->terminal(), filled($cfg->secretKey())];
// => ["sandbox", "154217244", "100", true]
$partner = $cfg->partner;            // Partner proprietario del merchant
```

## Step 2 · Una reservation "fattibile" (importo piccolo)

Serve un `reservation_id` reale con `total_amount_cents > 0`. La factory mette di default
nome/email **faker random** (un record così "sa di generato"): sovrascrivili con dati
plausibili.

```php
$reservation = App\Models\Reservation::factory()->create([
    'customer_name'      => 'Alin Sfirschi',
    'customer_email'     => 'alin.sfirschi@gmail.com',
    'origin'             => 'web',
    'reseller_reference' => null,
    'total_amount_cents' => 150,   // 1,50 €
]);
$reservation->id;
```

(oppure crea/usa una reservation dall'admin con gli stessi dati e `total_amount_cents` > 0).

## Step 3 · `start` → config InSite

```php
$cfg ??= App\Models\RedsysGatewayConfig::where('is_enabled', true)->firstOrFail();
$partner ??= $cfg->partner;

$insite = app(App\Payments\Redsys\PaymentInitiationService::class)
    ->start($reservation, $partner, 'sbx-start-1');   // idempotency key

$insite;
// [
//   'transaction_id' => '01J…',          ← serve allo Step 5
//   'merchant_order' => '1234ABCD1234',  ← va nel campo "order" della pagina
//   'merchant_code'  => '154217244',     ← "fuc"
//   'terminal'       => '100',
//   'amount_cents'   => 150,
//   'signature_version' => 'HMAC_SHA512_V2',
//   'sdk_url' => 'https://sis-t.redsys.es:25443/sis/NC/sandbox/redsysV3.js',
//   'currency' => '978',
// ]
```

Annota `transaction_id`, `merchant_order`, `merchant_code`, `terminal`.

## Step 4 · Genera l'idOper nel browser

1. Servi la pagina scratch via http (NON `file://`) — dal repo frontend:
   ```bash
   cd docs && python3 -m http.server 8088
   ```
2. Apri, prefillando i campi con l'output di `start`:
   ```
   http://localhost:8088/redsys-insite-sandbox-test.html?fuc=154217244&terminal=100&order=1234ABCD1234
   ```
3. **Monta form carta** → inserisci la carta test sandbox:
   - numero `4548 8120 4940 0004` · scad. `12/34` (qualsiasi futura) · CVV `123`
4. Premi il bottone di pagamento dentro l'iframe → la pagina mostra l'**idOper**. Copialo.

> Se compare un `errorCode` invece dell'idOper: di solito il dominio della pagina non è
> whitelisted sul comercio sandbox, oppure `fuc`/`order` non combaciano con `start`.

> ⚠️ **GOTCHA verificato (2026-06-11) — iframe bianco / CSP `frame-ancestors`**
> Se l'iframe carta resta **bianco vuoto** e in console c'è
> `Framing 'https://sis-t.redsys.es:25443/' violates CSP directive "frame-ancestors 'none'"`,
> la causa NON è il nostro codice (params dell'iframe verificati corretti). Redsys risponde
> da `/sis/getInputNC` con `Content-Security-Policy: frame-ancestors ;` **vuoto** → il comercio
> FUC non ha **alcun dominio autorizzato al framing InSite**. È comportamento **documentato**
> (Redsys InSite doc + community): pannello admin → menu **Comercio** → **"Datos de
> configuración"** → **"Dominios inSite permitidos"**. Di default la lista è vuota e **NON è
> self-service**: si deve **richiedere a Redsys** di aggiungere i domini (li inseriscono loro
> manualmente). Da chiedere: `http://localhost` (di default solo localhost **porta 80** è
> abilitato → non vale `:8088`), `http://127.0.0.1`, e il dominio frontend staging/prod.
>
> Lo conferma una probe diretta:
> `curl -sS -D - -o /dev/null "https://sis-t.redsys.es:25443/sis/getInputNC?frame=inSite&fuc=<hex>&terminal=<hex>&order=<hex>&version=V3"`
> → se `frame-ancestors` è vuoto, il merchant non è pronto per InSite. È un'azione per chi
> amministra l'account merchant sandbox (Federico/Stefano), non un bug nostro.

## Step 5 · `authorize` → momento della verità (firma)

Nello stesso `php artisan tinker`:

```php
$charge = App\Models\PaymentTransaction::where('merchant_order', $insite['merchant_order'])->firstOrFail();

$result = app(App\Payments\Redsys\AuthorizationService::class)->authorize(
    $charge,
    ['idOper' => 'INCOLLA_IDOPER_QUI'],
    'sbx-auth-1'   // nuova idempotency key per ogni tentativo fresco
);

$result;
```

### Interpretazione

| Esito | Significato |
|---|---|
| `['status' => 'authorized', …]` | firma OK + auth frictionless. ✅ credenziali e `signature_version` confermate. |
| `['status' => 'challenge', 'acsURL'=>…, 'creq'=>…]` | firma OK, gateway instrada al 3DS challenge (atteso con la carta `4548…`). ✅ **conferma comunque credenziali + signature_version** (il completamento challenge è la leg `/3ds-callback`, fuori scope qui). |
| `['status' => 'failed', 'code' => '0190' …]` | firma OK, carta rifiutata (es. CVV alterato). ✅ la firma ha funzionato. |
| `DomainException: REDSYS_SIGNATURE_INVALID` | la firma della **risposta** non verifica → quasi certamente **signature_version sbagliata** → vai sotto. |

### Se la firma è sbagliata → flip `signature_version`

Nel `.env` del backend, poi `php artisan config:clear` e ripeti dallo Step 3 (nuove
idempotency key):

```env
# default attuale:
REDSYS_SIGNATURE_VERSION=HMAC_SHA512_V2
# alternative da provare in ordine:
# REDSYS_SIGNATURE_VERSION=HMAC_SHA512_V1     # stesso HMAC, label diversa (manuale vs portale)
# REDSYS_SIGNATURE_VERSION=HMAC_SHA256_V1     # ramo "fully verified" (3DES + Base64); coerente con la chiave sq7Hj… storica
```

La chiave `sq7Hj…` è storicamente la chiave SHA-256/3DES degli esempi sandbox: se `_V2`
dà `REDSYS_SIGNATURE_INVALID`, `HMAC_SHA256_V1` è il candidato più probabile.

---

## Pulizia

```php
$charge->delete();
$reservation->delete();
```

I due artefatti (`redsys-insite-sandbox-test.html`, questo runbook) vivono in `frontend/docs/`
e sono throwaway: non vanno né nel `public/` del frontend né in produzione.
