# Configurare Firebase Auth pentru Ngrok

## Problema

Autentificarea Google nu funcționează pe ngrok pentru că Firebase Auth necesită ca toate domeniile să fie explicit autorizate în Firebase Console.

## Soluție

### Pasul 1: Obține domeniul ngrok

Când pornești ngrok, vei primi un domeniu de forma:
- `xxxxx.ngrok-free.app` (plan gratuit)
- `xxxxx.ngrok.io` (planuri plătite)
- `xxxxx.ngrok.app` (planuri plătite)

**Exemplu:** `4170170791aa.ngrok-free.app`

### Pasul 2: Adaugă domeniul în Firebase Console

1. Mergi la [Firebase Console](https://console.firebase.google.com/)
2. Selectează proiectul tău
3. Mergi la **Authentication** → **Settings** (setările din tab-ul "Settings")
4. Scroll până la secțiunea **Authorized domains**
5. Click pe **"Add domain"**
6. Introdu domeniul ngrok (fără `https://` sau `http://`, doar domeniul)
   - Exemplu: `4170170791aa.ngrok-free.app`
7. Click **"Add"**

### Pasul 3: Verifică configurația Vite

Asigură-te că domeniul ngrok este în `vite.allowed-hosts.js`:

```javascript
export const allowedHosts = [
  'localhost',
  'puls-fizica.vercel.app',
  'puls-fizica.ro',
  'xxxxx.ngrok-free.app' // Adaugă domeniul tău ngrok aici
];
```

### Pasul 4: Restart serverul de dezvoltare

După ce ai adăugat domeniul în Firebase Console, restart serverul Vite:

```bash
npm run dev
```

## ⚠️ Notă importantă pentru planul gratuit ngrok

Dacă folosești planul **gratuit** ngrok:
- Domeniul se schimbă la **fiecare restart** al ngrok
- Va trebui să adaugi noul domeniu în Firebase Console de fiecare dată
- Alternativ, poți folosi un plan plătit ngrok care oferă domenii statice

## Verificare

După configurare, autentificarea Google ar trebui să funcționeze pe domeniul ngrok. Testează accesând aplicația prin URL-ul ngrok și încercând să te loghezi cu Google.

## Erori comune

### "auth/unauthorized-domain"
- **Cauză:** Domeniul nu este autorizat în Firebase Console
- **Soluție:** Adaugă domeniul în Firebase Console → Authentication → Settings → Authorized domains

### "Popup blocked"
- **Cauză:** Browser-ul blochează popup-urile
- **Soluție:** Permite popup-urile pentru domeniul ngrok în setările browser-ului

### "Network error"
- **Cauză:** Ngrok nu este pornit sau domeniul nu este accesibil
- **Soluție:** Verifică că ngrok rulează și că domeniul este corect
