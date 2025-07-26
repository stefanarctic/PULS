// Helper to create links, so I don't have to write HTML everywhere
const createLink = (text, url) => `<a href="${url}" class="assistant-link">${text}</a>`;

export const knowledgeBase = [
    // --- Social & Personality ---
    {
        keywords: ["salut", "bună", "noroc", "hey", "hello", "ciao"],
        response: "Salut! Eu sunt Profesorul Whiz. Cu ce te pot ajuta astăzi?",
    },
    {
      keywords: ["merci", "multumesc", "multam", "mersi"],
      response: "Cu multa placere! Daca mai ai nevoie de ajutor, nu ezita sa intrebi!",
    },
    {
        keywords: ["cum te cheamă", "care e numele tău", "cine ești", "cum te numesti", "cum te cheama", "cine esti"],
        response: "Numele meu este Profesorul Whiz, expertul tău în fizică pe platforma PULS.",
    },
    {
        keywords: ["ce mai faci", "cum ești", "how are you", "cum o mai duci", "cum o duci", "ce faci"],
        response: "Sunt un program, deci nu am sentimente, dar sunt gata să te ajut cu orice întrebare despre fizică! Cum te pot asista?",
    },
    {
        keywords: ["ziua ta", "zi", "ziua", "in rest"],
        response: "Ziua mea este mereu bună când pot ajuta pe cineva să înțeleagă fizica! Hai să vedem ce te interesează.",
    },
    {
      keywords: ["vremea", "afara", "vreme"],
      response: "Vremea este frumoasa, cu averse de PULS...",
    },
    {
      keywords: ["da hai", "da", "hai", "hai sa mergem", "hai sa incepem", "hai sa incepem"],
      response: "Ce vrei sa invatam astazi?",
    },
    {
      keywords: ["nu stiu", "ce imi recomanzi", "ce sa invat"],
      response: "Poti sa incepi cu lecțiile de fizică, sau poți să începi cu simulările noastre. Daca ai nevoie de ajutor, nu ezita să intrebi!",
   },

    // --- Site Content & Navigation ---
    {
        keywords: ["pendul","pend", "pen", "pndul", "pendu", "pendl", "penduul", "pendull", "pendlum", "pendulm", "pendulum", "pendulum simplu",
          "oscilație", "oscillatie", "oscillation", "oscilatie", "oscill", "osc", "oscil", "oscila", "oscilat", "oscillate", "oscillating",
          "pendulum physics", "pendulum experiment", "pendulum simulation", "pendulum sim", "pendulum fizica", "pendulum experimente"],
        response: `Avem o secțiune întreagă dedicată pendulelor! Poți explora lecții și simulări interactive ${createLink("aici", "/resurse/pendule")}.`
    },
    {
        keywords: ["unde", "unda", "und", "vibrație", "vibratie", "vibratii", "vibrations", "vibra", "vibrat", "wav", "wavw", "wvae", "wve"],
        response: `Sigur, poți învăța totul despre unde și poți vedea simulări vizuale ${createLink("chiar aici", "/resurse/unde")}.`
    },
    {
        keywords: ["lissajous", "lissajou", "lisa", "liss", "figuri", "figura", "oscilloscope", "oscilloscop",
                "lisajous", "lisajou", "lisajus", "lisajus", "lisaj", "lissaj"],
        response: `Figurile Lissajous sunt fascinante! Avem o lecție dedicată și o simulare interactivă. Le găsești ${createLink("aici", "/resurse/lissajous")}.`
    },
    {
        keywords: ["seism", "cutremur", "earthquake", "sei", "seis","cutremr", "cutrem", "cutre", "cutr",],
        response: `Poți învăța despre undele seismice și cum se propagă acestea în secțiunea noastră dedicată. Găsești mai multe informații ${createLink("aici", "/resurse/seism")}.`
    },
    {
        keywords: ["simulări", "simulare", "simulări", "sim", "simul"],
        response: `Avem o colecție de simulări interactive pentru diverse fenomene fizice. Le poți explora pe toate pe ${createLink("pagina de simulări", "/simulari")}.`
    },
    {
        keywords: ["probleme", "exerciții","problema", "exercițiu", "exercise", "test", "quiz", "intrebare", 
          "question", "ex", "exerciti", "exercit"],
        response: `Cauți probleme de fizică? Ai nimerit unde trebuie! Avem o listă variată de probleme pe care le poți filtra după dificultate și categorie. Încearcă-le ${createLink("aici", "/probleme")}.`
    },
    {
        keywords: ["resurse", "lecții", "formule", "resursa", "resource", "materiale", "material", "manual", "ghid", "pdf", "documentatie", "doc",
                "resurce", "resur", "res", "resouce", "resoruce"],
        response: `Toate resursele noastre educaționale, inclusiv lecții, formule și experimente video, sunt adunate într-un singur loc. Le poți accesa ${createLink("aici", "/resurse")}.`
    },

    // --- Specific Topics ---
    {
        keywords: ["mecanică"],
        response: `Momentan, la capitolul mecanică avem o varietate de ${createLink("probleme", "/probleme?category=Mecanică")}. Nu avem încă o secțiune de resurse teoretice dedicată, dar plănuim să adăugăm una în viitor!`
    },
    {
        keywords: ["optică", "lentile", "oglinzi"],
        response: "Subiectul optică este foarte interesant, însă, din păcate, momentan nu avem conținut despre acest capitol pe platforma noastră."
    },
    {
        keywords: ["termodinamică", "căldură"],
        response: "Momentan, platforma P.U.L.S. este axată pe Pendule, Unde, Lissajous și Seisme. Nu avem conținut despre termodinamică."
    },
    {
        keywords: ["electricitate", "curent", "magnetism"],
        response: "Subiectele legate de electricitate și magnetism sunt esențiale în fizică, dar momentan nu sunt acoperite pe platforma noastră, care se concentrează pe fenomene oscilatorii și unde."
    },


    // --- General Info & Support ---
    {
        keywords: ["despre", "creator", "echipa"],
        response: `Platforma P.U.L.S a fost creată de o echipă de elevi pasionați de știință, cu scopul de a face fizica mai interactivă și mai ușor de înțeles. Poți citi povestea completă pe pagina ${createLink("Despre noi", "/about-us")}.`
    },
    {
      keywords: ["profesor", "coordonator", "scoala", "prof", "cadru", "didactic", "bebu", "bianca", "bianka", "ioana"],
      response: `Platforma de fizica PULS este coordonata de doamna Bebu Bianka Ioana, profesor de fizica la liceul CNMB, Valcea.`
    },
    {
      keywords: ["elevi", "developeri", "informaticieni", "ingineri", "sistem", "copii", "invatacei", "studenti", "coderi", "oameni"],
      response: `Platforma de fizica PULS este facuta de developerii, Bajean Mateo si Drosu Stefan, elevi ai liceului CNMB Valcea.`
    },
    {
      keywords: ["experimentator", "fizician", "asistent", "colaborare", "colaborator", "asistent virtual"],
      response: `Platforma de fizica PULS este facuta cu ajutorul colaboratorului Bebu Ion, profesor de fizica, experimentator si asistent.`
    },
    {
      keywords: ["tehnic", "informatica", "diriginte"],
      response: `Platforma de fizica PULS este facuta cu ajutorul domnului Dumitrescu Ovidiu Mihail, profesor de informatica la liceul CNMB Valcea.`
    },
    {
      keywords: ["whiz", "virtual", "rizz"],
      response: `Da, acela este numele meu,profesorul Whiz, asistentul virtual al platformei PULS.`
    },
    {
      keywords: ["gras", "slab", "urat", "prost", "idiot", "imbecil", "capsec", "cacanar", "chel"],
      response: `As putea spune la fel despre tine! Ha ha! Fizica se face cu spor si voie buna, fara critici! Hai sa continuam! Cu ce te pot ajuta?`
    },
    {
      keywords: ["frumos", "chipes", "intelectual", "destept", "smart", "klug", "interesant", "comic", "tare", "super", "superb"],
      response: `Mersi frumos de compliment. Si tu la fel! Acum hai sa continuam calatoria noastra in lumea fizicii.`
    },
    {
      keywords: ["mos", "batran", "in varsta"],
      response: `Am crescut, ca si tine. Sa sti ca sunt frumos, chipes si inteligent chiar si la varsa aceasta.`
    },
    {
        keywords: ["contact", "email", "mail", "suport", "support", "suna"],
        response: `Pentru orice întrebare sau colaborare, ne poți scrie la adresa de email: <a href="mailto:pulsphysics@gmail.com" class="assistant-link">pulsphysics@gmail.com</a>.`
    },
    {
        keywords: ["bug", "eroare", "problemă", "sugestie", "feedback", "conecta"],
        response: (query) => {
            const grave = ["crash", "fatal", "nu funcționează", "nu pot accesa", "nu pot folosi", "nu pot intra", "nu pot deschide"];
            const isGrave = grave.some(kw => query.toLowerCase().includes(kw));
            if (isGrave || query.toLowerCase().includes("problemă gravă")) {
                return `Se pare că întâmpini o problemă serioasă. Cel mai bine este să ne scrii direct la <a href="mailto:pulsphysics@gmail.com" class="assistant-link">pulsphysics@gmail.com</a> pentru a primi ajutor rapid.`;
            }
            return "Mulțumim pentru feedback! Vom analiza sugestia sau problema raportată. Dacă este ceva urgent, te rugăm să ne contactezi pe adresa de email.";
        }
    }
];

// List of other names that could trigger the "annoyed" response.
const OTHER_NAMES = ["gigel", "costel", "ion", "vasile", "gpt", "chatgpt", "copilot", "gemini", "bard"];

export const searchKnowledgeBase = (query) => {
    const lowerCaseQuery = query.toLowerCase();

    let response = null;

    // Check for annoyed state
    const calledAnotherName = OTHER_NAMES.some(name => lowerCaseQuery.includes(name));
    if (calledAnotherName && !lowerCaseQuery.includes("whiz")) {
        response = "Numele meu este Profesorul Whiz! Te rog să reții acest lucru. Acum, să revenim... ";
    }

    // Find a matching keyword
    for (const item of knowledgeBase) {
        if (item.keywords.some(keyword => lowerCaseQuery.includes(keyword))) {
            const result = typeof item.response === 'function' ? item.response(query) : item.response;
            if (response) {
                // Prepend the annoyed message
                response += result;
            } else {
                response = result;
            }
            return response;
        }
    }

    if (response) {
        // This means the user called him another name but didn't match any other keyword
        return response + "Cum te pot ajuta?";
    }

    // Default response if no match
    return "Îmi pare rău, nu am găsit informații despre acest subiect. Ai putea, te rog, să reformulezi întrebarea? Poți încerca să folosești cuvinte cheie precum 'pendul', 'probleme' sau 'simulări'.";
}; 