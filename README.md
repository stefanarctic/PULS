# PULS - Platformă Educațională pentru Fizică Interactivă

**PULS** este o platformă web educațională modernă dedicată studiului fizicii, cu accent pe fenomene oscilatorii, unde, pendule, figuri Lissajous și seisme. Oferă simulări interactive, probleme de fizică cu rezolvări, resurse teoretice și un sistem de autoevaluare cu feedback AI personalizat.

## 🌟 Caracteristici principale

### 🔬 Simulări interactive (22+ simulări)
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

### 📚 Probleme de fizică
- **Probleme BAC**: Colecție completă de probleme din examenele de bacalaureat
- **Probleme individuale**: Probleme detaliate cu rezolvări pas cu pas
- **Auto-evaluare**: Sistem de corectare automată cu feedback instant
- **Tracking progres**: Urmărire a problemelor rezolvate per utilizator
- **Categorii**: Organizare pe domenii (mecanică, electricitate, optică, termodinamică)

### 🤖 Asistent AI 3D integrat
- **Asistent vizual**: Avatar 3D interactiv (Three.js/React Three Fiber)
- **Corectare probleme**: AI-ul corectează și explică soluțiile pas cu pas
- **Sugestii personalizate**: Feedback adaptat pentru fiecare utilizator
- **Integrare Mistral AI**: Pentru interpretarea și explicarea problemelor

### 🎮 Gamificare și realizări
- **Sistem de realizări (Achievements)**: Badge-uri pentru progres
- **Statistici utilizator**: Dashboard cu progres personal
- **Profil utilizator**: Istoric probleme rezolvate și realizări

### 📖 Resurse educaționale
- **Resurse teoretice**: Formule, explicații, video-uri
- **Categorii**: Pendule, unde, lissajous, seism, termodinamică, mecanică, electricitate, optică
- **Conținut multimedia**: Video-uri, animații, grafice interactive

### 🌐 Funcționalități platformă
- **Internaționalizare**: Suport pentru română (RO) și engleză (EN)
- **Dark Mode**: Mod întunecat/clar pentru interfață
- **Design responsiv**: Optimizat pentru desktop, tabletă și mobil
- **Căutare**: Sistem de căutare pentru probleme și resurse
- **Profil utilizator**: Autentificare și gestionare cont (Firebase Auth)
- **Admin Dashboard**: Panou de administrare pentru gestionarea conținutului

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
- **Firebase Admin** - Operări server-side
- **Mistral AI** - Asistent AI pentru corectare probleme
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
├── api/                   # Serverless API endpoints (Vercel)
│   ├── assistant/
│   └── webhook/
├── extracted_problems/    # Probleme extrase (JSON)
└── ...
```

## 🚀 Instalare și configurare

### Cerințe
- Node.js 18+ și npm
- Cont Firebase (pentru autentificare și bază de date)
- Cont Mistral AI (pentru asistent AI)
- Cont Cloudinary/ImageKit (opțional, pentru imagini)

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

# Mistral AI
VITE_MISTRAL_API_KEY=your_mistral_api_key

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

# Scripturi utilitare pentru probleme
npm run extract-bac      # Extrage probleme BAC
npm run upload-bac       # Încarcă probleme BAC în Firebase
npm run backup-db        # Backup bază de date Firebase
npm run clean-problems   # Curăță conținut probleme
npm run upload-cleaned   # Încarcă probleme curățate
npm run remove-duplicates # Elimină duplicate
```

## 🗺️ Routing

Principalele rute ale aplicației:

- `/` - Pagina principală (Index)
- `/probleme` - Lista probleme
- `/probleme/bac` - Probleme BAC
- `/probleme/:id` - Problemă individuală
- `/simulari` - Lista simulări
- `/simulare/:slug` - Simulare individuală (22+ simulări)
- `/resurse` - Resurse educaționale
- `/resurse/pendule` - Resurse pendule
- `/resurse/unde` - Resurse unde
- `/resurse/lissajous` - Resurse Lissajous
- `/resurse/seism` - Resurse seism
- `/resurse/termodinamica` - Resurse termodinamică
- `/resurse/mecanica` - Resurse mecanică
- `/resurse/electricitate` - Resurse electricitate
- `/resurse/optica` - Resurse optică
- `/profil` - Profil utilizator
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
- Integrare Mistral AI pentru corectare
- Chat interface pentru întrebări
- Explicații pas cu pas

### Simulări
- 22+ simulări interactive
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
- **Deployment**: [Vercel](https://puls-fizica.vercel.app)
- **Website**: [puls-fizica.ro](https://puls-fizica.ro)

---

<p align="center" style="margin-top: 20px"><b>Făcut cu ❤️ pentru elevii dornici de a învăța și profesori.</b></p>
