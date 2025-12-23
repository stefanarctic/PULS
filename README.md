# PULS

**PULS** este o platformă prin care explorezi fizica pulsaţiilor, pendulelor, undelor si seismelor.


## 🌍 Ce oferă PULS?

### 🔬 Simulări interactive
- **Pendul simplu**: mișcare armonică, forță de frecare, gravitație variabilă
- **Curbe Lissajous**: oscilații pe două axe, frecvență și fază ajustabile
- **Seisme**: modelare undelor seismice și efectul lor asupra structurilor

### 📚 Probleme și resurse
- Probleme teoretice și aplicate din fizică (cu rezolvări)
- Resurse pentru liceu și facultate (formule, video, simulări)
- Modul de **auto-evaluare** cu feedback instant

### 🧪 Experimente virtuale
- Experimente bazate pe date reale sau simulări numerice
- Control în timp real al parametrilor: masă, lungime, amortizare etc.

### 🤖 Asistent AI integrat
- Poți scrie o problemă sau o ecuație, iar AI-ul o corectează sau explică
- Sugestii pas cu pas pentru înțelegerea conceptelor
- Feedback personalizat pentru fiecare utilizator

## 👨‍💻 Autori

- Drosu Ștefan, Bajean Mateo — dezvoltatori
- prof. Bebu Bianka Ioana - coordonator fizica
- prof. Bebu Ion - colaborator experimente
- prof. Ovidiu Dumitrescu - indrumator

## 🛠️ Tehnologii folosite

- ⚛️ **Frontend:** React cu Vite, SASS
- 🗂️ **Hosting cod:** Vercel
- 📦 **Librării externe:** chart.js, d3.jx, math.jax
- 📈 **D3.JS API:** pentru grafice fizice
- 🤖 **OpenAI API (AI assistant)** – pentru interpretarea problemelor
- 🎨 **Iconițe:** [Lucide React]

## 📦 Instalare locală

```bash
git clone https://github.com/Stefanarctic/PULS.git
cd PULS
npm install
npm run dev
```

## 🔧 Extragere Probleme BAC din PDF-uri

Pentru a extrage automat problemele din PDF-urile BAC descărcate:

### 1. Instalare dependențe Python

```bash
pip install -r requirements.txt
```

### 2. Configurare variabile de mediu

Creează un fișier `.env` în rădăcina proiectului cu următoarele variabile:

```
GROQ_API_KEY=your-groq-api-key-here
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

**Notă:** Pentru a obține o cheie API Groq:
1. Accesează [Groq Cloud Console](https://console.groq.com/)
2. Creează un cont sau loghează-te
3. Navighează la secțiunea "API Keys"
4. Creează o nouă cheie API și copiază-o în `.env`

### 3. Descarcă PDF-urile BAC

Rulează scriptul de descărcare:

```bash
python bacSubjectsExtractor.py
```

Aceasta va descărca toate PDF-urile BAC în `public/probleme/bac/{year}/`.

### 4. Extrage problemele din PDF-uri

Rulează scriptul de extragere:

```bash
python extractProblemsFromPDF.py
```

Scriptul va:
- Procesa toate PDF-urile din `public/probleme/bac/`
- Extrage doar problemele din secțiunile **II.** și **III.** (ignoră itemii din I.)
- Detectează desenele relevante cu AI Vision
- Încarcă imaginile la Cloudinary
- Generează JSON-uri în `extracted_problems/{year}/` gata pentru Firestore

**Notă:** Scriptul procesează doar fișierele `*_var_*.pdf`, nu baremele (`*_bar_*.pdf`).

<p align="center" style="margin-top: 20px"><b>Făcut cu ❤️ pentru elevii dornici de a învăţa şi profesori.</b></p>