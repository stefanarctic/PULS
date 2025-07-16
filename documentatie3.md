# PULS - Platformă Educațională pentru Fizică Interactivă

## Descriere generală

PULS este o platformă web educațională dedicată studierii fizicii, cu accent pe fenomene precum oscilațiile, undele, pendulele, figurile Lissajous și seismele. Platforma oferă atât simulări interactive, cât și probleme teoretice și practice, resurse educaționale și un sistem de autoevaluare. Utilizatorii pot explora concepte fizice prin vizualizări dinamice și pot primi feedback personalizat.

---

## Funcționalități principale

1. **Simulări interactive**
   - Simulări pentru pendul simplu, pendul amortizat, pendul neliniar, unde mecanice, figuri Lissajous, seisme, prisme optice și grafice fizice.
   - Controlul parametrilor în timp real (masă, lungime, amortizare etc.).
   - Vizualizări animate și grafice pentru diverse fenomene.

2. **Probleme de fizică**
   - Probleme organizate pe categorii, nivel de dificultate și tematică.
   - Fiecare problemă poate avea subpuncte, explicații, formule și date asociate.
   - Sistem de punctaj și feedback pentru autoevaluare.

3. **Resurse educaționale**
   - Lecții teoretice, formule, experimente virtuale și bibliografie.
   - Materiale structurate pe teme și niveluri de studiu.

4. **Profil utilizator**
   - Monitorizarea progresului: probleme rezolvate, nivel, activitate recentă, realizări (achievements).
   - Salvarea problemelor preferate și vizualizarea activității.

5. **Căutare și navigare rapidă**
   - Căutare după cuvinte-cheie pentru resurse, probleme și simulări.
   - Navigare intuitivă prin meniuri și secțiuni dedicate.

6. **Asistent AI (în dezvoltare)**
   - Corectarea automată a problemelor și explicații pas cu pas.
   - Feedback personalizat pentru fiecare utilizator.

---

## Structura aplicației

- **Frontend:** React (JSX), Vite, SASS pentru stilizare.
- **Componente principale:**
  - Navbar, Footer, Layout (structură pagină)
  - Pagini: Acasă, Probleme, Simulări, Resurse, Profil, Despre noi, Căutare
  - Componente pentru slideshow, carduri de funcționalitate, popup video, etc.
- **Date și resurse:**
  - Problemele sunt definite într-un fișier JavaScript (`problemedata.js`).
  - Simulările sunt organizate pe categorii și accesibile din pagini dedicate.
  - Resursele teoretice și experimentele sunt accesibile din secțiunea Resurse.
- **Rute principale:**
  - `/` – Pagina principală (prezentare generală, acces rapid la funcționalități)
  - `/probleme` – Listă de probleme, filtrare după dificultate
  - `/probleme/:id` – Detaliu problemă individuală
  - `/simulari` – Listă de simulări interactive
  - `/resurse` – Acces la resurse teoretice, formule, experimente
  - `/resurse/pendule`, `/resurse/unde`, `/resurse/lissajous`, `/resurse/seism` – Resurse pe teme specifice
  - `/profil` – Profilul utilizatorului
  - `/about-us` – Despre echipă și proiect
  - `/search` – Rezultate căutare

---

## Tehnologii folosite

- React (JSX)
- Vite (bundler)
- SASS (stilizare modulară)
- Chart.js, D3.js, MathJax (pentru grafice și formule)
- Lucide React (iconițe)
- OpenAI API (pentru viitorul asistent AI)
- Vercel (hosting)

---

## Organizare fișiere

- `src/components/` – Componentele React (Navbar, Footer, pagini, carduri, etc.)
- `src/components/pages/` – Pagini principale (Index, Probleme, Simulari, Resurse, Profil, etc.)
- `src/scss/` – Stiluri SASS organizate pe componente și pagini
- `public/js/` – Scripturi suplimentare pentru animații și funcționalități
- `public/simulari/` – Simulări fizice (Pendul, Lissajous, Seism, etc.)
- `public/translations/` – Traduceri pentru interfață (română/engleză)
- `src/components/problemedata.js` – Datele pentru problemele de fizică

---

## Instalare și rulare locală

1. Clonează proiectul:
   - `git clone <repo-url>`
2. Instalează dependențele:
   - `npm install`
3. Pornește serverul de dezvoltare:
   - `npm run dev`
4. Accesează aplicația la adresa `http://localhost:5173` (sau portul indicat de Vite).

---

## Echipă și contribuții

- Dezvoltare frontend, backend și simulări grafice: Bajean Mateo
- Logică fizică, integrare AI, resurse educaționale: Drosu Ștefan
- Mentorat și coordonare: Prof. Bebu Bianka Ioana
- Colaboratori: Prof. Bebu Ion, Prof. Dumitrescu Ovidiu

---

## Misiune

Să aducem fizica mai aproape de elevi, să o facem mai clară, mai logică și mai interactivă — folosind tehnologia.