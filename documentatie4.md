# PULS – Platformă Educațională pentru Fizică Interactivă

## Capitolul I. Arhitectura aplicației

### Secțiunea I.1. Tehnologii folosite

- **Frontend:** React (JSX) + Vite, SASS pentru stilizare modulară
- **Librării externe:** Chart.js, D3.js, MathJax (pentru grafice și formule), Lucide React (iconițe)
- **Backend/AI:** OpenAI API (pentru asistentul AI)
- **Hosting:** Vercel
- **Alte resurse:** Simulări Unity integrate prin iframe, fișiere statice HTML/JS pentru simulări

**Justificare:**  
Tehnologiile moderne asigură o interfață rapidă, scalabilă și ușor de întreținut, cu suport pentru simulări grafice complexe și integrare AI.

### Secțiunea I.2. Proiectarea arhitecturală

- **Structură modulară:** Componente React pentru fiecare secțiune (Navbar, Footer, pagini, carduri, etc.)
- **Separarea responsabilităților:** Pagini dedicate pentru probleme, simulări, resurse, profil, etc.
- **Datele pentru probleme** sunt gestionate într-un fișier JS (`problemedata.js`), iar resursele și simulările sunt organizate pe categorii.
- **Internaționalizare:** Suport pentru traduceri (RO/EN) prin fișiere dedicate.
- **Paradigme:** Programare orientată pe obiect și funcțională, cu accent pe reutilizare și extensibilitate.

### Secțiunea I.3. Portabilitate

- Aplicația rulează pe orice dispozitiv cu browser modern (desktop, tabletă, mobil).
- Simulările Unity sunt accesibile direct din browser, fără instalare suplimentară.
- Codul este portabil și poate fi rulat local sau pe orice platformă de hosting web.

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

- Simulări interactive pentru pendul, unde, figuri Lissajous, seisme.
- Probleme de fizică organizate pe teme și dificultate, cu feedback instant.
- Experimente virtuale și resurse teoretice.

### Secțiunea IV.2. Evaluare și feedback

- Sistem de autoevaluare cu punctaj și feedback personalizat.
- Asistent AI care corectează probleme și explică soluții pas cu pas.

### Secțiunea IV.3. Posibilitatea de a actualiza și gestiona conținutul

- Problemele și resursele pot fi extinse ușor prin adăugarea de noi fișiere sau editarea celor existente.
- Structura modulară permite actualizarea rapidă a conținutului.

### Secțiunea IV.4. Corectitudinea informațiilor științifice

- Toate informațiile sunt verificate de profesori de fizică și colaboratori cu experiență.
- Nu există erori de natură științifică.

---

## Capitolul V. Originalitate și inovație

### Secțiunea V.1. Originalitatea ideii sau inovații față de soluții existente

- Integrarea simulărilor Unity direct în platformă web.
- Asistent AI pentru corectarea și explicarea problemelor de fizică.
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

- Vezi Secțiunea I.1 pentru motivația alegerii React, Vite, SASS, Chart.js, D3.js, MathJax și integrarea AI.

---

**Echipă:**
- Bajean Mateo, Drosu Ștefan – dezvoltare frontend & backend, simulări grafice, integrare AI
- Prof. Fiz. Bebu Bianka Ioana – mentorat și coordonare, dezvoltare resurse educaționale, dezvoltare continut probleme, logică fizică
- Colaboratori: Prof. Fiz. Bebu Ion - realizator experimente, Prof. Info. Dumitrescu Ovidiu - ajutor tehnic

**Misiune:**  
Să aducem fizica mai aproape de elevi, să o facem mai clară, mai logică și mai interactivă — folosind tehnologia.