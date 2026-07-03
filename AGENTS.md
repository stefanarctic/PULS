# AGENTS.md

## Cursor Cloud specific instructions

PULS is a single-product **Vite + React 19 SPA** (Romanian physics-education site). There is no in-repo backend; the "backend" is hosted Firebase (Auth/Firestore/Storage) consumed directly from the client, plus optional third-party APIs (n8n chat, Groq, DeepL, Cloudinary, ImageKit). See `README.md` for the full feature/route list and `package.json` for scripts.

### Running / building
- Dev server: `npm run dev` → serves at `http://localhost:8000` (port is fixed in `vite.config.js`).
- Build: `npm run build`. Lint: `npm run lint`. There is no automated test suite.

### Critical gotcha: the app needs a `.env` or it renders a blank page
- `src/lib/firebase.js` calls `getAuth()` at module load. If `VITE_FIREBASE_*` env vars are missing/empty, Firebase throws `auth/invalid-api-key`, which crashes the whole React tree — **every** page (including static simulation pages) shows a blank white screen with only a console error.
- A `.env` file (gitignored, so it does not persist across fresh VMs) with **non-empty, syntactically-valid** `VITE_FIREBASE_*` values is required just for the app to mount. For local demos where a live backend isn't needed, dummy values (e.g. `VITE_FIREBASE_API_KEY=AIzaSyDUMMY...`, a project id, etc.) are enough — copy `.env.example` to `.env` and fill placeholders. For real auth/Firestore data (login, problems, classes, profiles) use real Firebase credentials (add them as Cursor Secrets or in `.env`).
- Note: Vite loads env from `.env` files, so if credentials are provided as VM env vars/Secrets you may still need them written into a `.env` for the client bundle to pick them up.

### What works without external services
- The interactive physics simulations (`public/simulari/*`, embedded via iframe on `/simulare/:slug`) are fully client-side and work once Firebase has initialized (even with dummy config). They are the best zero-credential smoke test.
- The now-defunct `polyfill.io` `<script>` tags were removed from the simulation pages (they only backfilled ES6 for legacy browsers and triggered a stray HTTP-auth popup). MathJax formula rendering still works without them in modern browsers — do not re-add `polyfill.io`.

### Linting note
- `npm run lint` reports ~1250 pre-existing errors, almost all from the root-level Node maintenance scripts (`upload-*.js`, `extract-*.js`, `vite.config.js`, etc.) using `process`/`Buffer`/`__dirname` without Node globals configured in ESLint. These are pre-existing and unrelated to the app under `src/`.
