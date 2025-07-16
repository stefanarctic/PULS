# PULS - Platformă Educațională pentru Fizică Interactivă

## Descriere generală

**PULS** este o platformă educațională interactivă dedicată simulării fenomenelor fizice precum oscilațiile și undele, destinată atât elevilor, cât și profesorilor. Proiectul îmbină știința cu tehnologia pentru a aduce conceptele abstracte din fizică într-o formă vizuală, intuitivă și interactivă.

## Funcționalități principale

- **Simulări interactive**: 
  - Pendul simplu (mișcare armonică, forță de frecare, gravitație variabilă)
  - Curbe Lissajous (oscilații pe două axe, frecvență și fază ajustabile)
  - Seisme (modelare undelor seismice și efectul lor asupra structurilor)
- **Probleme și resurse**:
  - Probleme teoretice și aplicate din fizică (cu rezolvări)
  - Resurse pentru liceu și facultate (formule, video, simulări)
  - Modul de auto-evaluare cu feedback instant
- **Experimente virtuale**:
  - Experimente bazate pe date reale sau simulări numerice
  - Control în timp real al parametrilor: masă, lungime, amortizare etc.
- **Asistent AI integrat**:
  - Corectează probleme, explică soluții și oferă sugestii personalizate
  - Feedback pas cu pas pentru înțelegerea conceptelor

## Beneficii

- Simulări realiste și interactive, redate în timp real
- Inteligență Artificială pentru corectarea și explicarea problemelor
- Resurse educaționale bogate: lecții, formule, aplicații și probleme grupate pe teme
- Autoevaluare și feedback personalizat
- Platformă prietenoasă și intuitivă, concepută pentru elevi și profesori
- Acces securizat și date salvate pentru progresul utilizatorului

## Tehnologii folosite

- **Frontend:** React + Vite, SASS
- **Librării externe:** Chart.js, D3.js, MathJax, Lucide React
- **Backend/AI:** OpenAI API (pentru asistentul AI)
- **Hosting:** Vercel

## Structura proiectului

- `src/components/` – Componentele principale React (Navbar, Footer, About, Home, Profile, etc.)
- `src/components/pages/` – Pagini principale (Index, Probleme, Simulari, Resurse, Profile, etc.)
- `public/js/` – Scripturi JavaScript pentru animații și funcționalități suplimentare
- `public/simulari/` – Simulări fizice (Pendul, Lissajous, Seism, etc.)
- `src/scss/` – Stiluri SASS organizate pe componente și pagini
- `public/translations/` – Traduceri pentru interfață (RO/EN)

## Instalare locală

```bash
git clone https://github.com/Stefanarctic/New-Puls.git
cd puls
npm install
npm run dev
```

## Echipa

- **Bajean Mateo** – dezvoltare frontend & backend, simulări grafice  
- **Drosu Ștefan** – logică fizică, integrare AI, dezvoltare resurse educaționale

Mentorat și coordonare:
- **Prof. Bebu Bianka Ioana** – profesoară de fizică

Colaboratori:
- **Prof. Bebu Ion** – fizică aplicată
- **Prof. Dumitrescu Ovidiu** – programare & structură tehnică

## Misiune

> Să aducem fizica mai aproape de elevi, să o facem mai clară, mai logică și mai interactivă — folosind tehnologia.