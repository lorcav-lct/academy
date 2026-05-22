# Modifiche FSALAFIA — Tracking Batch

Storico delle modifiche organizzate in **batch atomici** per consentire rollback rapido.
Ogni batch è auto-contenuto: applicabile e ripristinabile indipendentemente dagli altri.

## Convenzioni

- **Stato**: 🟡 in sviluppo · 🟠 testato · 🟢 in produzione · 🔴 rolled back
- Ogni batch elenca: obiettivo, file toccati, modifiche DB/Stripe, procedura di test, procedura di rollback
- Branch di lavoro consigliato: `feat/<descrizione>` derivato da `staging`
- Ogni batch va deployato seguendo il workflow staging-first definito in `MEMORY.md`

---

## Batch 001 — Acquisto standalone certificazione FIPE

**Data**: 2026-05-22
**Stato**: 🟡 in sviluppo (code complete, in attesa di test + commit)
**Obiettivo**: Permettere l'acquisto standalone della certificazione FIPE a €790 dalla pagina `/percorso/fipe-personal-trainer`, prima del blocco "Calendario sintetico". Acquisto via Stripe Checkout, ticket QR generato come per gli altri prodotti.

### Decisioni prese

- Tipo prodotto: `certification` + `hidden: true` (acquistabile solo via URL diretto, escluso da listing pubbliche, sitemap, switcher pack)
- `priceCents: 79000` · price Stripe LIVE: `price_1TZSugCE95vjZKhk8EFfwjBM` (prod_UYa42xkOewm7z7)
- Price TEST: **vuoto** — l'acquisto **non funziona in Sandbox/staging** (scelta esplicita utente)
- `max_entries: 6` (3 weekend × 2 giorni)
- Disclaimer "incluso nei pack PRO ed Elite" mostrato sulla nuova sezione, con link a `/pack`

### File modificati

| File                                              | Modifica                                                                                                                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/constants/packs.ts`                      | Aggiunto entry `fipe-personal-trainer` (hidden, type `certification`, priceCents 79000)                                                                  |
| `src/app/percorso/fipe-personal-trainer/page.tsx` | Aggiunta sezione "Acquista la certificazione" tra "PROGRAM" e "QUICK OVERVIEW"; sfondo `Calendario sintetico` cambiato a `#f7f5f1` per alternanza visiva |
| `src/app/checkout/checkout-content.tsx`           | Eyebrow "Certificazione" per `pack.type === "certification"`; back-link → `/percorso/fipe-personal-trainer`; nascosto link "Modifica" per certifications |
| `src/lib/stripe/checkout.ts`                      | Aggiunto param opzionale `cancelPath` (default `/pack`)                                                                                                  |
| `src/app/api/checkout/session/route.ts`           | Passa `cancelPath: "/percorso/fipe-personal-trainer"` quando `packId === "fipe-personal-trainer"`                                                        |

### File creati

| File                                               | Scopo                                                                         |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `supabase/migrations/024_add_fipe_access_rule.sql` | INSERT in `product_access_rules` per slug `fipe-personal-trainer`, 6 ingressi |

### Modifiche esterne necessarie (manuali, fuori repo)

| Sistema        | Azione                                                                                           | Stato      |
| -------------- | ------------------------------------------------------------------------------------------------ | ---------- |
| Supabase prod  | Eseguire migration `024_add_fipe_access_rule.sql` (via `npx supabase db push` oppure SQL Editor) | ⏳ da fare |
| Stripe live    | Già fatto dall'utente: product `prod_UYa42xkOewm7z7`, price `price_1TZSugCE95vjZKhk8EFfwjBM`     | ✅ ok      |
| Stripe webhook | Nessuna azione (già processa qualunque slug)                                                     | ✅ ok      |
| Make.com       | Nessuna azione (slug nuovo arriva come `packName` nel payload, ok se scenario è generico)        | ✅ ok      |

### Procedura di test

**Opzione consigliata: smoke test in produzione con coupon 100% off**

1. Stripe Dashboard (live) → Coupons → crea coupon `SMOKE_FIPE` 100% off, max redemptions: 1
2. `/admin/promos` → crea promo legata al coupon, scope `fipe-personal-trainer`, attiva
3. Sessione utente di test su `academy.lacertosus.com` → `/percorso/fipe-personal-trainer` → "Acquista ora" → checkout → applica coupon → paga €0
4. Verificare:
   - [ ] Ordine in `/admin/orders` (status `paid`, badge live)
   - [ ] Ticket in `/account/tickets` (QR generato, label "Personal Elite Trainer FIPE")
   - [ ] Email di conferma ricevuta
   - [ ] `/admin/scanner` legge il QR, registra check-in, decrementa da 6 → 5 ingressi
5. **Disattivare la promo** e revocare il coupon su Stripe

**Alternative**:

- Test UI-only locale: `npm run dev` + apertura pagina (no checkout reale)
- Test fino al confine Stripe su staging: il click su "Acquista" mostrerà l'errore atteso "Prodotto non disponibile per l'acquisto in questa modalità"

### Rollback

#### Rollback code (Vercel)

```bash
git revert <COMMIT_HASH_BATCH_001>
git push origin main
```

Vercel rideploya automaticamente la versione precedente.

#### Rollback DB

La migration è additiva e idempotente (`ON CONFLICT DO NOTHING`). Per rimuovere manualmente:

```sql
DELETE FROM public.product_access_rules
WHERE product_slug = 'fipe-personal-trainer';
```

#### Rollback Stripe

Nessuno: product/price su Stripe restano. Per disabilitare l'acquisto basta:

- Disattivare il price su Stripe Dashboard, oppure
- Mettere `stripePriceId.live: ""` in `packs.ts` (rendering pagina rimane, acquisto bloccato lato server con errore "non disponibile")

#### Rollback parziale — solo "spegnere" la sezione di acquisto

Se serve nascondere il blocco senza revert completo: commenta/rimuovi la `<section>` "Acquista la certificazione" in `src/app/percorso/fipe-personal-trainer/page.tsx`. Il prodotto rimane in `packs.ts` ma non c'è entrypoint utente.

### Commit di riferimento

- _da compilare al momento del commit_

---

## Template per batch futuri

```markdown
## Batch NNN — Titolo

**Data**: YYYY-MM-DD
**Stato**: 🟡 in sviluppo
**Obiettivo**: ...

### Decisioni prese

- ...

### File modificati

| File | Modifica |
| ---- | -------- |

### File creati

| File | Scopo |
| ---- | ----- |

### Modifiche esterne necessarie

| Sistema | Azione | Stato |
| ------- | ------ | ----- |

### Procedura di test

1. ...

### Rollback

...

### Commit di riferimento

- _hash_
```
