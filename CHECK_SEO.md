# ✅ Checklist SEO - Verificare Rapidă

Folosește această checklist pentru a verifica că totul este configurat corect pentru indexarea pe Google.

## 🔍 Verificări Pre-Deployment

### 1. Verifică că fișierele SEO există
- [ ] `public/robots.txt` există și este accesibil
- [ ] `public/sitemap.xml` există și este accesibil
- [ ] `index.html` conține meta tags SEO

### 2. Verifică robots.txt
Deschide în browser: `https://puls-fizica.ro/robots.txt`
- [ ] Fișierul se încarcă corect
- [ ] Conține `Sitemap: https://puls-fizica.ro/sitemap.xml`
- [ ] Nu blochează paginile importante

### 3. Verifică sitemap.xml
Deschide în browser: `https://puls-fizica.ro/sitemap.xml`
- [ ] Fișierul se încarcă corect
- [ ] Formatul XML este valid
- [ ] Conține toate paginile importante
- [ ] URL-urile folosesc domain-ul corect (`puls-fizica.ro`)

### 4. Verifică meta tags în index.html
- [ ] `lang="ro"` este setat corect
- [ ] Meta description există
- [ ] Meta keywords există
- [ ] Open Graph tags sunt complete
- [ ] Twitter Card tags sunt complete

## 🚀 După Deployment

### 5. Testează accesibilitatea
- [ ] Site-ul este accesibil la `https://puls-fizica.ro`
- [ ] Toate paginile principale se încarcă corect
- [ ] Nu există erori 404 pentru paginile importante
- [ ] Site-ul funcționează pe mobile

### 6. Verifică în Google Search Console
- [ ] Site-ul este verificat în Google Search Console
- [ ] Sitemap-ul este trimis și procesat cu succes
- [ ] Nu există erori de indexare majore

### 7. Testează indexarea
Caută în Google: `site:puls-fizica.ro`
- [ ] Cel puțin pagina principală apare în rezultate
- [ ] Paginile importante sunt indexate

## 🛠️ Comenzi utile pentru testare

### Testare locală robots.txt
```bash
# Verifică că robots.txt este în public/
ls public/robots.txt
```

### Testare locală sitemap.xml
```bash
# Verifică că sitemap.xml este în public/
ls public/sitemap.xml
```

### Verificare format XML
Deschide `sitemap.xml` într-un browser sau validator XML online pentru a verifica că formatul este corect.

## 📝 Note importante

- **Timp de indexare**: Google poate dura 1-4 săptămâni să indexeze complet un site nou
- **Verificare periodică**: Verifică Google Search Console săptămânal pentru erori
- **Actualizări sitemap**: Dacă adaugi pagini noi, actualizează `sitemap.xml` și retrimite-l în Google Search Console

## 🔗 Link-uri pentru testare

- **Google Search Console**: https://search.google.com/search-console
- **Test Mobile-Friendly**: https://search.google.com/test/mobile-friendly
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **Validator XML**: https://www.xmlvalidation.com/
- **Test robots.txt**: https://www.google.com/webmasters/tools/robots-testing-tool

