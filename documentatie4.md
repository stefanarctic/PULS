# PULS – Platformă Educațională pentru Fizică Interactivă

## Capitolul I. Arhitectura aplicației

### Secțiunea I.1. Tehnologii folosite

- **Frontend:** React 19, Vite 6, React Router 7, Redux Toolkit, Sass (SCSS), Lucide React
- **Grafice și formule:** Recharts, MathJax (remark-math / rehype-mathjax), conținut Markdown cu `react-markdown`
- **3D (asistent):** Three.js prin `@react-three/fiber` și `@react-three/drei`
- **Date și autentificare:** Firebase (Authentication, Firestore); opțional `firebase-admin` pentru mentenanță date
- **Inteligență artificială:** (1) **Automatizare n8n** pe domeniul de automatizări al proiectului — chat asistent cu **Groq** și model **Llama 4 Scout**; workflow-ul poate include context static (documentație, README, sitemap) și poate delega către **Puls AI**. (2) **Puls AI** — API separat pentru fizică, cu endpoint-uri de **analiză** (ex. soluție trimisă la review din site) și **rezolvare** (când utilizatorul sau conversația cere rezolvarea unei probleme, orchestrarea poate folosi acest API în locul răspunsului „general”).
- **Media:** Cloudinary și ImageKit (opțional, pentru optimizarea imaginilor)
- **Hosting și API:** Vercel; funcții serverless în `api/` (ex. proxy `/api/webhook/chat` către n8n)
- **Simulări:** aplicații web statice (HTML/CSS/JavaScript) în `public/simulari`, integrate prin iframe în pagini dedicate (`SimulationPage`, config în `src/data/simulations.js`)
- **Calitate:** ESLint 9; versionare cu Git pe GitHub

**Justificare:**  
Stiva asigură performanță bună (Vite), o experiență de învățare bogată (simulări + grafice + formule), persistență și colaborare în clasă prin Firebase, și un lanț AI flexibil: **n8n** orchestrează conversația cu **Groq (Llama 4 Scout)**, iar **Puls AI** se concentrează pe analiză și rezolvare de probleme de fizică acolo unde este cazul, fără a compromite portabilitatea în browser.

### Secțiunea I.2. Proiectarea arhitecturală

- **Structură modulară:** Componente React pentru fiecare secțiune (Navbar, Footer, pagini, carduri, etc.)
- **Separarea responsabilităților:** Pagini dedicate pentru probleme (inclusiv BAC și grile), simulări, resurse pe domenii, profil, admin, profesor și clase elevi
- **Probleme:** încărcare din **Firebase Firestore**, gestionare în **Redux** (`features/problems`); pot exista și date auxiliare în fișiere JS locale
- **Simulări:** lista și rutele sunt centralizate în `src/data/simulations.js`; conținutul iframe din `public/simulari`
- **Clase și profesori:** fluxuri pentru dashboard profesor, pagină clasă, invitații și alăturare elev (`ClassJoinPage`, `TeacherDashboard`, etc.)
- **Internaționalizare:** Suport pentru traduceri (RO/EN) prin fișiere dedicate
- **Paradigme:** Programare orientată pe obiect și funcțională, cu accent pe reutilizare și extensibilitate

### Secțiunea I.3. Portabilitate

- Aplicația rulează pe orice dispozitiv cu browser modern (desktop, tabletă, mobil).
- Simulările rulează în browser (iframe), fără instalare de plugin-uri sau aplicații native.
- Codul este portabil și poate fi rulat local (ex. `npm run dev` pe portul 8000) sau deployat pe infrastructură web (Vercel).

---

## Capitolul II. Implementarea aplicației

### Secțiunea II.1. Eleganța implementării

- Codul este organizat pe module și componente, cu responsabilități clare.
- Numele variabilelor și funcțiilor sunt semnificative, iar codul este documentat.
- Respectă standardele de programare și este ușor de extins (ex: adăugarea de noi probleme sau simulări).

### Secțiunea II.2. Testarea aplicației

- Testare manuală a tuturor funcționalităților (simulări, probleme, feedback AI, navigare).
- Validare automată a datelor introduse de utilizator.
- Nu au fost identificate erori majore la testare.

### Secțiunea II.3. Folosirea unui sistem de gestionare a codului

- Proiectul este gestionat cu Git, repository public pe GitHub.
- Se folosesc ramuri pentru dezvoltare și testare.

### Secțiunea II.4. Maturitatea aplicației

- Aplicația este complet funcțională, cu conținut bogat și interfață prietenoasă.
- Poate fi distribuită publicului larg, inclusiv în mediul educațional.

### Secțiunea II.5. Securitatea aplicației

- Datele utilizatorilor sunt protejate, iar accesul la progres și profil este securizat.
- Nu există expuneri la vulnerabilități cunoscute (XSS, SQL Injection etc.), deoarece nu se procesează date sensibile pe backend propriu.

---

## Capitolul III. Interfață

### Secțiunea III.1. Impresia generală

- Interfață modernă, adaptabilă la orice rezoluție.
- Suport pentru schimbarea limbii (RO/EN).
- Textele sunt corecte gramatical și accesibile.

### Secțiunea III.2. Ușurința în folosire

- Navigare intuitivă, cu meniuri clare și butoane explicite.
- Feedback vizual la acțiuni și structură logică a paginilor.

---

## Capitolul IV. Conținut

### Secțiunea IV.1. Funcționalitate, utilitate și interactivitate

- Simulări interactive pentru pendule, unde, figuri Lissajous, seisme, optică, termodinamică, mecanică, electricitate și subiecte avansate (ex. tunelare cuantică, spectru electromagnetic), în total peste 30 de simulări configurate în aplicație.
- Probleme de fizică (inclusiv BAC și grile), organizate și filtrabile, cu feedback și urmărire progres.
- Experimente virtuale și resurse teoretice.

### Secțiunea IV.2. Evaluare și feedback

- Sistem de autoevaluare cu punctaj și feedback personalizat.
- La trimiterea unei soluții la **review**, se folosește **Puls AI** (endpoint de analiză). Asistentul din chat rulează în principal prin **n8n** și **Groq (Llama 4 Scout)**; pentru rezolvare sau verificare „de fizică” la cerere, fluxul poate apela **Puls AI** (endpoint de rezolvare).

### Secțiunea IV.3. Posibilitatea de a actualiza și gestiona conținutul

- Problemele pot fi actualizate în **Firestore** (inclusiv prin panoul admin). Uneltele de import din linia de comandă (proiect) sunt opționale pentru echipa de conținut.
- Simulările noi se pot adăuga prin extinderea `simulations.js` și a fișierelor din `public/simulari`.
- Paginile de resurse și componentele asociate permit extinderea pe categorii fără a restrânge arhitectura.

### Secțiunea IV.4. Corectitudinea informațiilor științifice

- Toate informațiile sunt verificate de profesori de fizică și colaboratori cu experiență.
- Nu există erori de natură științifică.

---

## Capitolul V. Originalitate și inovație

### Secțiunea V.1. Originalitatea ideii sau inovații față de soluții existente

- Integrarea unui număr mare de simulări web într-o singură platformă cu rută și prezentare unitară.
- Lanț AI compus: **n8n** + **Groq (Llama 4 Scout)** pentru conversație contextuală și **Puls AI** pentru analiză și rezolvare de probleme de fizică; avatar 3D pentru prezentarea asistentului.
- Gamificare prin sistem de punctaj și realizări.
- Interfață adaptivă și resurse multimedia (video, animații, grafice interactive).

---

## Capitolul VI. Prezentarea proiectului

### Secțiunea VI.1. Impresia generală a proiectului

- Proiectul este bine structurat, modern și aduce valoare reală procesului educațional.
- Ușor de folosit atât de elevi, cât și de profesori.

### Secțiunea VI.2. Documentația proiectului

#### Informații generale despre proiect

**PULS** este o platformă educațională web pentru studiul fizicii, cu accent pe fenomene oscilatorii, unde, pendule, figuri Lissajous și seisme. Oferă simulări interactive, probleme, resurse teoretice și un sistem de autoevaluare cu feedback AI.

#### Ghid de instalare și utilizare

1. **Instalare locală:**
   ```bash
   git clone https://github.com/Stefanarctic/PULS.git
   cd PULS
   npm install
   npm run dev
   ```
2. **Utilizare:**
   - Accesează aplicația la adresa `http://localhost:8000`.
   - Navighează prin meniul principal pentru a explora problemele, simulările și resursele.

#### Descrierea arhitecturii aplicației

- Vezi Capitolul I pentru detalii despre structura modulară și tehnologiile folosite.

#### Justificarea tehnologiilor alese

- Vezi Secțiunea I.1 pentru motivația alegerii React, Vite, Sass, Redux, Firebase, Recharts, MathJax, Three.js (R3F), automatizarea n8n cu Groq și API-ul Puls AI.

---

**Echipă:**
- Bajean Mateo, Drosu Ștefan – dezvoltare frontend & backend, simulări grafice, integrare AI
- Prof. Fiz. Bebu Bianka Ioana – mentorat și coordonare, dezvoltare resurse educaționale, dezvoltare continut probleme, logică fizică
- Colaboratori: Prof. Fiz. Bebu Ion - realizator experimente, Prof. Info. Dumitrescu Ovidiu - ajutor tehnic

**Misiune:**  
Să aducem fizica mai aproape de elevi, să o facem mai clară, mai logică și mai interactivă — folosind tehnologia.