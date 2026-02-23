# Configurare Firestore pentru Grile

Această secțiune descrie pașii pentru a configura colecția `grile` în Firestore.

## 1. Reguli Firestore

Regulile pentru colecția `grile` sunt incluse în `firestore.rules`. Asigură-te că ai publicat regulile actualizate în Firebase Console.

## 2. Creare colecție

1. Deschide [Firebase Console](https://console.firebase.google.com/)
2. Selectează proiectul PULS
3. Mergi la **Firestore Database**
4. Click pe **Start collection** (dacă e prima colecție) sau **Add collection**
5. Nume colecție: `grile`

## 3. Adăugare documente demo

Adaugă documente cu următoarea structură. Poți folosi ID auto-generat pentru documente.

### Exemplu document 1

```json
{
  "index": 1,
  "intrebare": "Care este unitatea de măsură a forței în SI?",
  "variante": {
    "a": "Newton (N)",
    "b": "Joule (J)",
    "c": "Watt (W)",
    "d": "Pascal (Pa)"
  },
  "raspunsCorect": "a",
  "categorie": "Mecanică",
  "dificultate": "ușor",
  "explicatie": "Forța se măsoară în newtoni (N) în Sistemul Internațional. 1 N = 1 kg·m/s²."
}
```

### Exemplu document 2 (cu LaTeX)

```json
{
  "index": 2,
  "intrebare": "Care este formula energiei cinetice? $E_c = \\frac{1}{2}mv^2$ sau $E_c = mgh$?",
  "variante": {
    "a": "$E_c = \\frac{1}{2}mv^2$",
    "b": "$E_c = mgh$",
    "c": "$E_c = F \\cdot d$",
    "d": "$E_c = p \\cdot v$"
  },
  "raspunsCorect": "a",
  "categorie": "Mecanică",
  "dificultate": "ușor",
  "explicatie": "Energia cinetică este $E_c = \\frac{1}{2}mv^2$, unde m este masa și v este viteza. Formula $mgh$ este pentru energia potențială gravitațională."
}
```

## 4. Câmpuri

| Câmp | Tip | Obligatoriu | Descriere |
|------|-----|-------------|-----------|
| `index` | number | Da | Ordinea de afișare (unic) |
| `intrebare` | string | Da | Textul întrebării (LaTeX cu $...$) |
| `variante` | object | Da | Obiect cu chei a, b, c, d |
| `raspunsCorect` | string | Da | 'a', 'b', 'c' sau 'd' |
| `categorie` | string | Recomandat | Mecanică, Termodinamică, etc. |
| `dificultate` | string | Opțional | ușor, mediu, dificil |
| `explicatie` | string | Opțional | Explicație afișată după răspuns |
