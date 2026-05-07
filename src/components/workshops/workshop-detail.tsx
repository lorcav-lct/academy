"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import type { Workshop } from "@/lib/constants/workshops";
import { getMasterclassProducts } from "@/lib/constants/packs";
import { getTeacherBySlug, type Teacher } from "@/lib/constants/teachers";
import { TeacherPortrait } from "@/components/shared/teacher-portrait";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";

/* ──────────────────────────────────────────────────────────────
   Sales content per masterclass
─────────────────────────────────────────────────────────────── */
type Module = { num: string; title: string; body: string };
type FaqItem = { q: string; a: string };

type MasterclassContent = {
  domain: string;
  hook: string;
  trainerHeadline: string;
  trainerPitch: string;
  whatYouLearn: string;
  modules: Module[];
  outcomes: string[];
  forWho: string[];
  notFor: string[];
  included: string[];
  faq: FaqItem[];
  finalHook: string;
};

const CONTENT: Record<string, MasterclassContent> = {
  "master-functional-bulgarian": {
    domain: "Functional × Bulgarian",
    hook: "Il metodo bulgaro non è un esercizio. È un sistema. Chi lo conosce davvero allena diversamente.",
    trainerHeadline: "Ivan Ivanov × Pierluigi Mauro",
    trainerPitch:
      "Ivan Ivanov è uno dei riferimenti internazionali del metodo bulgaro applicato al functional training. Pierluigi Mauro è il pioniere italiano della Macebell e del lavoro con Clubbell e Kettlebell — ha portato in Italia metodologie che oggi sono standard a livello globale.",
    whatYouLearn:
      "Due giornate intensive in cui i due specialisti smontano il metodo bulgaro e mostrano come integrarlo nel functional training avanzato. Niente teoria astratta — solo pattern, protocolli e applicazione pratica.",
    modules: [
      {
        num: "01",
        title: "Filosofia del metodo bulgaro",
        body: "Origini, principi e perché oggi è il riferimento per chi lavora con il carico massimale ad alta frequenza.",
      },
      {
        num: "02",
        title: "Pattern motori e tecnica avanzata",
        body: "I fondamentali della tecnica bulgara: dal massimale quotidiano alla ripetizione perfetta sotto stress.",
      },
      {
        num: "03",
        title: "Macebell + Clubbell",
        body: "Strumenti, progressioni e protocolli con i tool che hanno ridefinito il functional training a livello mondiale.",
      },
      {
        num: "04",
        title: "Programmazione del massimale",
        body: "Come strutturare un programma bulgaro per atleti, clienti avanzati e trasformazione di alto livello.",
      },
      {
        num: "05",
        title: "Adattamento al cliente",
        body: "Modulazione del metodo per livelli diversi: dal principiante motivato all'atleta di prestazione.",
      },
    ],
    outcomes: [
      "Costruire un programma bulgaro completo da zero",
      "Padroneggiare i pattern di Macebell e Clubbell",
      "Modulare il carico massimale ad alta frequenza",
      "Integrare il metodo nel functional training reale",
      "Avere uno strumento d'élite in più nel tuo arsenale",
    ],
    forWho: [
      "Personal trainer che vogliono uno strumento d'élite in più",
      "Atleti di forza e functional che cercano profondità tecnica",
      "Coach che lavorano con clientela motivata e avanzata",
    ],
    notFor: [
      "Chi cerca solo schede pronte all'uso",
      "Chi non ha mai lavorato con carico significativo",
    ],
    included: [
      "1-2 giornate in presenza con Ivan Ivanov e Pierluigi Mauro",
      "Materiale didattico digitale completo",
      "Schede e protocolli operativi",
      "Attestato di partecipazione Lacertosus Academy",
      "Accesso al network alumni",
    ],
    faq: [
      {
        q: "Servono prerequisiti tecnici?",
        a: "Una buona base di functional training è consigliata. Il master è pensato per professionisti già attivi nel settore.",
      },
      {
        q: "Posso acquistarlo se sono iscritto al pack PRO/ELITE?",
        a: "I pack PRO ed ELITE includono già 2 masterclass a scelta tra le 9. Se sei iscritto, contattaci per la selezione.",
      },
      {
        q: "Il materiale è disponibile dopo l'evento?",
        a: "Sì. Ricevi tutte le slide, schede e protocolli in formato digitale alla fine della masterclass.",
      },
      {
        q: "C'è un attestato?",
        a: "Riceverai un attestato di partecipazione Lacertosus Academy, valido come crediti formativi nel settore.",
      },
    ],
    finalHook:
      "Bulgarian + Functional: la combinazione che separa il PT generico dallo specialista riconoscibile.",
  },
  "master-strength": {
    domain: "Strength Avanzato",
    hook: "Il massimale non è un test. È il risultato di una preparazione invisibile fatta bene.",
    trainerHeadline: "Andrea Quarto × Emanuela Romano",
    trainerPitch:
      "Andrea Quarto è atleta olimpico di ParaPowerlifting con coaching ai massimi livelli internazionali. Emanuela Romano è una strength coach specializzata nella performance al femminile e nei massimali tecnici. Insieme, due prospettive complementari sulla forza pura.",
    whatYouLearn:
      "Due giornate dedicate alla forza nel suo significato più operativo: tecnica, programmazione e gestione del massimale. Per chi non vuole improvvisare schede di forza con il proprio cliente top.",
    modules: [
      {
        num: "01",
        title: "Fisiologia della forza",
        body: "Cosa succede nel corpo durante il massimale e come le variabili di programmazione cambiano l'output reale.",
      },
      {
        num: "02",
        title: "Tecnica nei tre fondamentali",
        body: "Squat, panca e stacco: dettagli tecnici che fanno la differenza sotto carico massimale.",
      },
      {
        num: "03",
        title: "Programmazione settimanale",
        body: "Microcicli, macrocicli e periodizzazione dell'atleta di forza dal principiante al gareggiante.",
      },
      {
        num: "04",
        title: "Performance al femminile",
        body: "Adattamenti specifici, ciclo mestruale e gestione del carico nella donna allenata seriamente.",
      },
      {
        num: "05",
        title: "Strategie di gara",
        body: "Tapering, gestione del peak e mental toughness per il giorno della pedana.",
      },
    ],
    outcomes: [
      "Programmare microcicli e macrocicli di forza con padronanza",
      "Gestire la tecnica del cliente nei massimali",
      "Adattare il programma a clientela maschile e femminile",
      "Pianificare un peak week e un tapering efficaci",
      "Allenare la mente oltre al corpo nel massimale",
    ],
    forWho: [
      "PT che lavorano con clientela amante della forza",
      "Allenatori di sport di forza (powerlifting, weightlifting)",
      "Coach S&C che vogliono raffinare i protocolli di massimale",
    ],
    notFor: [
      "Chi non ha mai gestito massimali con un cliente",
      "Chi cerca solo bodybuilding estetico",
    ],
    included: [
      "1-2 giornate con Andrea Quarto e Emanuela Romano",
      "Schede di programmazione e fogli operativi",
      "Materiale didattico completo",
      "Attestato di partecipazione",
      "Accesso al network alumni",
    ],
    faq: [
      {
        q: "Devo essere un atleta di forza?",
        a: "No. Il master è pensato per chi allena, non per chi gareggia. Se gareggi è comunque un'esperienza di alto valore.",
      },
      {
        q: "Funziona anche per la clientela femminile?",
        a: "Assolutamente sì. Una giornata è dedicata specificamente alla performance femminile con Emanuela Romano.",
      },
      {
        q: "Posso applicare quanto imparato anche a sport non di forza?",
        a: "Sì. La forza è la base di ogni preparazione fisica avanzata: i protocolli sono trasferibili in moltissimi contesti.",
      },
      {
        q: "Riceverò materiale operativo?",
        a: "Sì. Ti vengono forniti template di programmazione e schede pronte da personalizzare.",
      },
    ],
    finalHook:
      "Smetti di improvvisare i massimali. Programmali come un atleta olimpico.",
  },
  "master-calcio": {
    domain: "Performance Calcio",
    hook: "Cosa fa la differenza tra un campo di Serie A e una squadra qualunque? La cura ossessiva del dettaglio fisico — ogni allenamento, ogni giorno.",
    trainerHeadline: "Mino Fulco",
    trainerPitch:
      "Performance Manager al Real Madrid, Everton FC, Napoli e Bayern Monaco. Dal 2025 Performance Coach della Nazionale Brasiliana per la Coppa del Mondo. Mino non parla di teoria: ti porta dentro le metodologie reali del calcio mondiale.",
    whatYouLearn:
      "Una giornata in cui Mino smonta il modello fisico del calciatore d'élite e mostra protocolli, monitoraggio e gestione del carico esattamente come si fa nelle squadre top mondiali.",
    modules: [
      {
        num: "01",
        title: "Modello fisico del calciatore moderno",
        body: "Profilo bioenergetico, demand fisico per ruolo e cosa è cambiato negli ultimi 10 anni nel gioco d'élite.",
      },
      {
        num: "02",
        title: "Microciclo settimanale",
        body: "Come si costruisce la settimana tipo in una squadra di Serie A: dal MD-3 al MD+1, errori frequenti e best practice.",
      },
      {
        num: "03",
        title: "Monitoraggio del carico",
        body: "GPS, RPE, wellness questionnaire: cosa serve davvero, cosa è solo numero, e come integrare il dato nelle decisioni.",
      },
      {
        num: "04",
        title: "Prevenzione infortuni",
        body: "Protocolli di prevenzione muscolare e tendinea che usano i top club. Come ridurre realmente l'incidenza.",
      },
      {
        num: "05",
        title: "Casi studio dal calcio top",
        body: "Esempi concreti dalle stagioni al Real Madrid, Bayern, Napoli e Brasile. Cosa funziona e perché.",
      },
    ],
    outcomes: [
      "Costruire un microciclo settimanale di livello professionistico",
      "Leggere i dati GPS e di carico interno con criterio",
      "Implementare protocolli di prevenzione muscolare e tendinea",
      "Replicare metodologie di squadre top mondiali nei tuoi contesti",
      "Coordinarsi efficacemente con uno staff tecnico",
    ],
    forWho: [
      "Preparatori atletici di squadre di calcio (giovanili → Serie A)",
      "PT che lavorano con calciatori individualmente",
      "Coach S&C che vogliono entrare nel calcio professionistico",
    ],
    notFor: [
      "Chi non ha alcun contatto con il mondo del calcio",
      "Chi cerca esercitazioni tecnico-tattiche",
    ],
    included: [
      "1 giornata con Mino Fulco",
      "Template di microciclo settimanale (livello professionistico)",
      "Slide e materiali operativi",
      "Q&A diretto con Mino su casi reali",
      "Attestato di partecipazione Lacertosus Academy",
    ],
    faq: [
      {
        q: "Devo lavorare in una squadra professionistica?",
        a: "No. I principi sono trasferibili a tutti i livelli, dal settore giovanile al professionismo.",
      },
      {
        q: "Si parla anche di calcio femminile?",
        a: "Mino ha esperienza con entrambe le realtà. Verranno toccati gli adattamenti specifici dove rilevante.",
      },
      {
        q: "Quanto è pratico vs teorico?",
        a: "Almeno il 60% è pratico/casistica. Mino è famoso per il suo approccio operativo, non accademico.",
      },
      {
        q: "Si può chiedere un suo parere su casi propri?",
        a: "Sì, c'è una sessione Q&A finale dove i partecipanti possono portare casi reali.",
      },
      {
        q: "Va bene anche per chi prepara altri sport di squadra?",
        a: "Molti principi del calcio top sono trasferibili. È un master molto utile anche per chi lavora in basket, pallavolo e rugby di squadra.",
      },
    ],
    finalHook:
      "Una giornata con il Performance Coach del Brasile vale anni di letture sulla preparazione fisica del calcio.",
  },
  "master-volley": {
    domain: "S&C Pallavolo",
    hook: "Il salto è la moneta della pallavolo. Ogni dettaglio fisico decide chi spicca davvero a rete.",
    trainerHeadline: "Oscar Berti",
    trainerPitch:
      "Strength & Conditioning Coach di Modena Volley (SuperLega) e della Nazionale Italiana di Pallavolo. Oscar è uno dei riferimenti italiani della preparazione fisica nella pallavolo di alto livello.",
    whatYouLearn:
      "Una giornata dedicata al modello S&C di una squadra di SuperLega: come si lavora la forza esplosiva, come si gestisce il salto, come si sopravvive a una stagione doppia (club + nazionale).",
    modules: [
      {
        num: "01",
        title: "Modello fisico del pallavolista moderno",
        body: "Demand di salto, rapidità e resistenza alla forza. Profili per ruolo (palleggiatore, opposto, centrale, banda, libero).",
      },
      {
        num: "02",
        title: "Forza esplosiva e potenza",
        body: "Pliometria avanzata, lavoro in catena cinetica e progressioni per la massima espressione di salto.",
      },
      {
        num: "03",
        title: "Tecnica di salto",
        body: "Jump training: fondamentali, errori comuni, progressioni dal lineman al fuoriclasse.",
      },
      {
        num: "04",
        title: "Programmazione stagionale",
        body: "Pre-season, in-season, peaking sui playoff. Come distribuire il carico nelle 40+ settimane.",
      },
      {
        num: "05",
        title: "Gestione del doppio impegno",
        body: "Atleti convocati in nazionale: protocolli di gestione del carico, recupero e prevenzione.",
      },
    ],
    outcomes: [
      "Programmare una stagione completa di pallavolo S&C",
      "Costruire un piano di pliometria e jump training",
      "Gestire il carico su 40+ settimane di stagione",
      "Implementare protocolli di prevenzione articolare",
      "Comunicare con coach tecnico in modo efficace",
    ],
    forWho: [
      "Preparatori atletici di squadre di pallavolo (giovanili → SuperLega)",
      "Coach S&C in sport con componente di salto",
      "PT che lavorano con pallavoliste individualmente",
    ],
    notFor: [
      "Chi cerca esercitazioni di tecnica pallavolistica",
      "Chi non ha contatto con sport di salto",
    ],
    included: [
      "1 giornata con Oscar Berti",
      "Template di programmazione stagionale",
      "Slide e materiali operativi",
      "Q&A su casi reali dei partecipanti",
      "Attestato di partecipazione",
    ],
    faq: [
      {
        q: "Devo lavorare in pallavolo professionistica?",
        a: "No. I contenuti sono pensati per chi opera dai settori giovanili alle massime categorie.",
      },
      {
        q: "I protocolli sono applicabili al beach volley?",
        a: "Molti principi sono trasferibili al beach. La differenza è soprattutto nelle superfici e nella demand condizionale.",
      },
      {
        q: "Come si concilia salto + forza?",
        a: "Tema centrale del master: come dosare carico massimale e pliometria nella stessa settimana.",
      },
      {
        q: "Vale anche per il basket?",
        a: "Diverse metodologie sono trasferibili. È un master utile anche per S&C di sport con componente di salto verticale.",
      },
    ],
    finalHook:
      "Imparare l'S&C dalla pallavolo italiana di SuperLega è un vantaggio competitivo immediato.",
  },
  "master-hyrox": {
    domain: "Hyrox",
    hook: "Hyrox non si improvvisa. È una gara cardiovascolare con un format unico — chi non programma il pacing perde minuti reali.",
    trainerHeadline: "Giovanni Benzon",
    trainerPitch:
      "Specialista riconosciuto in preparazione e performance per le competizioni Hyrox. Atleta e coach che vive in prima persona il circuito internazionale.",
    whatYouLearn:
      "Una giornata dedicata alla preparazione completa di un atleta Hyrox: dalle stazioni alle transizioni, dal pacing al recupero. Per coach o atleti che vogliono fare sul serio.",
    modules: [
      {
        num: "01",
        title: "Anatomia di una gara Hyrox",
        body: "Le 8 stazioni, le distanze di running, il time domain reale e dove si vince/perde davvero la gara.",
      },
      {
        num: "02",
        title: "Allenamento delle stazioni",
        body: "Forza specifica, lavoro misto, condizionamento metabolico per ogni stazione: dal SkiErg al wall ball.",
      },
      {
        num: "03",
        title: "Programmazione 12 weeks",
        body: "Costruire una preparazione di 12 settimane verso una gara con tapering e peak settimanale.",
      },
      {
        num: "04",
        title: "Pacing e strategie di gara",
        body: "Come distribuire l'energia nelle 8 stazioni + 8 km di corsa. Errori da non fare nella prima gara.",
      },
      {
        num: "05",
        title: "Recupero e tapering",
        body: "Settimana di gara: come arrivare al via riposato e affilato. Recupero post-gara e ripartenza.",
      },
    ],
    outcomes: [
      "Programmare un blocco completo di 12 settimane di Hyrox",
      "Distinguere lavoro di stazione vs lavoro di corsa nella settimana",
      "Coachare un atleta nelle 24 ore pre-gara",
      "Costruire una strategia di pacing personalizzata",
      "Replicare metodi di chi gareggia ad alto livello",
    ],
    forWho: [
      "Coach che preparano atleti Hyrox o ibridi",
      "Atleti Hyrox che vogliono autoallenarsi seriamente",
      "PT che vogliono entrare nel circuito Hyrox",
    ],
    notFor: [
      "Chi cerca un workout HIIT generico",
      "Chi non ha mai testato il formato Hyrox",
    ],
    included: [
      "1 giornata con Giovanni Benzon",
      "Template 12-week di preparazione Hyrox",
      "Strategia di pacing personalizzata",
      "Slide e materiali operativi",
      "Attestato di partecipazione",
    ],
    faq: [
      {
        q: "Devo aver fatto Hyrox per partecipare?",
        a: "No, ma è consigliato. Avere fatto almeno una gara aiuta a contestualizzare il contenuto.",
      },
      {
        q: "Il template 12-week è adattabile?",
        a: "Sì, è progettato per essere personalizzato sul livello dell'atleta o del cliente.",
      },
      {
        q: "Si parla anche di Doubles e Pro?",
        a: "I principi base sono gli stessi. Verranno toccate le specificità dei format più impegnativi.",
      },
      {
        q: "Valido per crossfitter?",
        a: "Sì. Hyrox e CrossFit hanno overlap ma logiche diverse. Il master chiarisce cosa importare e cosa lasciare fuori.",
      },
    ],
    finalHook:
      "Smetti di improvvisare i tuoi allenamenti per Hyrox: programmali come chi vince.",
  },
  "master-running": {
    domain: "Running Performance",
    hook: "Correre è l'80% testa, 20% gambe. Programmare bene il 20% libera tutto il resto.",
    trainerHeadline: "Fitri",
    trainerPitch:
      "Coach del Running Club Parma. Esperto di metodologia e performance applicata alla corsa, dai 5K alla maratona.",
    whatYouLearn:
      "Una giornata dedicata alla programmazione del runner: dalle zone fisiologiche alla periodizzazione, dalla forza per il corridore al tapering pre-gara.",
    modules: [
      {
        num: "01",
        title: "Fisiologia della corsa",
        body: "Zone di intensità, soglie e bioenergetica: cosa misurare e cosa significa davvero.",
      },
      {
        num: "02",
        title: "Periodizzazione del runner",
        body: "Come strutturare un blocco di preparazione dal 5K alla maratona. Fasi, microcicli, settimane chiave.",
      },
      {
        num: "03",
        title: "Forza per il corridore",
        body: "Come e quanto inserire la forza in un programma di corsa senza compromettere la performance.",
      },
      {
        num: "04",
        title: "Tapering e gara",
        body: "Le ultime 3 settimane prima della gara: come affilarsi senza perdere fitness. Race day execution.",
      },
      {
        num: "05",
        title: "Recupero e cross-training",
        body: "Recupero attivo, prevenzione infortuni e cross-training intelligente per il runner di volume.",
      },
    ],
    outcomes: [
      "Costruire un programma di corsa per ogni distanza (5K → maratona)",
      "Inserire la forza nel piano del runner senza interferenze",
      "Pianificare un tapering efficace pre-gara",
      "Identificare e prevenire gli infortuni più frequenti",
      "Coachare un atleta nella gestione mentale del passo",
    ],
    forWho: [
      "Coach di atletica e running",
      "PT che lavorano con runner amatori e agonisti",
      "Runner avanzati che vogliono autoallenarsi seriamente",
    ],
    notFor: [
      "Chi cerca workout HIIT generici",
      "Chi corre solo per dimagrimento occasionale",
    ],
    included: [
      "1 giornata con Fitri",
      "Template di programmazione per 5K/10K/mezza/maratona",
      "Schede di tapering e race week",
      "Slide e materiali operativi",
      "Attestato di partecipazione",
    ],
    faq: [
      {
        q: "Bisogna essere runner per partecipare?",
        a: "Aiuta, ma non è obbligatorio. Il master è pensato anche per coach che lavorano con runner senza correre loro stessi.",
      },
      {
        q: "Si parla anche di trail running?",
        a: "I principi base sono gli stessi. Le specificità del trail vengono toccate dove rilevante.",
      },
      {
        q: "I template sono adattabili?",
        a: "Sì, sono progettati per essere personalizzati su livello, distanza obiettivo e disponibilità di tempo.",
      },
      {
        q: "Va bene anche per chi prepara una prima maratona?",
        a: "Assolutamente sì. C'è una sezione dedicata alla prima maratona da affrontare con criterio.",
      },
    ],
    finalHook:
      "Una giornata con un coach del Running Club Parma vale anni di tentativi ed errori sul tuo programma.",
  },
  "master-rugby": {
    domain: "S&C Rugby",
    hook: "Il rugby è il gioco fisico più complesso da preparare: forza pesante, contatto, sprint, resistenza. Niente improvvisazione.",
    trainerHeadline: "Faculty in definizione",
    trainerPitch:
      "Stiamo finalizzando la faculty con preparatori atletici di livello internazionale nel rugby. Annunceremo il roster appena confermato.",
    whatYouLearn:
      "Una giornata sul modello fisico del rugbista moderno: forza, sprint, contatto, prevenzione. Per chi lavora già nel rugby o vuole entrarci con metodo.",
    modules: [
      {
        num: "01",
        title: "Modello fisico del rugbista",
        body: "Profili per ruolo (mischia, mediani, ali, full back). Cosa è cambiato negli ultimi 10 anni.",
      },
      {
        num: "02",
        title: "Forza e contatto",
        body: "Programmazione della forza pesante e del lavoro contatto-specifico per i reparti.",
      },
      {
        num: "03",
        title: "Velocità e sprint",
        body: "Sviluppo della velocità in sport con cambi di direzione e contatto ripetuto.",
      },
      {
        num: "04",
        title: "Programmazione stagionale",
        body: "Pre-season, in-season, gestione del carico in una stagione lunga e fisica.",
      },
      {
        num: "05",
        title: "Prevenzione infortuni",
        body: "Protocolli di prevenzione spalla, ginocchio e collo nel rugby moderno.",
      },
    ],
    outcomes: [
      "Profilare la preparazione fisica per ruolo nel rugby",
      "Costruire un microciclo da pre-season a finale stagione",
      "Implementare protocolli di prevenzione contact-sport",
      "Programmare lo sviluppo di forza pesante e velocità",
      "Comunicare con coach tecnico e medico sportivo",
    ],
    forWho: [
      "Preparatori atletici di squadre di rugby",
      "PT che lavorano con rugbisti individualmente",
      "S&C in sport di contatto",
    ],
    notFor: [
      "Chi cerca esercitazioni tecnico-tattiche",
      "Chi non ha familiarità con sport di contatto",
    ],
    included: [
      "Master in presenza con la faculty selezionata",
      "Materiale didattico digitale completo",
      "Schede e protocolli operativi",
      "Attestato di partecipazione",
      "Accesso al network alumni",
    ],
    faq: [
      {
        q: "Quando saranno annunciati i docenti?",
        a: "Stiamo finalizzando la faculty con preparatori atletici di livello internazionale. L'annuncio è previsto nelle prossime settimane.",
      },
      {
        q: "Posso prenotarmi prima del prezzo finale?",
        a: "Sì. Lasciaci il tuo interesse: ti contatteremo appena disponibili date e prezzo definitivo.",
      },
      {
        q: "È incluso nei pack PRO/ELITE?",
        a: "Sì. Sarà tra le 9 masterclass selezionabili nei pack PRO ed ELITE.",
      },
    ],
    finalHook:
      "Iscriviti alla lista interesse: ti contatteremo per primo appena la faculty sarà confermata.",
  },
  "master-sport-combattimento": {
    domain: "Combat Sports",
    hook: "Il fight è 90% preparazione fisica. Senza una S&C seria non si sale sul ring nemmeno una volta in più.",
    trainerHeadline: "Faculty in definizione",
    trainerPitch:
      "Stiamo finalizzando la faculty con preparatori di MMA, boxe e arti marziali di livello internazionale. Annunceremo il roster appena confermato.",
    whatYouLearn:
      "Una giornata sul modello fisico del fighter: forza esplosiva, condizionamento metabolico, gestione del peso e fight night execution.",
    modules: [
      {
        num: "01",
        title: "Modello fisico del fighter",
        body: "Demand fisica di MMA, boxe e arti marziali. Profilo bioenergetico per round.",
      },
      {
        num: "02",
        title: "Forza esplosiva e potenza",
        body: "Sviluppo della potenza specifica per il combattimento: catene cinetiche, pliometria, esercitazioni complesse.",
      },
      {
        num: "03",
        title: "Condizionamento metabolico",
        body: "Lavoro a soglia, intermittente e specifico per round. Errori più comuni nelle settimane di camp.",
      },
      {
        num: "04",
        title: "Gestione del peso",
        body: "Cut peso e water cut: cosa è scientificamente sicuro e cosa è folklore. Protocolli responsabili.",
      },
      {
        num: "05",
        title: "Fight night",
        body: "Le 48 ore prima del match. Recupero post-pesata, gestione mentale, riscaldamento ottimale.",
      },
    ],
    outcomes: [
      "Costruire un fight camp completo (8-12 settimane)",
      "Programmare condizionamento per round e per minuto",
      "Gestire un cut peso responsabile e ripetibile",
      "Coachare il fighter nelle 48 ore pre-match",
      "Replicare metodi di chi prepara campioni",
    ],
    forWho: [
      "Coach S&C nei combat sports",
      "Trainer di MMA, boxe, kickboxing",
      "Fighter avanzati che vogliono autoallenarsi seriamente",
    ],
    notFor: [
      "Chi cerca lezioni di tecnica marziale",
      "Chi non ha mai fatto sparring o ring",
    ],
    included: [
      "Master in presenza con la faculty selezionata",
      "Template di fight camp 8-12 settimane",
      "Schede gestione peso e fight night",
      "Slide e materiali operativi",
      "Attestato di partecipazione",
    ],
    faq: [
      {
        q: "Quando sarà annunciata la faculty?",
        a: "Stiamo finalizzando con preparatori di livello internazionale. L'annuncio è previsto nelle prossime settimane.",
      },
      {
        q: "Posso prenotarmi prima del prezzo finale?",
        a: "Sì. Lasciaci il tuo interesse: ti contatteremo appena disponibili date e prezzo definitivo.",
      },
      {
        q: "Vale anche per kickboxing e muay thai?",
        a: "Sì. I principi di S&C nei combat sport sono ampiamente trasferibili tra discipline.",
      },
    ],
    finalHook:
      "Iscriviti alla lista interesse: ti contatteremo per primo appena la faculty sarà confermata.",
  },
  "sostieni-progetto": {
    domain: "Sostegno",
    hook: "Lacertosus Academy nasce dalla volontà di alzare lo standard della formazione fitness in Italia. Ogni euro che riceviamo viene reinvestito in docenti, attrezzature e contenuti formativi.",
    trainerHeadline: "Il team Lacertosus Academy",
    trainerPitch:
      "Un team di professionisti, atleti e formatori che credono in un'idea semplice: la formazione di qualità deve essere accessibile, rigorosa e in continua evoluzione. Se condividi questa visione, il tuo contributo conta.",
    whatYouLearn:
      "Non è un corso. È un gesto. Un contributo simbolico per supportare la crescita del progetto e ricevere in cambio aggiornamenti, ringraziamenti e accesso anticipato alle prossime iniziative.",
    modules: [],
    outcomes: [
      "Sostieni concretamente lo sviluppo del progetto formativo",
      "Ricevi un ringraziamento personalizzato via email",
      "Accesso anticipato alle prossime iniziative e masterclass",
      "Possibilità di entrare nella community Sostenitori",
    ],
    forWho: [],
    notFor: [],
    included: [
      "Contributo simbolico al progetto Lacertosus Academy",
      "Ringraziamento personalizzato via email",
      "Accesso anticipato alle prossime iniziative",
      "Menzione nella community Sostenitori (opzionale, su richiesta)",
    ],
    faq: [
      {
        q: "Posso contribuire con una cifra diversa?",
        a: "Per ora il contributo è fissato a 10€ per semplicità di gestione. Per donazioni di importo diverso scrivici a academy@lacertosus.com.",
      },
      {
        q: "Riceverò una ricevuta?",
        a: "Sì. Riceverai automaticamente la ricevuta del pagamento via email, come per qualsiasi altro acquisto.",
      },
      {
        q: "È deducibile fiscalmente?",
        a: "Si tratta di un acquisto, non di una donazione liberale, quindi non è deducibile. Per progetti specifici di donazione fiscale contattaci.",
      },
    ],
    finalHook:
      "Grazie. Davvero. Ogni contributo, anche piccolo, ci aiuta a continuare il progetto.",
  },
};

const ORANGE = "#F09226";
const ORANGE_RGB = "240,146,38";

function formatPriceClean(cents: number): string {
  const v = Math.round(cents / 100);
  return `€ ${new Intl.NumberFormat("it-IT").format(v)}`;
}

/* ──────────────────────────────────────────────────────────────
   HOOK — useScrollPast for sticky bottom CTA
─────────────────────────────────────────────────────────────── */
function useScrolledPast(threshold = 600): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return past;
}

/* ──────────────────────────────────────────────────────────────
   HERO
─────────────────────────────────────────────────────────────── */
function HeroSection({
  workshop,
  content,
  priceLabel,
  isTbd,
  onBuy,
}: {
  workshop: Workshop;
  content: MasterclassContent;
  priceLabel: string | null;
  isTbd: boolean;
  onBuy: () => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  // Forced-dark hero (transparent navbar treatment with white nav text)
  const isDark = true;
  const th = "#f5f5fa";
  const tb = "rgba(180,180,200,0.7)";
  const ts = "rgba(140,140,160,0.6)";
  const borderSubtle = "rgba(255,255,255,0.08)";
  const ghost = "rgba(255,255,255,0.03)";

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[88vh] items-center overflow-hidden pt-24"
      style={{ color: th }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 30%, rgba(240,146,38,0.06) 0%, transparent 55%), linear-gradient(180deg, #0a0a0e 0%, #0d0d12 60%, #0a0a0e 100%)",
        }}
      />

      {/* Orange chrome grid + radial vignette (matches home hero) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(240,146,38,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(240,146,38,0.25) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          maskImage:
            "radial-gradient(ellipse 60% 58% at 50% 50%, transparent 0%, transparent 55%, rgba(0,0,0,0.4) 72%, black 88%, black 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 58% at 50% 50%, transparent 0%, transparent 55%, rgba(0,0,0,0.4) 72%, black 88%, black 100%)",
        }}
      />
      {/* Soft orange wash on center (matches home hero) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(240,146,38,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Concentric arcs top right */}
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[700px] w-[700px] rounded-full"
        style={{
          border: `70px solid rgba(${ORANGE_RGB},${isDark ? "0.04" : "0.05"})`,
        }}
      />
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full"
        style={{
          border: `1px solid rgba(${ORANGE_RGB},${isDark ? "0.12" : "0.14"})`,
        }}
      />

      {/* Ghost word */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
        <span
          className="block text-center font-black uppercase tracking-tighter"
          style={{ fontSize: "clamp(64px, 17vw, 220px)", color: ghost }}
        >
          {content.domain.split(" ")[0]}
        </span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-[5%] py-20 md:px-10 md:py-32">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-4xl"
        >
          {/* Breadcrumb */}
          <motion.div
            variants={fadeUp}
            className="mb-7 flex items-center gap-3 text-[0.62rem] font-bold uppercase tracking-[0.28em]"
            style={{ color: ts }}
          >
            <Link
              href="/masterclass"
              className="transition-opacity hover:opacity-70"
            >
              Masterclass
            </Link>
            <span style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: ORANGE }}>{content.domain}</span>
          </motion.div>

          {/* Eyebrow */}
          <motion.div
            variants={fadeUp}
            className="mb-7 flex items-center gap-4"
          >
            <div className="h-px w-10" style={{ background: ORANGE }} />
            <span
              className="text-[0.7rem] font-black uppercase tracking-[0.34em]"
              style={{ color: ORANGE }}
            >
              — Masterclass Specialistico
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeUp}
            className="font-black tracking-[-0.025em] leading-[0.9]"
            style={{
              fontSize: "clamp(2.4rem, 7.5vw, 5.6rem)",
              color: th,
            }}
          >
            <span className="gradient-text">{workshop.title}</span>
          </motion.h1>

          {/* Trainer headline + pitch */}
          <motion.div variants={fadeUp} className="mt-7 max-w-2xl">
            <p
              className="text-[1.05rem] font-bold leading-snug md:text-[1.15rem]"
              style={{ color: th }}
            >
              {content.trainerHeadline}
            </p>
            <p
              className="mt-2 text-[0.95rem] leading-[1.65] md:text-[1rem]"
              style={{ color: tb }}
            >
              {content.trainerPitch}
            </p>
          </motion.div>

          {/* Stats inline */}
          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
            {[
              { v: workshop.duration, l: "Durata" },
              { v: "100%", l: "In presenza" },
              { v: workshop.date, l: "Edizione" },
              { v: priceLabel ?? "TBD", l: "Singolo" },
            ].map((s) => (
              <div
                key={s.l}
                className="flex flex-col items-start px-4 py-2.5"
                style={{
                  border: `1px solid ${borderSubtle}`,
                  background: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.02)",
                  minWidth: "138px",
                }}
              >
                <span
                  className="text-[1.15rem] font-black leading-tight tabular-nums"
                  style={{ color: ORANGE }}
                >
                  {s.v}
                </span>
                <span
                  className="mt-1 text-[0.58rem] font-bold uppercase tracking-[0.22em]"
                  style={{ color: ts }}
                >
                  {s.l}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA row */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <button
              onClick={onBuy}
              className="inline-flex items-center justify-between gap-3 px-7 py-4 text-[0.78rem] font-black uppercase tracking-[0.16em] transition-all duration-200 hover:opacity-90"
              style={{ background: ORANGE, color: "#111" }}
            >
              <span>
                {isTbd ? "Lascia il tuo interesse" : "Riserva il tuo posto"}
              </span>
              <span aria-hidden className="text-base">
                →
              </span>
            </button>
            <Link
              href="/pack"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 text-[0.74rem] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
              style={{
                color: th,
                border: `1px solid ${borderSubtle}`,
              }}
            >
              <span>Includilo nel pack PRO/ELITE</span>
            </Link>
          </motion.div>

          {/* Scarcity / hint */}
          <motion.p
            variants={fadeUp}
            className="mt-5 text-[0.72rem] font-semibold tracking-[0.04em]"
            style={{ color: ts }}
          >
            {isTbd
              ? "Posti e prezzo in definizione · Lasciando interesse hai priorità sull'edizione 2026/27."
              : "Posti limitati · Edizione 2026/27 · Conferma vincolata? No."}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   TRAINER SPOTLIGHT
─────────────────────────────────────────────────────────────── */
function TrainerSpotlight({
  workshop,
  content,
  isDark,
}: {
  workshop: Workshop;
  content: MasterclassContent;
  isDark: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888888";
  const borderSubtle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardBg = isDark ? "rgba(6,6,16,0.55)" : "rgba(250,250,252,0.7)";

  const teachers: Teacher[] = workshop.teacherSlugs
    .map((s) => getTeacherBySlug(s))
    .filter((t): t is Teacher => Boolean(t));

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden py-24 md:py-28"
    >
      <div className="absolute inset-0 section-bg-alt" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mb-12 md:mb-14"
        >
          <motion.div
            variants={fadeUp}
            className="mb-5 flex items-center gap-3"
          >
            <div
              className="h-px w-8"
              style={{ background: `rgba(${ORANGE_RGB},0.55)` }}
            />
            <span
              className="text-[0.7rem] font-black uppercase tracking-[0.34em]"
              style={{ color: ORANGE }}
            >
              — La Faculty
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="max-w-3xl font-black leading-[1.02] tracking-[-0.025em]"
            style={{
              fontSize: "clamp(1.8rem, 4.2vw, 3.4rem)",
              color: th,
            }}
          >
            {content.trainerHeadline}
          </motion.h2>
        </motion.div>

        {teachers.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className={`grid gap-6 md:gap-8 ${teachers.length > 1 ? "md:grid-cols-2" : ""}`}
          >
            {teachers.map((t) => (
              <motion.article
                key={t.slug}
                variants={fadeUp}
                className="relative overflow-hidden grid grid-cols-1 md:grid-cols-[minmax(220px,42%)_1fr]"
                style={{
                  background: cardBg,
                  border: `1px solid ${borderSubtle}`,
                  backdropFilter: "blur(2px)",
                }}
              >
                {/* Portrait — 4:5, full height on desktop */}
                <div className="relative w-full md:h-full">
                  <TeacherPortrait
                    teacher={t}
                    sizes="(max-width: 768px) 100vw, 42vw"
                    fallbackTheme={isDark ? "dark" : "light"}
                  />
                </div>

                {/* Info column */}
                <div className="relative flex flex-col justify-between p-6 md:p-8">
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] md:h-full md:w-[2px] md:right-auto"
                    style={{
                      background: `linear-gradient(90deg, ${ORANGE}, rgba(${ORANGE_RGB},0.05))`,
                    }}
                  />
                  <div>
                    <p
                      className="text-[1.25rem] md:text-[1.4rem] font-black leading-[1.05] tracking-[-0.015em]"
                      style={{ color: th }}
                    >
                      {t.name}
                    </p>
                    <p
                      className="mt-2 text-[0.74rem] font-bold uppercase tracking-[0.18em]"
                      style={{ color: ORANGE }}
                    >
                      {t.role}
                    </p>
                  </div>
                  {t.talkTitle && (
                    <div
                      className="mt-6 px-4 py-3 border-l-2"
                      style={{
                        background: `rgba(${ORANGE_RGB},0.06)`,
                        borderLeftColor: ORANGE,
                      }}
                    >
                      <p
                        className="text-[0.6rem] font-black tracking-[0.28em] uppercase mb-1"
                        style={{ color: ORANGE }}
                      >
                        Intervento
                      </p>
                      <p
                        className="text-[0.88rem] leading-snug font-semibold"
                        style={{ color: th }}
                      >
                        {t.talkTitle}
                      </p>
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="p-7 md:p-8"
            style={{
              background: isDark
                ? `linear-gradient(135deg, rgba(${ORANGE_RGB},0.09) 0%, rgba(6,6,16,0.85) 100%)`
                : `linear-gradient(135deg, rgba(${ORANGE_RGB},0.07) 0%, rgba(255,255,255,0.95) 100%)`,
              border: `1px solid rgba(${ORANGE_RGB},0.28)`,
            }}
          >
            <p
              className="text-[0.62rem] font-black uppercase tracking-[0.32em]"
              style={{ color: ORANGE }}
            >
              Faculty in finalizzazione
            </p>
            <p
              className="mt-3 text-[1rem] leading-[1.65] md:text-[1.05rem]"
              style={{ color: tb }}
            >
              {content.trainerPitch}
            </p>
            <p
              className="mt-4 text-[0.85rem] font-semibold"
              style={{ color: ts }}
            >
              Lascia il tuo interesse: sei tra i primi a essere contattato
              all&rsquo;annuncio.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   HOOK SECTION — big problem statement
─────────────────────────────────────────────────────────────── */
function HookSection({
  content,
  isDark,
}: {
  content: MasterclassContent;
  isDark: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden py-24 md:py-32"
    >
      <div className="absolute inset-0 section-bg" />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, rgba(${ORANGE_RGB},0.05) 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1100px] px-[5%] text-center md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span
            className="mb-7 inline-block text-[0.62rem] font-black uppercase tracking-[0.34em]"
            style={{ color: ORANGE }}
          >
            — Perché questo Master
          </span>

          <p
            className="font-black leading-[1.05] tracking-[-0.022em]"
            style={{
              fontSize: "clamp(1.6rem, 3.6vw, 2.8rem)",
              color: th,
            }}
          >
            <span style={{ color: ORANGE }}>&ldquo;</span>
            {content.hook}
            <span style={{ color: ORANGE }}>&rdquo;</span>
          </p>

          <p
            className="mx-auto mt-9 max-w-2xl text-[1rem] leading-[1.7] md:text-[1.05rem]"
            style={{ color: tb }}
          >
            {content.whatYouLearn}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   CURRICULUM — Modules
─────────────────────────────────────────────────────────────── */
function CurriculumSection({
  content,
  isDark,
}: {
  content: MasterclassContent;
  isDark: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888888";
  const borderSubtle = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardBg = isDark ? "rgba(6,6,16,0.55)" : "rgba(250,250,252,0.7)";
  const numFaint = isDark
    ? `rgba(${ORANGE_RGB},0.18)`
    : `rgba(${ORANGE_RGB},0.32)`;

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden py-24 md:py-32"
    >
      <div className="absolute inset-0 section-bg-alt" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mb-12 md:mb-16"
        >
          <motion.div
            variants={fadeUp}
            className="mb-5 flex items-center gap-3"
          >
            <div
              className="h-px w-8"
              style={{ background: `rgba(${ORANGE_RGB},0.55)` }}
            />
            <span
              className="text-[0.7rem] font-black uppercase tracking-[0.34em]"
              style={{ color: ORANGE }}
            >
              — Il Programma
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="max-w-3xl font-black leading-[1.02] tracking-[-0.025em]"
            style={{
              fontSize: "clamp(2rem, 4.6vw, 3.6rem)",
              color: th,
            }}
          >
            {content.modules.length} moduli.
            <br />
            <span className="gradient-text">Una giornata di profondità.</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-2xl text-[1rem] leading-[1.7]"
            style={{ color: tb }}
          >
            Ogni modulo è progettato per essere applicabile dal lunedì
            successivo. Niente filler — solo contenuto operativo.
          </motion.p>
        </motion.div>

        <div className="flex flex-col gap-4 md:gap-5">
          {content.modules.map((m, i) => (
            <motion.div
              key={m.num}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.1 + i * 0.06,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="group relative overflow-hidden"
              style={{
                background: cardBg,
                border: `1px solid ${borderSubtle}`,
                backdropFilter: "blur(2px)",
              }}
            >
              <div
                className="h-[2px] w-full"
                style={{
                  background: `linear-gradient(90deg, ${ORANGE}, rgba(${ORANGE_RGB},0.05))`,
                }}
              />

              <div className="grid grid-cols-[auto_1fr] gap-5 px-6 py-7 md:gap-10 md:px-10 md:py-9">
                <div className="flex flex-col items-start">
                  <span
                    className="font-black leading-[0.85] tabular-nums tracking-[-0.04em]"
                    style={{
                      fontSize: "clamp(2.6rem, 5.2vw, 4.4rem)",
                      color: numFaint,
                    }}
                  >
                    {m.num}
                  </span>
                  <span
                    className="mt-1 text-[0.6rem] font-black uppercase tracking-[0.32em]"
                    style={{ color: ts }}
                  >
                    Modulo
                  </span>
                </div>
                <div className="min-w-0">
                  <h3
                    className="font-black leading-[1.1] tracking-[-0.02em]"
                    style={{
                      fontSize: "clamp(1.15rem, 2.2vw, 1.6rem)",
                      color: th,
                    }}
                  >
                    {m.title}
                  </h3>
                  <p
                    className="mt-3 max-w-[64ch] text-[0.95rem] leading-[1.65]"
                    style={{ color: tb }}
                  >
                    {m.body}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   OUTCOMES — what you'll be able to do
─────────────────────────────────────────────────────────────── */
function OutcomesSection({
  content,
  isDark,
}: {
  content: MasterclassContent;
  isDark: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";
  const borderSubtle = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden py-20 md:py-28"
    >
      <div className="absolute inset-0 section-bg" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mb-10"
        >
          <motion.div
            variants={fadeUp}
            className="mb-5 flex items-center gap-3"
          >
            <div
              className="h-px w-8"
              style={{ background: `rgba(${ORANGE_RGB},0.55)` }}
            />
            <span
              className="text-[0.7rem] font-black uppercase tracking-[0.34em]"
              style={{ color: ORANGE }}
            >
              — Cosa porti a casa
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="max-w-3xl font-black leading-[1.02] tracking-[-0.025em]"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              color: th,
            }}
          >
            Il giorno dopo, sei un coach diverso.
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-3 md:grid-cols-2"
        >
          {content.outcomes.map((o, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex items-start gap-4 px-5 py-4 md:px-6 md:py-5"
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.025)"
                  : "rgba(0,0,0,0.02)",
                border: `1px solid ${borderSubtle}`,
              }}
            >
              <div
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center"
                style={{
                  background: `rgba(${ORANGE_RGB},0.12)`,
                  border: `1.5px solid rgba(${ORANGE_RGB},0.45)`,
                }}
              >
                <svg
                  viewBox="0 0 16 16"
                  width="11"
                  height="11"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M13.5 4.5L6 12L2.5 8.5"
                    stroke={ORANGE}
                    strokeWidth={2.2}
                    strokeLinecap="square"
                  />
                </svg>
              </div>
              <p
                className="text-[0.95rem] font-semibold leading-[1.5]"
                style={{ color: th }}
              >
                {o}
              </p>
              <span className="ml-auto" style={{ color: tb }} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   AUDIENCE — for who / not for
─────────────────────────────────────────────────────────────── */
function AudienceSection({
  content,
  isDark,
}: {
  content: MasterclassContent;
  isDark: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888888";
  const borderSubtle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden py-20 md:py-28"
    >
      <div className="absolute inset-0 section-bg-alt" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-10"
        >
          <span
            className="mb-5 inline-block text-[0.7rem] font-black uppercase tracking-[0.34em]"
            style={{ color: ORANGE }}
          >
            — Per chi è (e per chi no)
          </span>
          <h2
            className="max-w-3xl font-black leading-[1.02] tracking-[-0.025em]"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              color: th,
            }}
          >
            Sii onesto con te stesso prima di iscriverti.
          </h2>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* For who */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-7 md:p-8"
            style={{
              background: isDark
                ? `linear-gradient(135deg, rgba(${ORANGE_RGB},0.07) 0%, rgba(6,6,16,0.85) 100%)`
                : `linear-gradient(135deg, rgba(${ORANGE_RGB},0.05) 0%, rgba(255,255,255,0.97) 100%)`,
              border: `1px solid rgba(${ORANGE_RGB},0.28)`,
            }}
          >
            <p
              className="mb-4 inline-flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.32em]"
              style={{ color: ORANGE }}
            >
              <span style={{ fontSize: "1rem" }}>✓</span>
              Questo Master fa per te
            </p>
            <ul className="space-y-3">
              {content.forWho.map((line, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="mt-2 inline-block h-1.5 w-1.5 shrink-0"
                    style={{ background: ORANGE }}
                  />
                  <span
                    className="text-[0.95rem] leading-[1.6]"
                    style={{ color: th }}
                  >
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Not for */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-7 md:p-8"
            style={{
              background: isDark
                ? "rgba(6,6,16,0.55)"
                : "rgba(250,250,252,0.7)",
              border: `1px solid ${borderSubtle}`,
            }}
          >
            <p
              className="mb-4 inline-flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.32em]"
              style={{ color: ts }}
            >
              <span style={{ fontSize: "1rem" }}>✗</span>
              Non fa per te se
            </p>
            <ul className="space-y-3">
              {content.notFor.map((line, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="mt-2 inline-block h-1.5 w-1.5 shrink-0"
                    style={{ background: ts }}
                  />
                  <span
                    className="text-[0.95rem] leading-[1.6]"
                    style={{ color: tb }}
                  >
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   VALUE STACK / INCLUDED + Pricing card
─────────────────────────────────────────────────────────────── */
function ValueStackSection({
  workshop,
  content,
  priceLabel,
  isTbd,
  isDark,
  onBuy,
}: {
  workshop: Workshop;
  content: MasterclassContent;
  priceLabel: string | null;
  isTbd: boolean;
  isDark: boolean;
  onBuy: () => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888888";
  const borderSubtle = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden py-24 md:py-32"
    >
      <div className="absolute inset-0 section-bg" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        <div className="grid gap-8 md:gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Included list */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span
              className="mb-5 inline-block text-[0.7rem] font-black uppercase tracking-[0.34em]"
              style={{ color: ORANGE }}
            >
              — Cosa è incluso
            </span>
            <h2
              className="font-black leading-[1.02] tracking-[-0.025em]"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                color: th,
              }}
            >
              Tutto quello che serve.
              <br />
              <span className="gradient-text">Niente di superfluo.</span>
            </h2>

            <ul className="mt-8 space-y-3">
              {content.included.map((line, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 px-5 py-4"
                  style={{
                    background: isDark
                      ? "rgba(255,255,255,0.025)"
                      : "rgba(0,0,0,0.02)",
                    border: `1px solid ${borderSubtle}`,
                  }}
                >
                  <span
                    className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center"
                    style={{ color: ORANGE }}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      width="14"
                      height="14"
                      aria-hidden
                    >
                      <path
                        d="M13.5 4.5L6 12L2.5 8.5"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        strokeLinecap="square"
                      />
                    </svg>
                  </span>
                  <span
                    className="text-[0.95rem] leading-[1.55]"
                    style={{ color: th }}
                  >
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Pricing card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="self-start lg:sticky lg:top-28"
          >
            <div
              className="overflow-hidden"
              style={{
                background: isDark
                  ? `linear-gradient(135deg, rgba(${ORANGE_RGB},0.09) 0%, rgba(6,6,16,0.92) 80%)`
                  : `linear-gradient(135deg, rgba(${ORANGE_RGB},0.07) 0%, rgba(255,255,255,0.98) 80%)`,
                border: `1px solid rgba(${ORANGE_RGB},0.32)`,
                boxShadow: `0 0 60px rgba(${ORANGE_RGB},0.06)`,
              }}
            >
              <div
                className="h-[2px] w-full"
                style={{
                  background: `linear-gradient(90deg, ${ORANGE}, rgba(${ORANGE_RGB},0.05))`,
                }}
              />
              <div className="p-7 md:p-8">
                <p
                  className="text-[0.6rem] font-black uppercase tracking-[0.32em]"
                  style={{ color: ORANGE }}
                >
                  {isTbd ? "Edizione 2026/27 · TBD" : "Edizione 2026/27"}
                </p>
                <p
                  className="mt-2 text-[0.95rem] font-bold"
                  style={{ color: th }}
                >
                  {workshop.title}
                </p>

                <div className="mt-6">
                  <span
                    className="text-[0.6rem] font-black uppercase tracking-[0.32em]"
                    style={{ color: ts }}
                  >
                    {isTbd ? "Prezzo in definizione" : "Singolo masterclass"}
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span
                      className="text-[clamp(2.4rem,5vw,3.4rem)] font-black leading-none tracking-[-0.025em] tabular-nums"
                      style={{ color: th }}
                    >
                      {priceLabel ?? "TBD"}
                    </span>
                    {!isTbd && (
                      <span
                        className="text-[0.7rem] font-bold uppercase tracking-[0.16em]"
                        style={{ color: ts }}
                      >
                        IVA incl.
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={onBuy}
                  className="mt-7 inline-flex w-full items-center justify-between gap-3 px-6 py-4 text-[0.78rem] font-black uppercase tracking-[0.16em] transition-all duration-200 hover:opacity-90"
                  style={{ background: ORANGE, color: "#111" }}
                >
                  <span>{isTbd ? "Lascia interesse" : "Riserva ora"}</span>
                  <span aria-hidden className="text-base">
                    →
                  </span>
                </button>

                <Link
                  href="/pack"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 px-6 py-3 text-[0.7rem] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
                  style={{
                    color: th,
                    border: `1px solid ${borderSubtle}`,
                  }}
                >
                  <span>Includilo nel pack PRO/ELITE</span>
                </Link>

                <p
                  className="mt-5 text-[0.7rem] leading-[1.55]"
                  style={{ color: ts }}
                >
                  {isTbd
                    ? "Lasciando interesse hai priorità sull'edizione 2026/27 e ricevi date e prezzo prima del pubblico."
                    : "Posti limitati per garantire qualità formativa. Conferma vincolata? No: paghi solo a iscrizione confermata."}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   FAQ
─────────────────────────────────────────────────────────────── */
function FaqAccordion({
  items,
  isDark,
}: {
  items: FaqItem[];
  isDark: boolean;
}) {
  const [open, setOpen] = useState<number | null>(0);
  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888888";
  const borderSubtle = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  return (
    <div className="flex flex-col">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{ borderBottom: `1px solid ${borderSubtle}` }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-1 py-5 text-left transition-opacity hover:opacity-80 md:py-6"
            >
              <span
                className="text-[0.95rem] font-bold leading-tight md:text-[1.05rem]"
                style={{ color: th }}
              >
                {it.q}
              </span>
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center text-[1rem] font-black transition-transform duration-300"
                style={{
                  color: ORANGE,
                  border: `1.5px solid rgba(${ORANGE_RGB},0.4)`,
                  transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                }}
                aria-hidden
              >
                +
              </span>
            </button>
            <motion.div
              initial={false}
              animate={{
                height: isOpen ? "auto" : 0,
                opacity: isOpen ? 1 : 0,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ overflow: "hidden" }}
            >
              <p
                className="px-1 pb-6 text-[0.9rem] leading-[1.7] md:text-[0.95rem]"
                style={{ color: tb }}
              >
                {it.a}
              </p>
            </motion.div>
            <span style={{ display: "none" }}>{ts}</span>
          </div>
        );
      })}
    </div>
  );
}

function FaqSection({
  content,
  isDark,
}: {
  content: MasterclassContent;
  isDark: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden py-20 md:py-28"
    >
      <div className="absolute inset-0 section-bg-alt" />

      <div className="relative z-10 mx-auto max-w-[960px] px-[5%] md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-10"
        >
          <span
            className="mb-5 inline-block text-[0.7rem] font-black uppercase tracking-[0.34em]"
            style={{ color: ORANGE }}
          >
            — Domande frequenti
          </span>
          <h2
            className="font-black leading-[1.02] tracking-[-0.025em]"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              color: th,
            }}
          >
            Tutto quello che ti serve sapere.
          </h2>
          <p
            className="mt-4 text-[0.95rem] leading-[1.65]"
            style={{ color: tb }}
          >
            Non trovi risposta?{" "}
            <Link
              href="/account"
              className="underline"
              style={{ color: ORANGE }}
            >
              Scrivici
            </Link>{" "}
            — rispondiamo entro 24 ore.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <FaqAccordion items={content.faq} isDark={isDark} />
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   FINAL CTA
─────────────────────────────────────────────────────────────── */
function FinalCTA({
  workshop,
  content,
  priceLabel,
  isTbd,
  isDark,
  onBuy,
}: {
  workshop: Workshop;
  content: MasterclassContent;
  priceLabel: string | null;
  isTbd: boolean;
  isDark: boolean;
  onBuy: () => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888888";
  const borderSubtle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden py-24 md:py-32"
    >
      <div className="absolute inset-0 section-bg" />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, rgba(${ORANGE_RGB},0.08) 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1100px] px-[5%] text-center md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span
            className="mb-6 inline-block text-[0.7rem] font-black uppercase tracking-[0.34em]"
            style={{ color: ORANGE }}
          >
            — {isTbd ? "Lista interesse" : "Riserva il tuo posto"}
          </span>

          <h2
            className="mx-auto max-w-[24ch] font-black leading-[0.98] tracking-[-0.025em]"
            style={{
              fontSize: "clamp(2rem, 5.4vw, 4rem)",
              color: th,
            }}
          >
            <span className="gradient-text">{content.finalHook}</span>
          </h2>

          <p
            className="mx-auto mt-6 max-w-2xl text-[1rem] leading-[1.7] md:text-[1.05rem]"
            style={{ color: tb }}
          >
            {isTbd
              ? "Lasciando interesse oggi, hai priorità non appena le date e il prezzo saranno confermati."
              : "I posti per i Master Lacertosus si esauriscono ogni anno con largo anticipo. Bloccare oggi ti garantisce il posto e il prezzo edizione 2026/27."}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={onBuy}
              className="inline-flex min-w-[280px] items-center justify-between gap-3 px-7 py-4 text-[0.78rem] font-black uppercase tracking-[0.16em] transition-all duration-200 hover:opacity-90"
              style={{ background: ORANGE, color: "#111" }}
            >
              <span>
                {isTbd
                  ? "Lascia il tuo interesse"
                  : `Riserva · ${priceLabel ?? ""}`}
              </span>
              <span aria-hidden className="text-base">
                →
              </span>
            </button>
            <Link
              href="/pack"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 text-[0.74rem] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
              style={{
                color: th,
                border: `1px solid ${borderSubtle}`,
              }}
            >
              <span>Vai ai pack PRO/ELITE</span>
            </Link>
          </div>

          <p
            className="mt-6 text-[0.7rem] font-semibold tracking-[0.04em]"
            style={{ color: ts }}
          >
            Edizione 2026/27 · {workshop.duration} · 100% in presenza
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   STICKY BOTTOM BAR
─────────────────────────────────────────────────────────────── */
function StickyBottomBar({
  workshop,
  priceLabel,
  isTbd,
  visible,
  onBuy,
}: {
  workshop: Workshop;
  priceLabel: string | null;
  isTbd: boolean;
  visible: boolean;
  onBuy: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: visible ? 0 : 100 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 md:px-5 md:pb-5"
      aria-hidden={!visible}
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <div
        className="mx-auto flex max-w-[1080px] items-center justify-between gap-3 px-4 py-3 md:px-6"
        style={{
          background: "rgba(10,10,20,0.92)",
          border: `1px solid rgba(${ORANGE_RGB},0.28)`,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        }}
      >
        <div className="min-w-0 flex flex-col">
          <span
            className="text-[0.55rem] font-bold uppercase tracking-[0.18em]"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Masterclass
          </span>
          <span
            className="truncate text-[0.95rem] font-black leading-tight md:text-[1.05rem]"
            style={{ color: "#fff" }}
          >
            {workshop.title}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span
            className="hidden text-[1rem] font-black tabular-nums sm:inline"
            style={{ color: "#fff" }}
          >
            {priceLabel ?? "TBD"}
          </span>
          <button
            onClick={onBuy}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-[0.7rem] font-black uppercase tracking-[0.14em] transition-opacity hover:opacity-90 sm:px-5 sm:py-3"
            style={{ background: ORANGE, color: "#111" }}
          >
            <span>{isTbd ? "Interesse" : "Riserva"}</span>
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────
   OTHER MASTERCLASS
─────────────────────────────────────────────────────────────── */
function OtherMasterclass({
  others,
  isDark,
}: {
  others: Workshop[];
  isDark: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888888";
  const borderSubtle = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardBg = isDark ? "rgba(6,6,16,0.55)" : "rgba(250,250,252,0.7)";

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden py-20 md:py-24"
    >
      <div className="absolute inset-0 section-bg-alt" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-end justify-between gap-3"
        >
          <div>
            <span
              className="mb-3 inline-block text-[0.7rem] font-black uppercase tracking-[0.34em]"
              style={{ color: ORANGE }}
            >
              — Altri Masterclass
            </span>
            <h2
              className="font-black leading-[1.02] tracking-[-0.02em]"
              style={{
                fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
                color: th,
              }}
            >
              Esplora gli altri 7 Master.
            </h2>
          </div>
          <Link
            href="/masterclass"
            className="hidden whitespace-nowrap text-[0.7rem] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-70 md:inline"
            style={{ color: ORANGE }}
          >
            Tutti i Master →
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.slice(0, 6).map((w, i) => {
            const c = CONTENT[w.slug];
            return (
              <motion.div
                key={w.slug}
                initial={{ opacity: 0, y: 18 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.05 + i * 0.05 }}
              >
                <Link href={`/masterclass/${w.slug}`} className="group block">
                  <div
                    className="overflow-hidden p-6 transition-all duration-300 group-hover:-translate-y-[2px]"
                    style={{
                      background: cardBg,
                      border: `1px solid ${borderSubtle}`,
                    }}
                  >
                    <div
                      className="mb-4 -mx-6 -mt-6 h-[2px] w-[calc(100%+3rem)]"
                      style={{
                        background: `linear-gradient(90deg, ${ORANGE}, rgba(${ORANGE_RGB},0.05))`,
                      }}
                    />
                    <span
                      className="mb-3 inline-block text-[0.6rem] font-black uppercase tracking-[0.28em]"
                      style={{ color: ORANGE }}
                    >
                      {c?.domain ?? "Master"}
                    </span>
                    <h3
                      className="mb-2 text-[1.05rem] font-black leading-tight tracking-[-0.01em] transition-colors group-hover:text-[#F09226]"
                      style={{ color: th }}
                    >
                      {w.title}
                    </h3>
                    <p
                      className="mb-4 text-[0.85rem] leading-[1.55]"
                      style={{ color: tb }}
                    >
                      {c?.trainerHeadline ?? w.trainerLabel}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[0.62rem] font-bold uppercase tracking-[0.2em]"
                        style={{ color: ts }}
                      >
                        {w.duration}
                      </span>
                      <span
                        className="text-[0.85rem] font-black"
                        style={{ color: ORANGE }}
                      >
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   ENTRY
─────────────────────────────────────────────────────────────── */
interface WorkshopDetailProps {
  workshop: Workshop;
  otherWorkshops: Workshop[];
}

export function WorkshopDetail({
  workshop,
  otherWorkshops,
}: WorkshopDetailProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const product = getMasterclassProducts().find(
    (p) => p.workshopSlug === workshop.slug,
  );
  const isTbd = workshop.tbd || !product || product.priceCents === 0;
  const priceLabel =
    !isTbd && product ? formatPriceClean(product.priceCents) : null;

  const content = CONTENT[workshop.slug] ?? {
    domain: "Masterclass",
    hook: workshop.focus,
    trainerHeadline: workshop.trainerLabel,
    trainerPitch: workshop.focus,
    whatYouLearn: workshop.focus,
    modules: [],
    outcomes: [],
    forWho: [],
    notFor: [],
    included: [],
    faq: [],
    finalHook: workshop.title,
  };

  const scrolled = useScrolledPast(680);

  async function handleBuy() {
    if (isTbd || !product) {
      window.location.href = `/account?intent=${encodeURIComponent(workshop.slug)}`;
      return;
    }
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const dest = `/checkout?pack=${product.slug}`;
    if (!user) {
      localStorage.setItem("pending_checkout", dest);
      window.location.href = `/auth/register?next=${encodeURIComponent(dest)}`;
      return;
    }
    window.location.href = dest;
  }

  return (
    <>
      <HeroSection
        workshop={workshop}
        content={content}
        priceLabel={priceLabel}
        isTbd={isTbd}
        onBuy={handleBuy}
      />

      <TrainerSpotlight workshop={workshop} content={content} isDark={isDark} />

      <HookSection content={content} isDark={isDark} />

      {content.modules.length > 0 && (
        <CurriculumSection content={content} isDark={isDark} />
      )}

      {content.outcomes.length > 0 && (
        <OutcomesSection content={content} isDark={isDark} />
      )}

      {content.forWho.length > 0 && content.notFor.length > 0 && (
        <AudienceSection content={content} isDark={isDark} />
      )}

      <ValueStackSection
        workshop={workshop}
        content={content}
        priceLabel={priceLabel}
        isTbd={isTbd}
        isDark={isDark}
        onBuy={handleBuy}
      />

      {content.faq.length > 0 && (
        <FaqSection content={content} isDark={isDark} />
      )}

      <FinalCTA
        workshop={workshop}
        content={content}
        priceLabel={priceLabel}
        isTbd={isTbd}
        isDark={isDark}
        onBuy={handleBuy}
      />

      <OtherMasterclass others={otherWorkshops} isDark={isDark} />

      <StickyBottomBar
        workshop={workshop}
        priceLabel={priceLabel}
        isTbd={isTbd}
        visible={scrolled}
        onBuy={handleBuy}
      />
    </>
  );
}
