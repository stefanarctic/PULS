# Ghid pentru Indexarea Platformei PULS pe Google

Acest ghid te va ajuta să faci platforma PULS vizibilă pe Google Search.

## 📋 Pași necesari

### 1. Verifică că site-ul este live și accesibil

- ✅ Asigură-te că platforma este deployată și accesibilă la `https://puls-fizica.ro`
- ✅ Verifică că toate paginile se încarcă corect
- ✅ Testează că `robots.txt` este accesibil: `https://puls-fizica.ro/robots.txt`
- ✅ Testează că `sitemap.xml` este accesibil: `https://puls-fizica.ro/sitemap.xml`

### 2. Înregistrează-te în Google Search Console

1. **Accesează Google Search Console**
   - Mergi la: https://search.google.com/search-console
   - Conectează-te cu contul Google asociat cu site-ul

2. **Adaugă proprietatea (Property)**
   - Click pe "Add Property"
   - Selectează "URL prefix" (nu "Domain")
   - Introdu: `https://puls-fizica.ro`
   - Click "Continue"

3. **Verifică proprietatea**
   - Google va cere verificarea proprietății
   - **Metoda recomandată: HTML tag**
     - Copiază tag-ul meta furnizat de Google
     - Adaugă-l în `<head>` din `index.html` (după celelalte meta tags)
   - **Alternativă: HTML file**
     - Descarcă fișierul HTML furnizat
     - Uploadează-l în folderul `public/` al proiectului
     - Redeploy platforma
   - **Alternativă: DNS record** (dacă ai acces la DNS)
   - Click "Verify" după ce ai finalizat verificarea

### 3. Trimite Sitemap-ul către Google

1. **După verificare, accesează secțiunea "Sitemaps"**
   - În meniul din stânga, click pe "Sitemaps"

2. **Adaugă sitemap-ul**
   - În câmpul "Add a new sitemap", introdu: `sitemap.xml`
   - Click "Submit"

3. **Verifică statusul**
   - Google va procesa sitemap-ul (poate dura câteva minute până la câteva zile)
   - Vei vedea statusul: "Success" când este procesat

### 4. Verifică indexarea paginilor

1. **Folosește "URL Inspection"**
   - În Google Search Console, folosește tool-ul "URL Inspection"
   - Introdu URL-uri ale paginilor principale:
     - `https://puls-fizica.ro/`
     - `https://puls-fizica.ro/probleme`
     - `https://puls-fizica.ro/simulari`
     - etc.
   - Click "Request Indexing" pentru paginile importante

2. **Monitorizează indexarea**
   - În secțiunea "Coverage" vei vedea:
     - Câte pagini sunt indexate
     - Erori de indexare (dacă există)
     - Pagini excluse

### 5. Optimizări suplimentare (recomandate)

#### A. Verifică Mobile-Friendly
- Folosește Google Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
- Introdu URL-ul site-ului
- Asigură-te că site-ul este optimizat pentru mobile

#### B. Verifică PageSpeed
- Folosește PageSpeed Insights: https://pagespeed.web.dev/
- Introdu URL-ul site-ului
- Optimizează imagini și resurse dacă este necesar

#### C. Verifică Core Web Vitals
- În Google Search Console, accesează "Core Web Vitals"
- Monitorizează metricile:
  - Largest Contentful Paint (LCP)
  - First Input Delay (FID)
  - Cumulative Layout Shift (CLS)

### 6. Crează un Google Business Profile (opțional)

Dacă platforma are o entitate legală sau organizație asociată:
- Creează un Google Business Profile
- Ajută la vizibilitate locală și în rezultatele de căutare

### 7. Link Building (pe termen lung)

- Obține link-uri de la alte site-uri educaționale
- Partajează platforma pe rețelele sociale
- Colaborează cu profesori și instituții educaționale
- Creează conținut de calitate care să atragă link-uri naturale

## ⏱️ Timeline așteptat

- **Verificare proprietate**: Imediat (după ce adaugi tag-ul meta)
- **Procesare sitemap**: 1-7 zile
- **Indexare pagini**: 1-14 zile (poate dura mai mult pentru site-uri noi)
- **Apariție în rezultatele de căutare**: 2-4 săptămâni (poate varia)

## 🔍 Verificare progres

### Cum să verifici dacă site-ul este indexat:

1. **Folosește Google Search**
   ```
   site:puls-fizica.ro
   ```
   Această comandă va afișa toate paginile indexate de Google.

2. **Folosește Google Search Console**
   - Secțiunea "Performance" arată câte click-uri și impresii primește site-ul
   - Secțiunea "Coverage" arată paginile indexate

## ⚠️ Probleme comune și soluții

### Problema: Site-ul nu apare în Google
- **Soluție**: Asigură-te că `robots.txt` nu blochează indexarea
- Verifică că nu există tag `noindex` în meta tags
- Așteaptă câteva săptămâni (indexarea poate dura)

### Problema: Sitemap-ul nu este procesat
- **Soluție**: Verifică că `sitemap.xml` este accesibil public
- Verifică formatul XML (trebuie să fie valid)
- Asigură-te că toate URL-urile din sitemap sunt accesibile

### Problema: Paginile nu sunt indexate
- **Soluție**: Folosește "Request Indexing" în URL Inspection
- Verifică că paginile nu au tag `noindex`
- Asigură-te că paginile au conținut de calitate

## 📊 Monitorizare continuă

După indexare, monitorizează:
- **Performance** în Google Search Console (click-uri, impresii, CTR)
- **Coverage** (erori de indexare)
- **Core Web Vitals** (performanță)
- **Mobile Usability** (probleme mobile)

## 🔗 Link-uri utile

- Google Search Console: https://search.google.com/search-console
- Google Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
- PageSpeed Insights: https://pagespeed.web.dev/
- Google Search Central: https://developers.google.com/search

---

**Notă**: Indexarea pe Google este un proces care durează timp. După ce ai finalizat pașii de mai sus, așteaptă câteva săptămâni pentru ca Google să indexeze complet site-ul.

