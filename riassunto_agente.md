# Riassunto agente

Questo file serve come snapshot operativo del progetto per agenti AI.
Obiettivo: evitare di rileggere tutta la repo ad ogni task, soprattutto i file UI molto grandi e le migrazioni.

Generato da analisi locale il `2026-03-30`.

## Regola di manutenzione

- All'inizio di ogni richiesta, l'agente deve controllare se questo file esiste e usarlo come primo riferimento operativo
- Se questo file e il codice reale sono in conflitto, il codice vince e questo file va aggiornato
- Alla fine di ogni richiesta, l'agente deve verificare se ci sono nuove informazioni o modifiche da riflettere qui
- Non salvare mai segreti o credenziali in questo file

## 1. Snapshot rapido

- Progetto principale: `lacertosus-academy`
- Stack: `Next.js 15.2`, `React 19`, `TypeScript strict`, `Tailwind CSS 4`, `App Router`
- Backend/data: `Supabase` (auth, db, storage), `Stripe`, `Resend`
- UI/motion: `framer-motion`, `gsap`, `three` (Three.js), `jsqr`, `qrcode`
- Alias TS: `@/* -> ./src/*`
- Branch attuale: `main`
- Worktree locale non pulito:
- `src/components/layout/navbar.tsx`
- `src/components/home/path-overview.tsx`
- Le modifiche locali attuali aggiornano soprattutto:
- comportamento hide/show della navbar
- breakpoint navbar (`min-[981px]`)
- copy/date `2026/27` nel percorso
- Non esiste un `README.md` in root

## 2. Cosa e il progetto

Ecommerce / sito academy per formazione fitness "Lacertosus Academy".

Funzioni gia presenti:

- sito marketing pubblico
- pagine corso / masterclass / docenti
- auth utente con Supabase
- checkout Stripe
- ordini e ticket QR
- area account utente
- area admin per ordini, scanner QR, hero slides, CTA telefonica
- microsito teaser separato in `teaser-website/`

## 3. Stato repository reale

Cartelle/fatti importanti:

- `src/` contiene tutta l'app Next
- `supabase/migrations/` contiene solo SQL, non c'e schema TypeScript generato
- `.claude/` esiste localmente ma e ignorata da git
- `teaser-website/` esiste localmente ma e ignorata da git
- `.next/`, `node_modules/`, `agents_temp/` sono artefatti/local-only

Attenzione:

- `.gitignore` ignora completamente `.claude/`
- `.gitignore` ignora completamente `teaser-website/`

Implica che:

- un clone pulito del repo potrebbe non avere ne le istruzioni Claude locali ne il microsito teaser
- se un agente lavora solo sui file tracciati da git, rischia di ignorare due pezzi reali del progetto locale

## 4. Mappa root utile

```text
.
|- src/
|  |- app/            # routing Next App Router
|  |- components/     # UI e blocchi di pagina
|  |- lib/            # clients, costanti, stripe, qr, email, theme, utils
|  `- middleware.ts   # protezione account/admin + refresh sessione
|- supabase/
|  `- migrations/     # schema e migrazioni SQL
|- public/
|- teaser-website/    # microsito teaser separato, ignorato da git
|- .claude/           # regole locali agenti, ignorata da git
|- package.json
|- next.config.ts
`- .env.example
```

## 5. Source of truth effettivo

Non tutto il dominio e nel DB. Il progetto e ibrido.

Source of truth lato codice:

- catalogo prodotti/pack: `src/lib/constants/packs.ts`
- blocchi corso: `src/lib/constants/courses.ts`
- masterclass/workshop: `src/lib/constants/workshops.ts`
- docenti: `src/lib/constants/teachers.ts`
- fallback hero slides: `src/lib/constants/hero-slides.ts`

Source of truth runtime lato DB:

- auth utenti: `profiles`
- ordini: `orders`
- ticket: `tickets`
- attendance/check-in: `attendance`
- hero home editabile: `hero_slides`
- CTA telefonica editabile: `site_settings`
- leads teaser: `teaser_leads`

Punto fondamentale:

- `orders.pack_id` e `tickets.course_id` oggi sono `TEXT slug`, non FK UUID
- la migrazione `010_orders_use_slug.sql` ha disaccoppiato ordini/ticket dalle tabelle `packs` e `courses`
- quindi il catalogo reale NON arriva dal DB ma dai file TS

Conseguenza per agenti:

- se il task riguarda prezzi, prodotti, nomi pack, masterclass, corsi o docenti, partire dai file in `src/lib/constants/`
- non assumere che le tabelle `packs` / `courses` del DB siano aggiornate o usate dal frontend

## 6. Routing applicativo

Pagine pubbliche principali:

- `/` home marketing
- `/percorso` percorso formativo
- `/pack` confronto pack e acquisto
- `/docenti` griglia docenti
- `/masterclass` indice masterclass
- `/masterclass/[slug]` dettaglio masterclass
- `/corsi/[slug]` dettaglio blocco corso
- `/checkout` pagina di riepilogo pre-Stripe
- `/conferma` pagina post-checkout

Area auth:

- `/auth/login`
- `/auth/register`
- `/auth/callback`
- `/auth/confirm`
- `/auth/email-changed`

Area account:

- `/account`
- `/account/orders`
- `/account/tickets`

Area admin:

- `/admin`
- `/admin/orders`
- `/admin/scanner`
- `/admin/contenuti`
- `/admin/contenuti/hero`
- `/admin/contenuti/cta-tel`

Route duplicate/legacy:

- `/workshop` e `/masterclass` mostrano lo stesso indice
- `/workshop/[slug]` e `/masterclass/[slug]` mostrano lo stesso dettaglio
- `/admin/hero` duplica la UI di `/admin/contenuti/hero`

## 7. Flussi principali

### 7.1 Auth e pending checkout

File chiave:

- `src/app/auth/login/page.tsx`
- `src/app/auth/register/page.tsx`
- `src/app/auth/callback/route.ts`
- `src/app/auth/confirm/route.ts`
- `src/middleware.ts`

Logica:

- login con `supabase.auth.signInWithPassword`
- register con `supabase.auth.signUp`
- se utente non loggato prova a comprare, il frontend salva `pending_checkout` in `localStorage`
- dopo login/confirm/account il flusso prova a riprendere `pending_checkout`

Nota importante:

- `register` salva `phone` nei `user_metadata`
- il trigger `handle_new_user()` crea `profiles` con `email` e `full_name`, ma non salva `phone`
- quindi il telefono dopo la registrazione iniziale non e persistito subito in `profiles`

### 7.2 Checkout Stripe

File chiave:

- `src/components/packs/pack-comparison.tsx`
- `src/app/checkout/checkout-content.tsx`
- `src/app/api/checkout/session/route.ts`
- `src/lib/stripe/checkout.ts`

Flusso:

- UI sceglie pack/masterclass
- `/checkout` mostra riepilogo
- POST `/api/checkout/session` crea un ordine `pending` in Supabase
- poi crea una Stripe Checkout Session
- salva `stripe_checkout_session_id` nell'ordine
- redirect a Stripe

Nota:

- bundle `bronzo`, `argento`, `oro` hanno `priceCents = 0` e `stripePriceId = ""`
- quindi ad oggi i bundle risultano ancora non realmente acquistabili
- i blocchi singoli `corpus`, `vis`, `victor` sono i prodotti piu pronti all'acquisto

### 7.3 Webhook Stripe e ticket

File chiave:

- `src/app/api/stripe/webhook/route.ts`
- `src/lib/qr/encrypt.ts`
- `src/lib/qr/generate.ts`
- `src/lib/email/client.ts`
- `src/lib/email/templates/*`

Flusso attuale su `checkout.session.completed`:

- aggiorna ordine a `paid`
- legge ordine e profilo
- costruisce elenco prodotti da ticketare
- genera payload QR cifrato
- genera PNG QR
- prova a caricarlo in storage bucket `tickets`
- inserisce record in tabella `tickets`
- invia email conferma ordine
- opzionalmente invia webhook outbound a Make.com

Flusso su `checkout.session.expired`:

- marca ordine come `cancelled`

### 7.4 QR validation e scanner

File chiave:

- `src/components/admin/qr-scanner.tsx`
- `src/app/admin/scanner/page.tsx`
- `src/app/api/qr/validate/route.ts`

Flusso:

- scanner admin legge camera con `jsqr`
- puo inviare al backend un UUID ticket oppure un payload QR cifrato
- il backend valida che ticket esista e che l'ordine sia `paid`
- se riceve `eventId`, puo registrare attendance

### 7.5 Gestione contenuti admin

File chiave:

- `src/app/admin/contenuti/hero/page.tsx`
- `src/app/admin/contenuti/cta-tel/page.tsx`
- `src/components/layout/floating-cta.tsx`
- `src/app/page.tsx`

Logica:

- hero home prende slide da `hero_slides`, fallback a costanti statiche se tabella assente
- widget telefonico flottante legge da `site_settings`
- entrambe le feature sono editabili da pannello admin

### 7.6 Microsito teaser separato

File chiave:

- `teaser-website/index.html`
- `teaser-website/server.js`
- `teaser-website/submit.php`
- `supabase/migrations/009_teaser_leads.sql`

Flusso teaser:

- form lead name/email
- `server.js` salva su `teaser_leads`
- invia notifica email via Resend
- ha rate limiter in-memory molto semplice

## 8. Schema Supabase effettivo

### Tabelle centrali usate davvero

- `profiles`

  - `id` FK `auth.users`
  - `email`, `full_name`, `phone`, `fiscal_code`, `role`
  - `role` in: `student`, `admin`, `staff`

- `orders`

  - `id`
  - `user_id`
  - `pack_id` come `TEXT slug`
  - `selected_workshop_ids`
  - `status`: `pending`, `paid`, `cancelled`, `refunded`
  - dati Stripe e billing

- `tickets`

  - `id`
  - `order_id`
  - `user_id`
  - `course_id` come `TEXT slug`, nullable
  - `qr_payload`
  - `qr_image_url`
  - `is_used`

- `attendance`

  - `ticket_id`
  - `calendar_event_id`
  - `checked_in_by`
  - unique `(ticket_id, calendar_event_id)`

- `hero_slides`

  - testo hero editabile

- `site_settings`

  - key/value per CTA telefonica

- `teaser_leads`
  - lead teaser con unique case-insensitive su email

### Tabelle presenti ma oggi non centrali

- `courses`
- `packs`
- `calendar_events`

Motivo:

- `orders` e `tickets` non usano piu FK verso `packs` e `courses`
- il frontend usa le costanti TS come catalogo reale
- `calendar_events` esiste ma non c'e una UI vera che la popola o la usa in modo completo

### RLS e ruoli

Migrazioni chiave:

- `008_rls_policies.sql`
- `011_fix_rls_recursion.sql`

Funzione importante:

- `public.get_user_role()` evita ricorsione nelle policy admin/staff

## 9. Servizi esterni e variabili ambiente

Da `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `QR_ENCRYPTION_KEY`
- `MAKE_WEBHOOK_URL`
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

Osservazioni:

- PostHog e presente nell'example env ma non compare nell'app analizzata
- `QR_ENCRYPTION_KEY` serve solo per payload QR cifrati
- il bucket/storage `tickets` e usato dal webhook ma non compare in nessuna migration
- quindi il bucket `tickets` sembra prerequisito manuale esterno alla repo

## 10. Incoerenze, gap e rischi gia individuati

### Critici / molto utili da sapere prima di toccare il backend

- I bundle con selezione masterclass non persistono davvero la scelta.
- `checkout-content.tsx` invia `masterclassIds`, ma `api/checkout/session` salva solo `selected_workshop_ids = workshopIds || []`.
- Il webhook Stripe legge `workshop_ids`, ma ignora `masterclass_ids`.
- Risultato: per bundle Argento/Oro le masterclass selezionate non vengono salvate ne ticketate.

- Il webhook Stripe non ha guardia di idempotenza.
- Se Stripe reinvia `checkout.session.completed`, il codice puo rigenerare ticket e reinviare email.

- Lo scanner admin non passa `eventId`.
- `attendance` e supportata a livello API, ma la UI scanner usa solo `{ qrData }`.
- Risultato: check-in evento non viene realmente registrato nella UX attuale.

- La UI utente dei ticket non usa i QR cifrati salvati nel DB/storage.
- `account/tickets` genera il QR lato client partendo dal solo UUID ticket.
- Il webhook invece genera `qr_payload` cifrato e PNG in storage.
- Quindi oggi esistono due pipeline QR parallele e quella storage/cifrata sembra quasi inutilizzata lato frontend.

- Se si scansiona un QR generato dalla pagina account (UUID puro), il backend non ha `payload.userName`.
- Lo scanner mostra `ticket.user_id` come fallback, non il nome reale dell'utente.

- `is_used` non viene impostato dal normale scan.
- Viene usato soprattutto per invalidare ticket di ordini cancellati/refunded.
- La UI account mostra "Utilizzato", ma il check-in standard non aggiorna questo campo.

- L'azione admin "Annulla ordine" non sembra fare rimborso Stripe.
- Cambia solo stato interno, invalida ticket e manda email.

### Media priorita / debito tecnico

- Ruolo `staff` puo entrare in `/admin` via middleware, ma `hero_slides` e `site_settings` sono scrivibili solo da `admin` nelle policy SQL.

- `src/app/admin/hero/page.tsx` duplica quasi 1:1 `src/app/admin/contenuti/hero/page.tsx`.

- `src/app/workshop/*` duplica `src/app/masterclass/*`.

- `src/app/pack/page.tsx` metadata cita `Oro Plus`, ma nel catalogo reale non esiste.

- In UI e migration convivono nomi `CORPUS` e `PRIMAL`.
- Esempi:
- `hero-section.tsx` mostra ancora `PRIMAL`
- migration `014_hero_slides.sql` ha default slide con `PRIMAL`
- il catalogo corsi reale usa `CORPUS`

- `api/checkout/session` accetta `packId` e `priceId` dal client senza una vera validazione server-side di coerenza tra pack e Stripe price.

- `api/checkout/resume` ricrea un ordine pending ma perde eventuali selezioni masterclass/workshop.

- Non risultano test automatici nel repo.

### Sicurezza / attenzione extra

- `teaser-website/submit.php` contiene chiavi hardcoded (Supabase service role + Resend).
- Trattarlo come file ad alto rischio.
- Non copiarne i pattern nel progetto principale.
- Se possibile andrebbe rimosso o bonificato.

## 11. File entrypoint consigliati per task

Se il task riguarda prezzi, pack, catalogo:

- `src/lib/constants/packs.ts`
- `src/components/packs/pack-comparison.tsx`
- `src/app/checkout/checkout-content.tsx`
- `src/app/api/checkout/session/route.ts`
- `src/app/api/stripe/webhook/route.ts`

Se il task riguarda auth/account:

- `src/middleware.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/client.ts`
- `src/app/auth/*`
- `src/app/account/*`

Se il task riguarda ticket, QR, scanner:

- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/qr/validate/route.ts`
- `src/components/admin/qr-scanner.tsx`
- `src/app/admin/scanner/page.tsx`
- `src/app/account/tickets/page.tsx`
- `src/lib/qr/*`

Se il task riguarda hero home:

- `src/app/page.tsx`
- `src/lib/constants/hero-slides.ts`
- `src/app/admin/contenuti/hero/page.tsx`
- `supabase/migrations/014_hero_slides.sql`

Se il task riguarda widget telefono:

- `src/components/layout/floating-cta.tsx`
- `src/app/admin/contenuti/cta-tel/page.tsx`
- `supabase/migrations/015_site_settings.sql`

Se il task riguarda contenuti statici corsi/docenti/masterclass:

- `src/lib/constants/courses.ts`
- `src/lib/constants/workshops.ts`
- `src/lib/constants/teachers.ts`
- `src/components/docenti/teachers-grid.tsx`
- `src/components/workshops/workshop-detail.tsx`
- `src/components/courses/course-detail.tsx`

Se il task riguarda teaser landing:

- `teaser-website/server.js`
- `teaser-website/index.html`
- `supabase/migrations/009_teaser_leads.sql`

## 12. File pesanti da NON rileggere sempre

Questi file sono costosi in token e pieni di animazioni / markup:

- `src/components/home/path-overview.tsx`
- `src/components/home/hero-section.tsx`
- `src/components/home/pack-preview.tsx`
- `src/components/packs/pack-comparison.tsx` (~1900 righe — hero, journey, packs, masterclass, modal)
- `src/components/packs/hero-scene.tsx` (~350 righe — animazione scroll-driven blocchi→pack)
- `src/components/docenti/teachers-grid.tsx`

Regola pratica:

- rileggili solo se il task tocca davvero quell'area visuale o le animazioni
- per task backend o data-flow basta quasi sempre partire da questo file + gli entrypoint specifici sopra

## 12b. Hero Home — redesign cinematico v3 (aprile 2026)

File: `src/components/home/hero-section.tsx`. Lavoro iterato in molte passate; questa è la configurazione finale della sessione.

Concept: 4 pannelli pinned desktop, stack mobile lineare. Ogni pannello ha una sua personalità visiva (bg image + dark, video focale, dark puro, dark con transizione a bianco). CTA band sempre in primo piano con 4 bottoni a pari larghezza. Navbar adatta al background dietro. Tema globale forzato a light.

### Desktop — stage pinned 420vh

Pin: `ScrollTrigger({ start: "top top", end: "+=580%", pin: stageRef, scrub: 0.9 })` con singolo trigger su `sectionRef` che guida una timeline unica per tutti i pannelli. (Aggiornato da 420% → 580% ad aprile 2026 per dare tempo di lettura al pannello certificato P4.)

**Snap ai centri dei pannelli** (aprile 2026): la scrollTrigger include `snap: { snapTo: [0, 0.11, 0.41, 0.69, 0.89, 1], duration: { min: 0.25, max: 0.7 }, delay: 0.12, ease: "power2.inOut", inertia: false }`. Se l'utente si ferma a metà di una transizione fra pannelli, viene portato automaticamente al pannello più vicino (centro hold P1/P2/P3/P4 o estremi 0/1). Elimina il problema degli artefatti grafici visibili quando ci si "incastra" nelle transizioni intermedie.

**Entrance animations on panel arrival** (aprile 2026): con lo snap attivo, le animazioni scrub-based degli elementi interni completavano il loro arco durante il transito fra pannelli; arrivati al centro hold gli elementi erano già a stato finale, senza alcun reveal visibile. Fix:

- Elementi chiave di S1/S2/S3 marcati con `data-reveal` (label micro, titoli massivi, descrizioni, KPI container, progression track)
- `gsap.set` iniziale porta tutti i reveal a `opacity: 0, y: 24`
- Helper `revealPanel(el)` esegue `gsap.fromTo` con stagger 0.06, duration 0.55, ease power3.out, `overwrite: "auto"`
- Nell'`onUpdate` della scrollTrigger, ogni volta che `stageIdx` cambia viene chiamato `revealPanel` sul nuovo pannello — animazione "fresca" sia avanti sia indietro
- Il container s1/s2/s3 continua a essere mostrato via scrub (opacity 0→1); solo gli elementi interni ricevono il reveal evento-based. Nessun FOUC perché i container sono nascosti finché non si attivano.

**Layer di sfondo**:

- `stageRef` base `background: #111111`
- `videoLayerRef` (z0): iframe Vimeo fullbleed (URL `?background=1&autoplay=1&loop=1&muted=1&dnt=1`, dimensionamento `width: 177.77vh / minWidth 100% / height: 56.25vw / minHeight 100%`). Opacity gestita per stato: 0 in P1, 1 in P2+P3, 0 in P4.
- `videoOverlayRef`: overlay scuro uniforme `rgba(17,17,17,0.75)` dentro il video layer (serve per leggibilità durante P2).
- `slideBgRef` (z1): `backgroundImage: url(slide.bg_image_url)` con overlay gradient scuro. Opacity 1 in P1, 0 dopo.
- `gridRef` (z2): `StaticGrid` — pattern arancione 88px alpha `0.25` con **mask radiale** `radial-gradient(ellipse 60% 58% at 50% 50%, transparent 0-55%, rgba(0,0,0,0.4) 72%, black 88-100%)` (vignetta circolare: centro libero, bordi visibili). Opacity costante su tutti i pannelli.
- Top gradient 128px `rgba(17,17,17,0.85) → transparent` per contrast navbar.
- 4 corner brackets arancio translucido z3.
- `transitionLayerRef` **rimosso** (aprile 2026): niente più crossfade di chiusura hero → sezione successiva. La hero chiude con solo fade di `gridRef` e `s3Ref` a opacity 0 (dur 0.18, start 0.82). Motivo: bg della sezione #perche ora light warm (#F5F3EF), il crossfade non serve più.

**State layers (z10, absolute stacked)**:

- `s0Ref` (S0 Slider): titolo `SplitLine` char-by-char bianco/arancio `clamp(3.2rem,7.2vw,8rem)`, description centrata, bottom bar con slide dots + contatore "01/03". Frecce prev/next laterali (52×52, bordo bianco translucido, hover bordo+icona arancio) con SVG chevrons squared (`strokeLinecap="square"`). Swipe/drag via Pointer Events (mouse + touch, soglia 48px) su tutto il panel con `data-no-swipe` sui pulsanti. Badge FIPE iniziale è stato **rimosso** per pulizia.
- `s1Ref` (S1 Metodo): label "— Il Metodo", quote "Formiamo chi / cambia il fitness." massivo, sub-description **bianca 95%**. `pointer-events-none` su panel per non bloccare click.
- `s2Ref` (S2 Numeri): 3 KPI tipografici massivi (9 · 100% · 8) a `clamp(8rem,18vw,18rem)`, count-up GSAP gated da `countFiredRef` quando progress > 0.58. Label bianche. `pointer-events-none`.
- `s3Ref` (S3 Cert): "FIPE × LACERTOSUS" hero, progressione `I/II/III` + badge CERT. Shield icon **rimossa**. Etichette dei blocchi (CORPUS/VIS/VICTOR) bianche senza prefisso "dopo". `pointer-events-none`.

**Timeline scrub** (progress 0→1 su 420vh di scroll):

- 0.00–0.22 P1 (slider) hold
- 0.22–0.30 P1→P2: slideBg fade out, videoLayer fade in, s0 fade up
- 0.30–0.52 P2 hold (video + overlay 75%)
- 0.52–0.60 P2→P3: s2 fade in (video rimane visibile)
- 0.60–0.78 P3 hold (numeri con count-up)
- 0.78–0.84 P3→P4: videoLayer fade out, s2 out, s3 in (torna #111 puro)
- 0.84–0.94 **P4 hold** (~58vh di scroll, tempo di lettura certificato — allungato ad aprile 2026 da 0.04 → 0.10)
- 0.94–1.00 Exit: gridRef→0, s3→0 (niente crossfade verso la sezione successiva)

**onUpdate** aggiorna:

- `sliderActive.current = progress < 0.22` (autoplay slider solo in P1)
- `countFiredRef` one-shot a progress > 0.58
- `stageIdx` (0–3) per la progress bar nel CTA band

**CTA band sticky** (z20, bottom, paddingTop 48 / paddingBottom 32):

- Top meta row centrato: dot pulse arancio + "Iscrizioni Aperte · Inizio Settembre 2026"
- 4 bottoni `flex: 1 1 0` (tutti pari larghezza):
  1. **Scopri i Pack** — primary arancio `#F09226`, icon tile 36×36 bordo scuro con **SVG bento 2×2** (4 rect squared, stroke `currentColor` 1.5, richiama il design bento del sito). Hover `scale-110` sul tile.
  2. **Il Percorso Completo** — ghost bordo bianco translucido + backdrop blur. Icona **SVG 3-step progressivi** (rect-line-rect-line-rect, primo filled per indicare start), `group-hover:translate-x-1.5`.
  3. **Guarda il Video** — bordo arancio translucido, play-icon in cerchio arancio pieno, apre `videoModal` (portal con `VideoBlock` SDK full controls, click outside / Escape / Chiudi per uscire, body scroll lock)
  4. **Prosegui** — ghost stile uguale a "Il Percorso Completo", con **progress bar integrata**: strip 3px ancorata al top del pulsante, larghezza `((stageIdx+1)/4)*100%` arancio con glow, 3 tick markers bianchi translucidi a 25/50/75%. Click → `getElementById("perche").scrollIntoView({ behavior: "smooth" })`. La progress è **incorporata nel bordo** del pulsante stesso — un singolo componente, niente elementi separati, niente overflow su desktop medi.

### Mobile — stack lineare (no pin)

Ordine dei blocchi:

1. **P1 Slider** `minHeight: 50vh` con `slide.bg_image_url` + overlay + `StaticGrid` + fade bottom 24 (gradient `transparent → rgba(17,17,17,0.6) → #111`) per sfumare nel CTA band sotto
2. **CTA band** (appena sotto lo slider): label + "Scopri i Pack" + "Il Percorso Completo" full-width stacked
3. **P2 Metodo** `minHeight: 70vh`: iframe Vimeo di sfondo + overlay, quote massiva, description bianca 95%, inline button "Guarda con audio" che apre videoModal
4. **P3 Numeri** `mobileP3Ref`: 3 card stackate verticalmente con numero massivo `clamp(3.6rem,18vw,5rem)` + label bianche. `ScrollTrigger` con `start: "top 80%"`, `once: true` dentro `gsap.context` (revert auto) che su enter:
   - setta `mobileCountActive(true)` → CountUp animano 9/100/8
   - anima i 3 blocchi `[data-mobile-kpi]` con opacity/y stagger 0.14 ease power3.out
   - `prefers-reduced-motion` → attiva immediatamente senza trigger
   - Bottom fade 160px `transparent → rgba(17,17,17,0.7) → #111` per transizione fluida verso P4
5. **P4 Certificazione**: bg fisso `#111` (no fade a bianco — transizione netta alla sezione successiva come richiesto). Progressione con `gap-3` nelle badge + `mb-10` sotto la row. Shield icon **rimossa**.

### Swipe slider

Handler Pointer Events (mouse + touch) condivisi tra desktop e mobile:

- `onPointerDown`: salva `clientX`, ignora se target è `button`, `a`, o `[data-no-swipe]`
- `onPointerUp`: calcola dx, se `Math.abs(dx) > 48` chiama `nextSlide` / `prevSlide`
- `onPointerCancel`: reset
- **Mobile fix** (aprile 2026): `touch-action: pan-y` sul container P1 mobile — permette al browser di gestire lo scroll verticale senza cancellare i gesture orizzontali. Senza questo, gli swipe mobile venivano annullati dal browser prima che arrivasse `pointerup`.

### ScrollTrigger refresh globale

Effect separato che chiama `ScrollTrigger.refresh()` a 300ms e 1200ms dal mount + su `window load`, ogni volta che `isDesktop`/`isReducedMotion` cambiano. Necessario per evitare posizioni stale che impedivano alla sezione `#perche` di firare i propri trigger dopo il cambio viewport.

Il refresh helper usa `requestAnimationFrame` + mount guard per evitare race con React reconciliation (v1 del fix, aprile 2026).

**Difesa aggiuntiva per Vercel prod** (aprile 2026): nel useEffect principale (dopo `gsap.registerPlugin(ScrollTrigger)`) c'è:

- `gsap.config({ nullTargetWarn: false })` — silenzia i warning "GSAP target null not found" che comparivano nei bundle minified con bfcache/fast refresh (refs momentaneamente null durante hydration)
- Monkey-patch one-shot di `ScrollTrigger.refresh` con try/catch — intercetta `NotFoundError: insertBefore` quando il refresh automatico di ScrollTrigger (es. visibilitychange, resize, hydration) entra in race con mutation React del pin wrapper. L'app continua, il prossimo scroll/resize rifà un refresh pulito. Guardia `STg.__refreshPatched` previene doppia patch.

### Accessibilità

- `prefers-reduced-motion`: disabilita pin desktop + fa partire subito `mobileCountActive`
- Slider dots con `aria-current` e keyboard focusable
- Frecce con aria-label
- Pannelli S1/S2/S3 `pointer-events-none` quando invisibili (altrimenti s3 top-most intercettava i click)
- `touchAction: "pan-y"` + `select-none` su s0 per non interferire con scroll verticale

### Video modal

State `videoModalOpen` + `createPortal` → `VideoBlock` SDK (con custom controls, mute toggle, fullscreen). Body scroll lock via `document.body.style.overflow = "hidden"`, chiudibile con click outside / Escape / pulsante Chiudi.

## 19. VideoBlock shared

File: `src/components/shared/video-block.tsx` (nuovo).

Componente estratto dalla logica VideoBlock di `percorso-hero.tsx` (che rimane duplicata per ora — refactor fuori scope).

Props: `vimeoId: string`, `isDark: boolean`, `className?: string`, `borderColor?: string`.

Features:

- Init Vimeo SDK con `background: true` + `loop: true` → autoplay muto senza input utente
- Control bar sotto il video (non overlay fuori fullscreen): seek bar con progress fill arancio, play/pause (icona #F09226), rewind 10s, volume slider hover
- Fullscreen: target = wrapper div (include control bar), overlay con auto-hide 2400ms
- Cleanup corretto su unmount (player.destroy + event listeners off)

Usato in: `hero-section.tsx` (home — video modal desktop + preview mobile). `percorso-hero.tsx` NON migrato per evitare regressioni — ha una sua copia locale del componente.

## 20. Theme system — forzato a light (aprile 2026)

La possibilità di scegliere il tema è stata **completamente rimossa**. L'unico tema disponibile è light.

File modificati/rimossi:

- `src/components/providers/theme-provider.tsx`: ridotto a provider no-op che restituisce sempre `{ theme: "light", toggle: () => {} }`. Tipo `Theme = "light" | "dark"` mantenuto solo per compatibilità coi comparison `theme === "dark"` sparsi nella codebase (risolvono sempre a `false`, le branch light vengono prese). Nessun uso di `useState`/`useEffect`/`localStorage`.
- `src/app/layout.tsx`: rimosso script anti-FOUC che gestiva localStorage + fascia oraria. `<html data-theme="light">` hardcoded. Body class `bg-academy-dark` rimossa (era un residuo del tema dark default).
- **Rimossi**: `src/components/ui/theme-toggle.tsx` (intero file), `src/lib/theme/` (intera cartella con `index.tsx` e `THEME_STORAGE_KEY`). Non più referenziati.
- `src/components/layout/navbar.tsx`: import `ThemeToggle` eliminato, componente non più montato nella barra.

Consumer `useTheme()` resta funzionante in tutti i componenti esistenti (percorso-hero, pack-comparison, value-proposition, etc.) perché il provider espone ancora `theme`. Tutte le branch condizionali `isDark` ora prendono il ramo light automaticamente.

## 21. Navbar — stato finale (aprile 2026)

File: `src/components/layout/navbar.tsx`.

### Flags di colore

- `scrolled = pastHero && y > 30` dove `pastHero = document.getElementById("perche")?.getBoundingClientRect().top <= 0`
- `overHeroDark = pathname === "/" && !scrolled` (home sopra-fold → trattamento dark-bg)
- `onDarkBg = overHeroDark || isMobileViewport` (mobile ha sempre bg dietro scuro per il blur condizionale — vedi sotto)
- `isDark = onDarkBg ? true : (theme === "dark")` (= sempre false post-forzatura light)

Uso: tutti i colori testo (nav links, numeri 01/02/03/04, logo "Lacertosus", "Accedi") usano `onDarkBg ? "text-white"` nelle ramificazioni, altrimenti text neri/grigi.

### Scroll behavior

- **Mobile** (`matchMedia("(max-width: 980px)")`): navbar SEMPRE visibile, nessun hide-on-scroll-down. yPercent 0 forzato sempre.
- **Desktop non-home o past-hero**: hide on scroll-down >4px, show on scroll-up >4px. yPercent -110 per nascondere.
- **Desktop home in-hero**: sempre visibile + trasparente.

### Background

- **Mobile sopra-fold (home) / mobile in hero**: completamente trasparente
- **Mobile past-hero o pagine interne**: `backdropFilter: blur(10px)` + `background: rgba(255,255,255,0.55)` + `borderBottom: 1px solid rgba(0,0,0,0.05)`
- **Desktop in-hero (home above-fold)**: `bg-transparent`
- **Desktop scrolled / inner pages**: `navbar-scrolled-bg` class (definita in globals.css)

### Right cluster (desktop)

- `WhatsAppButton` (42×42, prima di user area)
- Se loggato: `UserAvatar` (42×42, era 36)
- Se anonimo: "Accedi" link + "Iscriviti Ora" bordered

### Right cluster (mobile)

- `WhatsAppButton` (44×44)
- Menu button (44×44, bg arancio, solo icona hamburger 3-linee squared, niente più label "MENU" testuale). Stato aperto: bg transparent + bordo rosso + X squared.
- Logo a sinistra: `h-11 w-11` (44×44) per pareggiare gli altri.

### WhatsApp button

`WhatsAppButton({ onDarkBg, size })`: quadrato, `border: 1.5px solid #F09226`, `background: rgba(240,146,38,0.08~0.1)`, icona SVG ufficiale WhatsApp in arancione. Hover → bg arancio solido + icona scura `#010015`. Link: `https://wa.me/390521607870` (stesso numero della ex FloatingCTA).

### Mobile menu overlay

Sempre light (ignora `onDarkBg`): `bg-white`, bordi corner arancio/30, divider nav-link `border-black/6`, testo label `#111`, sub-label `#666`.

Body scroll lock quando aperto via `useEffect` su `mobileOpen`: `document.body.style.overflow = "hidden"` + `touchAction: "none"`. Overlay stesso con `overflow-hidden overscroll-contain` + `onTouchMove={e.preventDefault()}` per bloccare swipe interni.

## 22. ScrollProgress — gate su #perche (aprile 2026)

File: `src/components/ui/scroll-progress.tsx`.

Il circolo fisso bottom-right con % scroll ora è visibile solo quando la sezione `#perche` è effettivamente nel viewport (prima appariva da subito sulla home hero creando confusione).

Logica in useEffect update: `const rect = document.getElementById("perche")?.getBoundingClientRect(); setVisible(rect && rect.top < vh * 0.65 && rect.bottom > 0)`. Se `#perche` non esiste → nascosto.

## 23. Rimozioni e file eliminati in questa sessione

- **FloatingCTA** (`src/components/layout/floating-cta.tsx`): rimossa dal montaggio in `src/app/layout.tsx`. Il file esiste ancora fisicamente ma non è più referenziato (può essere cancellato quando si è sicuri di non volerlo reintegrare). Motivo: CTA telefonica visibile solo in alcune fasce orarie + non richiesta dal nuovo design. Numero preservato nel nuovo WhatsAppButton.
- **ThemeToggle** (`src/components/ui/theme-toggle.tsx`): file cancellato.
- **Theme lib** (`src/lib/theme/`): cartella intera cancellata.

## 24. Analisi Rive / Lottie / R3F (non integrati)

Decisione: **skippati** per l'iterazione della Hero.

Motivazioni:

- **R3F / Three.js**: bundle +150kb, SSR non banale, performance mobile a rischio. Non giustificato finché non esiste un asset 3D brand-specifico (es. pesi animati, logo 3D) da valorizzare. `three` è già in `package.json` ma non usato.
- **Rive**: richiede file `.riv` progettato esternamente. Senza asset non c'è nulla da integrare.
- **Lottie**: richiede JSON `.lottie` esterno. Idem.

Allo stato attuale la dramma cinematica è ottenuta con: video Vimeo full-bleed + GSAP + tipografia massiva + grid statica con mask radiale — sufficiente per standard premium senza costi di bundle.

## 13. Componenti home presenti ma non necessariamente montati

Home `/` oggi usa:

- `HeroSection`
- `WhyLacertosus` (unifica ex `ValueProposition` + `SocialProofBar`)
- `PackPreview`
- `PathOverview`
- `FaqSection`
- `CTASection`

Componenti home esistenti ma non montati nella home attuale:

- `CalendarSection`
- `CertificationSection`
- `StatsSection`
- `WorkshopPreview`

`TrainingHubSection` non e sulla home ma su `/percorso`.

## 13b. WhyLacertosus — unificazione Perché + Prima Edizione (aprile 2026)

File: `src/components/home/why-lacertosus.tsx` (nuovo).
Sostituisce e rimpiazza `value-proposition.tsx` + `social-proof-bar.tsx` (entrambi eliminati dal worktree).

Sezione unica su `id="perche"`, **tema light minimal-luxury**. Bg sezione `#F5F3EF` (warm off-white). Arancio `#F09226` usato esclusivamente per punti focali: label `§`, numeri problema, strike, accent card (risposta + cohort), shield FIPE, brackets, card full-orange "30 posti", dots scarsità, perk label/icon/sub. Nessuna vignetta né pattern di fondo — bento pulito.

Setta `--section-bg: #F5F3EF` inline così il `transitionLayer` della hero chiude in seamless su questo bg light.

### Struttura: 3 movimenti scroll-driven (no pin, ScrollTrigger on-enter `once: true`)

Separatori tipografici `§ 01 — Il Settore` · `§ 02 — La Cohort` · `§ 03 — I Docenti` (label mono arancio + divider `rgba(0,0,0,0.08)` + label destra in grigio terziario).

**Il movimento "Il Metodo" (KPI 9/100% + 4 soluzioni numerate) è stato rimosso su richiesta.** I contenuti relativi (durata, presenza, soluzioni 01-04) non sono più mostrati in questa sezione.

**§01 · IL SETTORE** — titolo "Pieno di corsi. Non di professionisti." + bento 12 col × 2 righe:

- `col-7 row-2` **Patologie del settore · ×05** — 5 problemi numerati con strike arancione (`scaleX 0→1`, stagger 0.13, origine left), footer "Fonte: mercato formativo italiano 2025"
- `col-5` **La Risposta** (card accent arancio su light) — quote massiva + 4 tag pill (Tecnica · Pratica · Business · Network)
- `col-5` **FIPE strip** — shield SVG arancio + claim certificazione doppia

**§02 · LA COHORT** — bento 12 col × 2 righe + footer perks:

- `col-8 row-2` hero card accent — SplitLine char-by-char su **"COHORT 001"** (`clamp(3.2rem,9vw,7rem)`) + quote + body, brackets arancio agli angoli
- `col-4 row-2` card **Accesso Esclusivo** redesign minimal-luxury (aprile 2026): bg bianco `CARD_BG`, niente più grid 30-slot né fondo arancio pieno. Struttura: label top "Accesso Esclusivo" arancio → counter massivo `clamp(6rem,14vw,10rem)` 0→30 arancio con label "Posti · per edizione" mono → divider `rgba(0,0,0,0.08)` → copy sobria → status row con **dot pulsante animato** (`animate-ping` arancio) + "Iscrizioni aperte · chiusura a esaurimento". Focus puramente tipografico.
- 3 × `col-4` perk finali: `◆ I Fondatori · ◈ L'Ecosistema · ⬡ Training Hub`

**§03 · I DOCENTI** — titolo `{TEACHERS.length} professionisti. Zero compromessi.` + **carosello orizzontale full-bleed** di tutti i docenti da `src/lib/constants/teachers.ts`:

- Import `TEACHERS` array (attualmente 37 docenti) + tipo `Teacher`
- Ogni card: `shrink-0`, width `clamp(280px, 78vw, 360px)`, min-height 480px, bg bianco `CARD_BG`, scroll-snap-align start
- Layout card (uniforme per tutti — "ogni docente deve essere importante"): top row meta `01 / 37` + course label (CORPUS/VIS/VICTOR/MASTERCLASS via `getCourseLabel`), monogram centrale iniziali (via `getInitials`) in arancio su bg `rgba(240,146,38,0.07)` con 4 brackets arancio agli angoli, nome `text-[1.25rem] font-black`, ruolo uppercase tracking largo arancio, bio regolare
- Scroller: `overflow-x-auto` con `scrollbar-width: none` + arbitrary `[&::-webkit-scrollbar]:hidden`, `scroll-snap-type: x mandatory`. **Bleed solo a destra** (`-mr-[5%] md:-mr-10` + `pr-[5%] md:pr-10`): prima card allineata all'edge sx del wrapper (stesso asse di header/titolo), le card scorrono fuori oltre il bordo destro del container.
- Arrows **in alto a destra** accanto al titolo (riga title-row flex items-end justify-between): coppia 48×48 bianchi con border arancio, SVG chevron squared, disabled → opacity 30.
- Controls sotto: solo progress bar `h-px bg-black/10` con fill arancio `width: carouselProgress*100%`. Niente più frecce in basso.
- Scroll multi-input **con feel fluido coerente** (rewrite aprile 2026 — la versione precedente appariva "statica" perché scroll-snap proximity + pointer capture davano il salto finale senza mostrare il trascinamento):
  - **Nessuno scroll-snap**: scroll libero, le posizioni intermedie sono tutte valide. Più fluido durante il drag manuale.
  - **Touch mobile**: scroll nativo iOS-style (niente handler attaccati, solo CSS `overflow-x-auto`)
  - **Mouse desktop**: drag-to-scroll **con momentum** via listener globali:
    - `onMouseDown` sullo scroller → `preventDefault` (blocca text-select), `stopMomentum`, registra `mousemove`/`mouseup` su **window** (niente `setPointerCapture`, più affidabile cross-browser)
    - `onMove` (window): `scrollLeft = startScroll - dx` aggiornato in diretta + tracking `velocityRef` (px/ms)
    - `onUp` (window): rimuove listener, ripristina cursor + user-select; se `freshness < 80ms` e `|v| > 0.05` → `startMomentum` con decay 0.93/frame fino `|v| < 0.02`
    - Cursor switching via `el.style.cursor = "grabbing"` + `document.body.style.userSelect = "none"` direttamente (no React re-render durante drag)
  - **Frecce**: `scrollByCard(dir)` smooth, step = `card.offsetWidth + gap 16`
  - **Mouse wheel / trackpad**: browser-nativo (shift+wheel, trackpad 2-finger)
- State carosello: `carouselProgress`, `canPrev`, `canNext` aggiornati via scroll listener + resize listener.
- Animazioni GSAP: header §03 + title + `carouselRef` entry fade-up on-enter. Nessuna animazione per-card (lo scroll orizzontale lo gestisce swipe/frecce)

### Animazioni GSAP (tutte `once: true`)

- Header movimento: `y:32, opacity:0`, duration 0.8
- Card entrance: `y:40, opacity:0`, stagger 0.1
- Strike problema: `scaleX 0→1`, stagger 0.13, delay 0.3
- Counter 30: tween su `obj.v` con `onUpdate` textContent
- SplitLine cohort: `y:30, opacity:0`, stagger 0.04
- 30-slot: `scale 0.75→1, opacity 0→1`, stagger 0.035
- `prefers-reduced-motion` → skip completo dell'intero context (stato finale naturale)

### Palette (light, tokens in testa al file)

- `BG_SECTION = "#F5F3EF"` — bg sezione warm off-white
- `CARD_BG = "#FFFFFF"` + `CARD_BORDER = "rgba(0,0,0,0.07)"` — card neutre
- `ACCENT_CARD_BG = "linear-gradient(145deg, rgba(240,146,38,0.09), #FFFFFF 70%)"` + `ACCENT_CARD_BORDER = "rgba(240,146,38,0.28)"` — card focali arancio (risposta, cohort)
- Full arancio: `#F09226` + testo `#020026` (card "30 posti")
- `TEXT_PRIMARY = "#111111"`, `TEXT_SECONDARY = "rgba(17,17,17,0.62)"`, `TEXT_TERTIARY = "rgba(17,17,17,0.42)"`
- `STRIKE_ORANGE = "rgba(240,146,38,0.7)"` — più saturo per visibilità su bianco

La sezione non usa `useTheme()`: palette light hardcoded via token (decisione editoriale, non soggetta al global theme).

### Note

- `id="perche"` preservato: usato da `ScrollProgress` (sez. 22) e navbar (`pastHero` flag).
- Cleanup via `gsap.context()` + `ctx.revert()` su unmount.
- La hero chiude verso `--section-bg`: con `#F5F3EF` il fade del transitionLayer hero→perche è seamless.

## 14. Contesto git recente

Ultimi commit locali osservati:

- `4d3c705 feat: cta-section - bento layout, contrast fix, build error resolved`
- `e49e4c9 feat: batch 4 - pack tablet fix, CTA section full redesign`
- `319e6cc fix: PathOverview - wider snap dead zone, no tray/depth plate, cleaner card content`
- `3c92186 feat: PathOverview intro - 3D folder cards with pick & navigate`
- `6bf895a feat: PathOverview - navbar hide, tilt cards, doc certificate, seasonal dates`

Ultima area toccata in sessione (2026-04-09): `SocialProofBar` — redesign card Prima Edizione.

## 15. Regole operative per futuri agenti

- Prima di cambiare pricing o catalogo, verificare sempre `src/lib/constants/packs.ts`.
- Prima di cambiare logica ordini/ticket, verificare il pairing:
- `api/checkout/session`
- `api/stripe/webhook`
- `account/tickets`
- `api/qr/validate`
- Non assumere che `orders`, `tickets`, `packs`, `courses` siano allineati come schema classico FK-driven: non lo sono piu.
- Se il task riguarda solo contenuti hero/CTA, non serve rileggere l'intera home.
- Se il task riguarda il teaser, ricordare che e fuori dal repo tracciato.
- Se il task riguarda admin content e il tester usa ruolo `staff`, aspettarsi possibili errori di policy write.

## 16. Checklist minima prima di modifiche rischiose

- Build/test automatici assenti: fare almeno `npm run lint` e se il task lo richiede anche `npm run build`
- Per cambiamenti Supabase: controllare migrazioni esistenti e capire se la source of truth e DB o costanti TS
- Per cambiamenti Stripe: verificare session metadata, webhook e idempotenza
- Per cambiamenti ticket/QR: ricordare la differenza fra UUID ticket e payload cifrato
- Per cambiamenti teaser: verificare se si sta lavorando sul server Node (`server.js`) o sul fallback PHP (`submit.php`)

## 17. Pagina Pack (`/pack`) — redesign aprile 2026

La pagina `/pack` e stata completamente ridisegnata. File principale: `src/components/packs/pack-comparison.tsx` + `src/components/packs/hero-scene.tsx`.

### Architettura sezioni (dall'alto verso il basso)

1. **HeroSection** — scroll-driven sticky (280vh wrapper, 100vh sticky viewport)

   - Sinistra: titolo, descrizione, stats pills (stile identico a percorso-hero)
   - Destra: `HeroScene` — 4 blocchi bento (CORPUS, VIS, VICTOR, FIPE) in 2x2 con glow pulsante
   - Scroll animation (GSAP ScrollTrigger, scrub):
     - Mobile: stats scompaiono una alla volta, descrizione fade, scena sale al centro, blocchi si impilano uno alla volta (full-size, testo centrato, slide da destra/sinistra), stack shrink, deck 3 pack in S inversa
     - Desktop: dettagli fade, blocchi si spostano al centro (stessa dimensione, impilamento), stack shrink, deck 3 pack a ventaglio
   - I 4 blocchi sono cliccabili → aprono `BlockModal` (bento layout con curriculum, docenti, date, stats)
   - I 3 pack finali al click scrollano a `#section-packs`

2. **JourneySection** — percorso formativo

   - 3 righe cliccabili (CORPUS, VIS, VICTOR) → aprono `BlockModal`
   - Strip bento compatta 3 colonne: Masterclass (8 dispo, 2 in Argento/Oro) | 9 mesi | FIPE certif.
   - Periodo: 2026-2027

3. **PacksSection** — i pacchetti formativi

   - 3 `PackCard` (BRONZO, ARGENTO, ORO) con animazione GSAP deal (fan da centro)
   - Ogni card mostra: prezzo esempio, durata, include, avatar docenti, CTA
   - Click → `PackModal` (video, docenti per blocco, includes, CTA acquisto)
   - `PACK_PRICE_DISPLAY` in costanti per prezzi placeholder

4. **MasterclassSection** — bento minimal
   - Grid 4 colonne, ogni masterclass con numero, trainer, prezzo, CTA
   - TBD opacizzate con "Prossimamente"

### File chiave

- `src/components/packs/pack-comparison.tsx` — tutte le sezioni + modal (BlockModal, PackModal)
- `src/components/packs/hero-scene.tsx` — animazione scroll-driven blocchi→pack (GSAP, position absolute)
- `src/components/packs/masterclass-selector.tsx` — modal selezione masterclass per Argento/Oro
- `src/lib/constants/packs.ts` — catalogo prodotti (bundle priceCents=0, singoli con Stripe price ID)
- `src/lib/constants/courses.ts` — dati blocchi (curriculum, date, docenti)
- `src/lib/constants/workshops.ts` — dati masterclass
- `src/lib/constants/teachers.ts` — docenti con ruolo, bio, colore

### Dipendenze aggiunte

- `three` + `@types/three` — installate ma non usate nella versione finale (hero-scene usa GSAP puro)
- `HeroScene` e caricato con `next/dynamic` SSR=false

### Pattern importanti

- **ScrollTrigger cleanup**: mai usare `ScrollTrigger.getAll().forEach(t => t.kill())` — uccide trigger di altre sezioni. Salvare il proprio trigger e killare solo quello.
- **gsap.fromTo vs gsap.from**: usare `fromTo` per entrance animation — `from` puo lasciare elementi a opacity 0 se la timeline viene killata prima del completamento.
- **Mobile vs Desktop**: il flag `isMobile = window.innerWidth < 1024` e usato sia in HeroSection che in HeroScene per differenziare le animazioni scroll.

## 18. Riassunto decisionale in una frase

Questo progetto e una web app Next.js con catalogo principalmente statico in TypeScript, runtime transazionale su Supabase/Stripe, alcune route duplicate/legacy, un sottosistema QR parzialmente incoerente, e un microsito teaser separato e ignorato da git che non va dimenticato nelle analisi locali.

---

## 18. Pagina /percorso — redesign completo (aprile 2026)

### Stack componenti attuali

```
/percorso/page.tsx
  PercorsoHero         src/components/percorso/percorso-hero.tsx
  PercorsoTimeline     src/components/percorso/percorso-timeline.tsx
  PercorsoOutcome      src/components/percorso/percorso-outcome.tsx
  TrainingHubSection   src/components/home/training-hub-section.tsx
```

`PercorsoTirocinio` e stato rimosso dalla pagina.

### PercorsoHero

Struttura a due slot verticali:

- **Slot 1** (`height: 100svh`, `flex items-center`) — identico al pattern Pack: contenuto centrato nel viewport con `pt-24 md:pt-28`. Colonna sinistra 42% (testo + stats + CTA), colonna destra 58% (video player).
- **Slot 2** (below fold) — 3 block card uguali (`sm:grid-cols-3`) + riga inferiore 9 Mesi / Certificazione.

Background: identico a `pack-comparison` — `section-bg` + radiali colorati + griglia 80px, tutto theme-aware via `useTheme()`.

Block cards: palette neutra/arancione uniforme, nessun colore distinto per blocco.

9 Mesi: barre mesi neutrali progressive (`rgba(255,255,255, 0.07–0.24)` dark / `rgba(0,0,0, ...)` light).

Certificazione: design a progressione narrativa con nodi `○ 1 → ○ 2 → ○ 3 → [CERT.]`.

CTA Calendario: bottone pieno arancio `#F09226` stile home, freccia `↓` in quadrato bordato.

### Video Player (VideoBlock)

Dipendenza: `@vimeo/player@2.30.3` installato.

Vimeo ID: `1161847546` (stesso dell'hero home).

Inizializzazione: SDK crea l'iframe via `new Player(containerRef, { background: true, loop: true, responsive: true })` — `background: true` e critico per l'autoplay silenzioso.

**Struttura barra controlli** — 2 righe:

- Riga 1: seek bar con progress fill arancio + timer `m:ss / m:ss` ai lati
- Riga 2: `[⛶ Fullscreen]` | separatore | `[⏪10s]` | `[▶/⏸ Play in #F09226]` | `[🔊 Volume + slider hover]`

La barra e posizionata **fuori** dal video (sotto), con border L/R/B che continuano il bordo video. In fullscreen diventa overlay con gradient + auto-hide 2400ms.

Seek: `timeupdate` event SDK aggiorna `currentTime` in tempo reale. Durante drag (`onMouseDown`) blocca l'update, `onMouseUp` chiama `player.setCurrentTime()`.

Rewind 10s: `player.setCurrentTime(Math.max(0, currentTime - 10))`.

`getDuration()` chiamato all'init SDK per la durata totale.

Fullscreen: `wrapperRef.current.requestFullscreen()` — target e il div wrapper (include la barra). `fullscreenchange` listener gestisce lo stato `isFullscreen`.

Block cards nell'hero (Corpus/Vis/Victor): ora sono `<button>` invece di `<Link>` — aprono `BlockModal` via `setOpenBlock(course.slug)`. Date rimosse dalle card.

### PercorsoTimeline

Anno: `2026 / 2027`.

Altezza uniforme: tutti i 6 pannelli (3 blocchi + 3 FIPE) montati nel DOM contemporaneamente via CSS Grid stacking (`gridArea: "1 / 1"`). Solo il pannello attivo ha `opacity: 1`. Nessun salto di altezza tra slide.

Swipe touch: `onTouchStart`/`onTouchEnd` sul panel, soglia 48px.

Navigazione: tab + strip mesi + dot progress + frecce tastiera (←/→).

Nessun colore gold — tutti i riferimenti FIPE usano arancio (`#F09226`, `rgba(240,146,38,...)`).

### PercorsoOutcome

Sfondo: `section-bg-alt` (#010018 dark, #F2F2F2 light) — differente dall'hero. Nessuna griglia dot.

Layout: 2 colonne flex — sinistra tutto il contenuto (header, lista 01-10, CTA), destra colonna `clamp(200px, 22vw, 300px)` con `"10"` sticky (`top: 88px`).

Il "10" si blocca automaticamente alla stessa altezza della CTA grazie al naturale termine della colonna destra nel layout flex.

Animazioni GSAP ScrollTrigger: header, ogni riga manifesto (`x: -24`), CTA.

### TrainingHubSection (ampliata)

Contenuti da `https://training-hub.lacertosus.com/`.

Struttura:

1. Header — "Apri il tuo Training Hub / Zero investimento. Zero scuse."
2. 5 feature card in 5 colonne desktop
3. 2 modelli HUB 50mq / HUB 100mq — **senza dati economici/contrattuali**, solo badge "Sconto riservato ai partecipanti Academy"
4. CTA band — solo "Inizia il Percorso" link a `/pack`

Sezione "Come Funziona" rimossa.

### Fix globali applicati

- `template.tsx`: `useEffect(() => window.scrollTo(0, 0), [])` — reset scroll su ogni navigazione.
- `globals.css`: classi `.cal-*` per il calendario (month bar, tab, panel, nav, dot) con override `[data-theme="light"]`.

### Note per futuri task su /percorso

- Non toccare `VideoBlock` senza leggere prima la sezione SDK Vimeo: il `background: true` e critico per l'autoplay.
- Il video player usa `ControlBar` come funzione interna a `VideoBlock` — non e un componente top-level estratto.
- La `ControlBar` gestisce anche il fullscreen internamente (non esiste piu `FsButton` separato).
- Le date nei componenti percorso mostrano solo il mese (`monthOnly(d)` helper), mai il giorno.
- I colori gold (`#D4AF37`, `rgba(212,175,55,...)`) sono stati rimossi da tutta la pagina percorso.
