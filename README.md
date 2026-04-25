# PULS - Platformă Educațională pentru Fizică Interactivă

**PULS** este o platformă web educațională modernă dedicată studiului fizicii, cu accent pe fenomene oscilatorii, unde, pendule, figuri Lissajous și seisme. Oferă simulări interactive, probleme de fizică cu rezolvări, resurse teoretice și un sistem de autoevaluare cu feedback AI personalizat.

## 🌟 Caracteristici principale

### 🔬 Simulări interactive (37 simulări)
- **Pendule**: Pendul simplu, pendul amortizat, pendul neliniar, penduluri multiple
- **Oscilații**: Mișcări oscilatorii pe OX și OY, grafice armonice
- **Unde**: Unde în apă, propagarea undelor
- **Figuri Lissajous**: Simulare cu frecvențe și faze ajustabile
- **Seisme**: Modelare undelor seismice și efectele asupra structurilor
- **Optica**: Prisma, lentilă subțire, refracție atmosferică
- **Electricitate**: Circuite electrice, energie în circuite
- **Termodinamică**: Gaz ideal, motoare termice (ciclu Otto, Diesel, Carnot)
- **Mecanică**: Plan înclinat, coliziuni inelastice, mișcarea proiectilului
- **Grafice**: Funcții matematice, grafice simple și complexe
- **Modernă / avansat**: Vizualizator 4D, legi Kepler, atomul de hidrogen, experiența Michelson–Morley, interferență (dublă fantă), tunelare cuantică, spectrul electromagnetic, curent alternativ, Kirchhoff, laser, tabel periodic

### 📚 Probleme de fizică
- **Probleme BAC**: Colecție completă de probleme din examenele de bacalaureat
- **Grile**: Întrebări tip grilă cu pagină dedicată și navigare pe item
- **Probleme individuale**: Probleme detaliate cu rezolvări pas cu pas
- **Auto-evaluare**: Sistem de corectare automată cu feedback instant
- **Tracking progres**: Urmărire a problemelor rezolvate per utilizator
- **Categorii**: Organizare pe domenii (mecanică, electricitate, optică, termodinamică)

### 🤖 Asistent AI 3D integrat
- **Asistent vizual**: Avatar 3D interactiv (Three.js/React Three Fiber)
- **Chat (flux principal)**: Mesajele merg către o **automatizare n8n** găzduită la `automations.puls-fizica.ro`; workflow-ul folosește **Groq** cu modelul **Llama 4 Scout** (`meta-llama/llama-4-scout-17b-18b-instruct`) și poate injecta context din documentație, README și sitemap al site-ului pentru răspunsuri mai precise.
- **Puls AI (API separat, specializat pe fizică)**: Serviciu antrenat/orientat pe fizică, cu endpoint-uri precum **analiză** și **rezolvare**. Când utilizatorul trimite o lucrare la **review** (ex. din formularul de trimitere soluție), aplicația apelează endpoint-ul de **analiză**. Când conversația sau acțiunea utilizatorului vizează **rezolvarea** unei probleme, automatizarea n8n poate delega către **Puls AI** (inclusiv endpoint-ul de rezolvare), astfel încât explicațiile de fizică să vină de la motorul dedicat, nu de la modelul general al chat-ului.
- **Separare clară**: Chat-ul obișnuit rulează prin n8n/Groq; verificarea și rezolvarea „la carte” de fizică trec prin **Puls AI** când fluxul o cere.

### 🎮 Gamificare și realizări
- **Sistem de realizări (Achievements)**: Badge-uri pentru progres
- **Statistici utilizator**: Dashboard cu progres personal
- **Profil utilizator**: Istoric probleme rezolvate și realizări

### 📖 Resurse educaționale
- **Resurse teoretice**: Formule, explicații, video-uri
- **Categorii**: Pendule, unde, lissajous, seism, termodinamică, mecanică, electricitate, optică, matematică, astronomie, atom, fizică cuantică
- **Conținut multimedia**: Video-uri, animații, grafice interactive

### 🌐 Funcționalități platformă
- **Internaționalizare**: Suport pentru română (RO) și engleză (EN)
- **Dark Mode**: Mod întunecat/clar pentru interfață
- **Design responsiv**: Optimizat pentru desktop, tabletă și mobil
- **Căutare**: Sistem de căutare pentru probleme și resurse
- **Profil utilizator**: Autentificare și gestionare cont (Firebase Auth)
- **Admin Dashboard**: Panou de administrare pentru gestionarea conținutului
- **Clase (profesor & elev)**: Dashboard profesor, pagină clasă, invitații, alăturare cu cod/link; elevi văd cursurile lor din `/clasa`

## 🛠️ Stack tehnologic

### Frontend
- **React 19** - Framework UI modern
- **Vite 6** - Build tool rapid
- **React Router 7** - Navigare SPA
- **Redux Toolkit** - Gestionare state global
- **SCSS (Sass)** - Stilizare modulară
- **Lucide React** - Iconițe moderne

### 3D & Graphics
- **@react-three/fiber** - React renderer pentru Three.js
- **@react-three/drei** - Helpers pentru Three.js
- **Recharts** - Grafice și diagrame
- **MathJax** - Renderizare formule matematice (LaTeX)

### Backend & Services
- **Firebase** - Autentificare și Firestore (bază de date)
- **Firebase Admin** - Operări server-side (inclusiv scripturi de mentenanță date)
- **Automatizare n8n** (`automations.puls-fizica.ro`) - orchestrare chat asistent; model **Groq** Llama 4 Scout
- **Puls AI API** - analiză și rezolvare probleme de fizică (apelat din site la review și, prin workflow, la rezolvare)
- **Cloudinary** - Gestionare imagini
- **ImageKit** - Optimizare și delivery imagini

### Deployment & DevOps
- **Vercel** - Hosting și deployment automat
- **Git** - Control versiuni
- **ESLint** - Linting cod

### Alte librării
- **react-markdown** - Renderizare markdown
- **remark-math / rehype-mathjax** - Suport formule matematice în markdown
- **jQuery** - Utilități DOM (legacy)

## 📁 Structura proiectului

```
PULS/
├── src/
│   ├── components/          # Componente React
│   │   ├── pages/          # Pagini route-level
│   │   │   ├── resurse/    # Pagini resurse pe categorii
│   │   │   └── ...
│   │   ├── Assistant3DViewer.jsx
│   │   ├── AssistantAvatar.jsx
│   │   ├── Navbar.jsx
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── useAssistant.js
│   │   ├── useDarkMode.js
│   │   ├── useSolvedProblems.js
│   │   └── ...
│   ├── lib/                # Utilități și configurații
│   │   ├── firebase.js
│   │   ├── cloudinary.js
│   │   └── ...
│   ├── features/           # Redux slices
│   │   └── problems/
│   ├── data/              # Date statice
│   │   ├── simulations.js
│   │   └── bacProblems.js
│   ├── scss/              # Stiluri SCSS
│   │   ├── components/
│   │   ├── common/
│   │   └── style.scss
│   ├── App.jsx            # Componenta principală + routing
│   ├── main.jsx           # Entry point React
│   └── store.js           # Redux store
├── public/
│   ├── simulari/          # Simulări HTML/JS statice
│   ├── models/            # Modele 3D (GLB)
│   ├── res/               # Resurse (imagini, video)
│   ├── translations/      # Fișiere traduceri (ro.json, en.json)
│   └── ...
├── api/                   # Serverless API (Vercel): proxy chat → n8n, etc.
│   ├── assistant/
│   └── webhook/           # ex. chat → https://automations.puls-fizica.ro/webhook/chat
├── extracted_problems/    # Probleme extrase (JSON)
└── ...
```

## 🚀 Instalare și configurare

### Cerințe
- Node.js 18+ și npm
- Cont Firebase (pentru autentificare și bază de date)
- Cont Cloudinary/ImageKit (opțional, pentru imagini)

*Scripturile Node din root (extragere/upload probleme BAC, grile, backup etc.) sunt unelte opționale pentru mentenanța conținutului și a bazei de date; nu sunt necesare pentru a rula aplicația în mod normal.*

### Instalare

```bash
# Clonează repository-ul
git clone https://github.com/Stefanarctic/PULS.git
cd PULS

# Instalează dependențele
npm install

# Rulează serverul de dezvoltare
npm run dev
```

Aplicația va fi disponibilă la `http://localhost:8000`

### Configurare variabile de mediu

Creează un fișier `.env` în root-ul proiectului:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary (opțional)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret

# ImageKit (opțional)
VITE_IMAGEKIT_URL_ENDPOINT=your_imagekit_url
VITE_IMAGEKIT_PUBLIC_KEY=your_public_key
```

### Build pentru producție

```bash
# Construiește aplicația
npm run build

# Preview build-ul local
npm run preview
```

## 📜 Scripturi disponibile

```bash
npm run dev              # Rulează server de dezvoltare
npm run build            # Construiește pentru producție
npm run preview          # Preview build producție
npm run lint             # Rulează ESLint

# Opțional — mentenanță conținut / date (dezvoltatori)
npm run extract-bac      # Extrage probleme BAC
npm run upload-bac       # Încarcă probleme BAC în Firebase
npm run backup-db        # Backup bază de date Firebase
npm run clean-problems   # Curăță conținut probleme
npm run upload-cleaned   # Încarcă probleme curățate
npm run remove-duplicates # Elimină duplicate
npm run upload-grile      # Încarcă grile în Firebase
npm run screenshot-simulations # Capturi ecran simulări (Puppeteer)
```

## 🗺️ Routing

Principalele rute ale aplicației:

- `/` - Pagina principală (Index)
- `/probleme` - Lista probleme
- `/probleme/bac` - Probleme BAC
- `/probleme/grile` - Grile
- `/probleme/grile/:id` - Grilă individuală
- `/probleme/:id` - Problemă individuală
- `/simulari` - Lista simulări
- `/simulare/:slug` - Simulare individuală (37 simulări)
- `/resurse` - Resurse educaționale
- `/resurse/pendule` - Resurse pendule
- `/resurse/unde` - Resurse unde
- `/resurse/lissajous` - Resurse Lissajous
- `/resurse/seism` - Resurse seism
- `/resurse/termodinamica` - Resurse termodinamică
- `/resurse/mecanica` - Resurse mecanică
- `/resurse/electricitate` - Resurse electricitate
- `/resurse/optica` - Resurse optică
- `/resurse/matematica` - Resurse matematică
- `/resurse/astronomie` - Resurse astronomie
- `/resurse/atomul` - Resurse atom
- `/resurse/fizica-cuantica` - Resurse fizică cuantică
- `/asistent` - Intrare asistent AI
- `/profil` - Profil utilizator
- `/invite-teacher` - Invitație profesor
- `/profesor` - Dashboard profesor
- `/profesor/clasa/:classId` - Gestionare clasă (profesor)
- `/clasa/intra` - Alăturare clasă (cod/link)
- `/clasa` - Clasele mele (elev)
- `/clasa/:classId` - Detalii clasă (elev)
- `/admin` - Dashboard admin
- `/search` - Rezultate căutare
- `/about-us` - Despre noi

## 🔑 Funcționalități cheie

### Sistem de probleme
- Probleme stocate în Firebase Firestore
- Redux pentru gestionarea state-ului
- Filtrare și căutare
- Tracking progres per utilizator
- Sistem de corectare automată

### Asistent AI
- Avatar 3D interactiv (Three.js)
- Chat prin proxy `/api/webhook/chat` către automatizarea **n8n** (Groq, Llama 4 Scout), cu context din documentație/site
- **Puls AI** pentru analiza soluțiilor trimise la review și pentru rezolvare/verificare fizică când workflow-ul o selectează

### Simulări
- 37 simulări interactive
- Integrare prin iframe
- Simulări HTML/JS/CSS standalone
- Control parametri în timp real

### Autentificare și profil
- Firebase Authentication
- Profil utilizator cu statistici
- Istoric probleme rezolvate
- Sistem de realizări (achievements)

## 📚 Documentație suplimentară

- `documentatie4.md` - Documentație detaliată proiect
- `PROJECT_INDEX.md` - Index structură proiect
- `CLOUDINARY_SETUP.md` - Configurare Cloudinary
- `EMAILJS_SETUP.md` - Configurare EmailJS
- `ENV_SETUP.md` - Configurare variabile mediu
- `FIRESTORE_RULES.md` - Reguli Firestore
- `SOLVED_PROBLEMS_INTEGRATION.md` - Integrare probleme rezolvate

## 👥 Echipă

### Dezvoltatori
- **Drosu Ștefan** - Frontend & Backend, simulări grafice, integrare AI
- **Bajean Mateo** - Frontend & Backend, simulări grafice, integrare AI

### Coordonatori și colaboratori
- **Prof. Bebu Bianka Ioana** - Coordonator fizică, mentorat, dezvoltare resurse educaționale, dezvoltare conținut probleme, logică fizică
- **Prof. Bebu Ion** - Colaborator experimente
- **Prof. Dumitrescu Ovidiu** - Îndrumător tehnic

## 🎯 Misiune

Să aducem fizica mai aproape de elevi, să o facem mai clară, mai logică și mai interactivă — folosind tehnologia modernă pentru a transforma învățarea într-o experiență captivantă și eficientă.

## 📄 Licență

Acest proiect este dezvoltat în scop educațional.

## 🔗 Link-uri utile

- **Repository**: [GitHub](https://github.com/Stefanarctic/PULS)
- **Website**: [puls-fizica.ro](https://puls-fizica.ro)

---

<p align="center" style="margin-top: 20px"><b>Făcut cu ❤️ pentru elevii dornici de a învăța și profesori.</b></p>