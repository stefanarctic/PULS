# Cloudinary Setup pentru PULS

## 🚀 **Pași pentru configurarea Cloudinary:**

### 1. **Creează cont Cloudinary**
- Mergi pe [cloudinary.com](https://cloudinary.com)
- Înregistrează-te pentru un cont gratuit
- Confirmă email-ul

### 2. **Obține credențialele**
- În dashboard-ul Cloudinary, mergi la **"Settings"** → **"Access Keys"**
- Copiază:
  - **Cloud Name** (ex: `abc123`)
  - **API Key** (ex: `123456789012345`)
  - **API Secret** (nu este necesar pentru upload direct)

### 3. **Configurează Upload Preset**
- În dashboard, mergi la **"Settings"** → **"Upload"**
- Creează un **"Upload Preset"** nou:
  - Nume: `puls-profiles`
  - Signing Mode: `Unsigned` (pentru upload direct din browser)
  - Folder: `puls-profiles`
  - Transformations: `w_400,h_400,c_fill,g_face`

### 4. **Actualizează configurația**
În `src/lib/cloudinary.js`, înlocuiește:
```javascript
export const CLOUDINARY_CONFIG = {
  cloudName: 'your-cloud-name', // Înlocuiește cu numele tău de cloud
  uploadPreset: 'puls-profiles', // Numele preset-ului creat
  apiKey: 'your-api-key' // Cheia ta de API
};
```

### 5. **Testează**
- Încearcă să uploadezi o imagine în profil
- Verifică dacă apare în dashboard-ul Cloudinary
- Verifică dacă URL-ul este salvat corect în Firebase

## ✅ **Avantajele Cloudinary:**
- **Upload direct din browser** - fără server
- **Optimizare automată** - imaginile sunt redimensionate automat
- **CDN global** - imaginile se încarcă rapid
- **Gratuit** - până la 25GB storage și 25GB bandwidth/lună
- **Fără limite Firebase** - salvezi doar URL-ul

## 🔧 **Troubleshooting:**
- Dacă primești eroare de upload, verifică dacă preset-ul este setat ca "Unsigned"
- Dacă imaginea nu se afișează, verifică dacă cloud name-ul este corect
- Dacă ai probleme cu CORS, verifică dacă ai setat corect folder-ul în preset

