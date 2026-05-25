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
**Stato**: 🟢 in produzione — smoke test live completato con successo
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

- `21463ae` — feat(fipe): add standalone FIPE certification purchase flow
- `6a5eb60` — docs(fipe): mark Batch 001 as deployed and verified in production
- Branch: `staging` → merge fast-forward in `main`
- Deploy: Vercel (staging + production)
- DB: migration 024 eseguita manualmente via SQL Editor in Supabase prod (2026-05-22)

---

## Batch 002 — Rinomina "Personal Elite Trainer FIPE" → "Personal Trainer FIPE"

**Data**: 2026-05-22
**Stato**: 🟢 in produzione — code deployato + label DB aggiornato
**Obiettivo**: Rimuovere la parola "Elite" da tutti i riferimenti alla certificazione FIPE nel sito (la cert si chiama ufficialmente "Personal Trainer FIPE"). Toccare solo testi correlati a FIPE, nient'altro.

### Decisioni prese

- Rinomina `"Personal Elite Trainer FIPE"` → `"Personal Trainer FIPE"` (full match) ovunque nel sito
- Varianti minori uniformate:
  - `"FIPE Personal Elite Trainer"` → `"FIPE Personal Trainer"` (keywords/FAQ)
  - `"FIPE Elite"` (abbreviato) → `"FIPE"`
  - `"Personal Elite Trainer"` (senza FIPE, in `certifications.ts` title) → `"Personal Trainer"`
  - `"elite firmato FIPE"` → `"di livello firmato FIPE"`
  - `"Specializzazione elite [...]"` → `"Specializzazione avanzata [...]"`
  - `"competenze elite nello Strength"` → `"competenze avanzate nello Strength"`
- **NON toccati**:
  - Slug DB `fipe-personal-trainer` (già senza Elite)
  - Internal ID `fipe-elite` in `certifications.ts` e selettori (refactor fuori scope)
  - Nome del pack "ELITE" e riferimenti tipo `"pack PRO ed ELITE"` (è il nome del pack, non la cert)
  - `supabase/migrations/024_add_fipe_access_rule.sql` (storia già applicata; la nuova migration 025 fa l'UPDATE sul DB)

### File modificati (17)

| File                                                  | Modifica                                                                      |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| `src/lib/constants/packs.ts`                          | Rinomina testi pack PRO/Elite + entry certification                           |
| `src/lib/constants/hero-slides.ts`                    | Rinomina testo slide                                                          |
| `src/lib/constants/certifications.ts`                 | `title` + descrizione (rimosso "elite")                                       |
| `src/components/home/pack-preview.tsx`                | Rinomina 6 occorrenze                                                         |
| `src/components/home/hero-section.tsx`                | Rinomina testi + JSX multi-riga + "Specializzazione elite → avanzata"         |
| `src/components/home/why-lacertosus.tsx`              | Rinomina 2 occorrenze                                                         |
| `src/components/home/faq-section.tsx`                 | Rinomina full match + "FIPE Personal Elite Trainer" → "FIPE Personal Trainer" |
| `src/components/packs/pack-comparison.tsx`            | Rinomina 7 occorrenze + "FIPE Elite" → "FIPE"                                 |
| `src/components/shared/certifications-cards.tsx`      | Commenti + JSX multi-riga + "Specializzazione elite → avanzata"               |
| `src/components/shared/block-modal.tsx`               | JSX multi-riga                                                                |
| `src/components/percorso/percorso-tirocinio.tsx`      | Rinomina 1 occorrenza                                                         |
| `src/components/percorso/percorso-timeline.tsx`       | Rinomina 1 occorrenza                                                         |
| `src/components/percorso/percorso-certifications.tsx` | "elite firmato FIPE" → "di livello firmato FIPE"                              |
| `src/app/percorso/page.tsx`                           | Metadata title + description                                                  |
| `src/app/layout.tsx`                                  | Description + keyword                                                         |
| `src/app/certificazioni/page.tsx`                     | Description + keyword + testi + FAQ                                           |
| `src/app/pack/page.tsx`                               | Description metadata                                                          |

### File creati

| File                                            | Scopo                                                                |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| `supabase/migrations/025_rename_fipe_label.sql` | UPDATE `product_access_rules.label` per slug `fipe-personal-trainer` |

### Modifiche esterne necessarie

| Sistema       | Azione                                                                   | Stato      |
| ------------- | ------------------------------------------------------------------------ | ---------- |
| Supabase prod | Eseguire `025_rename_fipe_label.sql` via SQL Editor (UPDATE idempotente) | ⏳ da fare |
| Stripe        | Nessuna azione                                                           | ✅ ok      |
| Make.com      | Nessuna azione (slug invariato)                                          | ✅ ok      |

### Procedura di test

1. Deploy su staging → verifica visuale di:
   - Home (hero, pack-preview, why-lacertosus, faq, certifications-cards)
   - `/percorso` (page metadata + timeline + tirocinio + certifications)
   - `/percorso/fipe-personal-trainer` (pagina FIPE, sezione acquisto)
   - `/pack` (comparison)
   - `/certificazioni` (card FIPE + FAQ)
   - `/account/tickets` (label ticket FIPE — usa `getCourseLabel` che legge `packs.ts.name`)
   - `/admin/scanner` (label dal DB → dopo migration 025 dovrebbe mostrare "Personal Trainer FIPE")
2. Eseguire migration 025 su Supabase prod
3. Deploy main → verifica visuale identica
4. Verifica meta tag/SEO con browser devtools (description, keywords)

### Rollback

#### Code

```bash
git revert <COMMIT_HASH_BATCH_002>
git push origin main
```

#### DB

```sql
UPDATE public.product_access_rules
SET label = 'Personal Elite Trainer FIPE'
WHERE product_slug = 'fipe-personal-trainer';
```

### Commit di riferimento

- `e4975f0` — refactor(fipe): rename Personal Elite Trainer to Personal Trainer in site copy
- `6020ef9` — docs(fipe): mark Batch 002 as deployed and verified in production
- Branch: `staging` → merge fast-forward in `main`
- Deploy: Vercel (staging + production)
- DB: migration 025 eseguita manualmente via SQL Editor in Supabase prod (2026-05-22)

---

## Batch 003 — Aggiornamento trainerPitch Masterclass Running (Ivan Pellizzari)

**Data**: 2026-05-22
**Stato**: 🟢 in produzione
**Obiettivo**: Sostituire il `trainerPitch` di Ivan Pellizzari nella pagina `/masterclass/master-running` con l'elenco esteso delle qualifiche (Istruttore/Allenatore Triathlon FITRI, IRONMAN COACH, Preparatore atletico CONI).

### Decisioni prese

- Modificato solo `workshop-detail.tsx` (pagina detail), come da istruzione utente "non modificare nient'altro"
- **NON toccati** gli altri 2 file con varianti del testo:
  - `src/components/workshops/workshop-grid.tsx:95` (variante corta usata nella grid `/masterclass`)
  - `src/lib/constants/teachers.ts:318` (bio sintetica usata altrove)

### File modificati

| File                                           | Modifica                                                              |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| `src/components/workshops/workshop-detail.tsx` | `trainerPitch` di `master-running` aggiornato con qualifiche complete |

### Modifiche esterne necessarie

Nessuna (no DB, no Stripe, no Make).

### Procedura di test

1. Deploy su staging → apri `/masterclass/master-running`, verifica nuovo `trainerPitch`
2. Deploy main → stessa verifica su produzione

### Rollback

```bash
git revert <COMMIT_HASH_BATCH_003>
git push origin main
```

### Commit di riferimento

- `a33dbc2` — refactor(masterclass): expand Ivan Pellizzari trainer pitch in running detail
- `500bbe8` — docs: mark Batch 003 as deployed in production
- Branch: `staging` → merge fast-forward in `main`
- Deploy: Vercel (staging + production)

---

## Batch 004 — Aggiornamento role docenti (Sandro Bartolomei, Anna Deisi)

**Data**: 2026-05-22
**Stato**: 🟢 in produzione
**Obiettivo**: Aggiornare il campo `role` (label mostrata sotto il nome) di 2 docenti nelle pagine `/percorso/strength` e `/percorso/science`.

### Decisioni prese

- Modificate solo le righe `role` richieste in `teachers.ts`, niente altro
- **NON toccati**:
  - Campo `bio` dei due docenti
  - Gionata Raffaelli (stesso role "Co-Founder — Centro Aura", non richiesto)
  - Convenzione casing/punctuation (em-dash `—`, accenti su "Università") preservata: il CSS applica `text-transform: uppercase` in UI

### File modificati

| File                            | Modifica                                            |
| ------------------------------- | --------------------------------------------------- |
| `src/lib/constants/teachers.ts` | Riga 86 (Sandro Bartolomei) + riga 234 (Anna Deisi) |

### Modifiche esterne necessarie

Nessuna.

### Procedura di test

1. Deploy staging → apri `/percorso/strength` (verifica Sandro) e `/percorso/science` (verifica Anna)
2. Deploy main → stessa verifica su produzione

### Rollback

```bash
git revert <COMMIT_HASH_BATCH_004>
git push origin main
```

### Commit di riferimento

- `c505c89` — refactor(teachers): update Sandro Bartolomei and Anna Deisi role labels
- `157df97` — docs: mark Batch 004 as deployed in production
- Branch: `staging` → merge fast-forward in `main`
- Deploy: Vercel (staging + production)

---

## Batch 005 — Masterclass Tennis: rimozione Piatti, badge "Prossimamente", no data

**Data**: 2026-05-22
**Stato**: 🟡 in sviluppo (in attesa di commit + deploy)
**Obiettivo**: Trasformare la masterclass Tennis nel pattern "Prossimamente" identico a Rugby. Rimuovere ogni riferimento a Riccardo Piatti e al Piatti Tennis Center dai testi UI, rimuovere la data, sostituire il badge "Elite" con "Prossimamente".

### Decisioni prese (concordate utente)

- Typo utente: "Riccardo Patti" = "Riccardo Piatti" (confermato)
- Opzione B applicata: rimozione completa riferimenti a Piatti (persona + centro)
- Opzione B1: entry teacher `piatti-tennis-center` lasciata in `teachers.ts` (ora orfana, non più referenziata da `teacherSlugs`). Bio aggiornata: rimosso "fondato da Riccardo Piatti"
- Pattern allineato a `master-rugby`:
  - `trainerLabel: "Ospite internazionale"`, `teacherSlugs: []`, `date: "Da definire"`
  - Grid: badge "Prossimamente", headline/pitch/tooltip come Rugby
  - Detail: `trainerHeadline: "Faculty in definizione"`, pitch generico
  - Selector: pitch generico
  - Pack includes: "Trainer da definire"

### File modificati (6)

| File                                            | Modifica                                                                                       |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/lib/constants/workshops.ts`                | master-tennis: date "Da definire", teacherSlugs [], trainerLabel "Ospite internazionale"       |
| `src/components/workshops/workshop-grid.tsx`    | master-tennis credits: headline, pitch, badge "Elite"→"Prossimamente", badgeTooltip            |
| `src/components/workshops/workshop-detail.tsx`  | master-tennis: trainerHeadline, trainerPitch, voce "included" (rimosso "Piatti Tennis Center") |
| `src/components/packs/masterclass-selector.tsx` | master-tennis: pitch generico                                                                  |
| `src/lib/constants/teachers.ts`                 | piatti-tennis-center bio: rimosso "fondato da Riccardo Piatti"                                 |
| `src/lib/constants/packs.ts`                    | master-tennis includes: "Piatti Tennis Center" → "Trainer da definire"                         |

### Modifiche esterne necessarie

Nessuna (no DB, no Stripe, no Make).

### NON toccati

- `scripts/setup-stripe-masterclasses.mjs` (script, non UI)
- `supabase/migrations/022_masterclass_catalog_update.sql` (history)
- `teachers.ts` entry `piatti-tennis-center` (name + role lasciati; bio aggiornata) — orfano dopo le modifiche
- Nome prodotto Stripe `master-tennis` (slug invariato, price invariato)

### Procedura di test

1. Deploy staging → `/masterclass` (n.05 Tennis: badge "Prossimamente", no data, no Piatti)
2. `/masterclass/master-tennis` (detail page: faculty in definizione)
3. `/pack` modali PRO/Elite → masterclass-selector mostra Tennis col nuovo pitch
4. Deploy main → verifica identica in prod

### Rollback

```bash
git revert <COMMIT_HASH_BATCH_005>
git push origin main
```

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
