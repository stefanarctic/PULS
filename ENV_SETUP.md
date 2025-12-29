# Configurare Firebase Admin SDK pentru Upload Script

Pentru a rula scriptul `upload-bac-problems.js`, trebuie să configurezi Firebase Admin SDK folosind un service account key.

## Pași pentru configurare:

### 1. Obține Service Account Key de la Firebase

1. Mergi la [Firebase Console](https://console.firebase.google.com/)
2. Selectează proiectul tău
3. Mergi la **Project Settings** → **Service Accounts**
4. Click pe **"Generate New Private Key"**
5. Se va descărca un fișier JSON cu service account key-ul

### 2. Configurează în `.env`

Creează un fișier `.env` în root-ul proiectului (lângă `package.json`) și adaugă:

#### Opțiunea 1 (Recomandat): JSON direct în `.env`

```env
FIREBASE_SERVICE_ACCOUNT_KEY_JSON='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'
```

**Notă:** 
- Pune întregul JSON între ghilimele simple `'...'`
- JSON-ul poate fi pe o singură linie sau pe mai multe linii
- Asigură-te că escape-zi corect newlines-urile cu `\n`

#### Opțiunea 2: Path către fișierul JSON

```env
FIREBASE_SERVICE_ACCOUNT_KEY=./firebase-service-account-key.json
```

Apoi salvează fișierul JSON descărcat ca `firebase-service-account-key.json` în root-ul proiectului.

#### Opțiunea 3: Fișier implicit

Salvează fișierul JSON descărcat ca `firebase-service-account-key.json` în root-ul proiectului. Scriptul îl va găsi automat.

### 3. Variabile de mediu necesare

Asigură-te că ai și variabilele Firebase standard în `.env`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Securitate

⚠️ **IMPORTANT:**
- **NU** comiteți niciodată fișierul `.env` în git!
- Service account key-ul are permisiuni complete de admin
- Păstrează-l secret și sigur
- Fișierul `.env` este deja în `.gitignore`

## Verificare

După ce ai configurat `.env`, poți rula scriptul:

```bash
npm run upload-bac
```

Scriptul va afișa un mesaj de confirmare dacă a reușit să inițializeze Firebase Admin SDK.

