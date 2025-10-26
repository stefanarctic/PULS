## PULS Project Index

### Overview
React (Vite) single-page app with Redux Toolkit, SCSS, and a large set of public physics simulators and assets. Includes helper APIs for ImageKit/Cloudinary and Firebase initialization.

### Tech Stack
- React 19, React Router 7
- Redux Toolkit
- Vite 6
- SCSS (sass-embedded)
- Three.js via @react-three/fiber and @react-three/drei (for 3D assistant/assets)
- Firebase, Cloudinary, ImageKit
- Recharts

### Scripts
- dev: `vite`
- build: `vite build`
- preview: `vite preview`
- lint: `eslint .`

### Entry Points
- `index.html` → mounts `#root`
- `src/main.jsx` → React root, Redux `Provider`
- `src/App.jsx` → Router + routes; dispatches `fetchProblems()` on mount

### Routing (from `src/App.jsx`)
- `/` → `components/pages/Index`
- `/probleme` → `components/pages/Probleme`
- `/probleme/:id` → `components/pages/ProblemaIndividuala`
- `/simulari` → `components/pages/Simulari`
- `/resurse` → `components/pages/Resurse`
- `/resurse/pendule` → `components/pages/resurse/pendule`
- `/resurse/unde` → `components/pages/resurse/unde`
- `/resurse/lissajous` → `components/pages/resurse/lissajous`
- `/resurse/seism` → `components/pages/resurse/seism`
- `/resurse/termodinamica` → `components/pages/resurse/termodinamica`
- `/resurse/mecanica` → `components/pages/resurse/mecanica`
- `/about-us` → `components/About`
- `/search` → `components/pages/searchresults`
- `/profil` → `components/pages/Profile`
- `/api-test` → `components/ProblemSubmit`

### State Management
- Store: `src/store.js`
- Slice: `src/features/problems/problemsSlice.js` (async fetch for problems)

### Key Source Modules
- Components: `src/components/*` (UI sections: `Navbar`, `Home`, `Services`, `Testimonials`, `Footer`, etc.)
- Pages: `src/components/pages/*` (route-level pages)
- Hooks: `src/hooks/*` (`useAssistant`, `useDarkMode`, `useTranslate`, `useSolvedProblems`)
- Lib: `src/lib/*`
  - `firebase.js` (Firebase init)
  - `cloudinary.js` (Cloudinary client helpers)
  - `assistant-knowledge-base.js` (assistant data)
  - `normalizeString.js`
- API helpers: `src/api/imagekit-auth.js` (front-end)

### Styles
- Global: `src/scss/style.scss`
- Component/section partials: `src/scss/components/*.scss`
- Variables: `src/scss/common/_variables.scss`

### Public Assets and Simulators
- Static JS helpers: `public/js/*` (dark mode toggle, scroll animations, testimonials)
- Translations: `public/translations/{ro,en}.json`
- 3D models and textures: `public/models/*`, `public/Modele Asistent/*`
- Simulators: `public/simulari/*` (HTML/CSS/JS demos: Lissajous, Grafice Armonice, Termodinamica, Unde, etc.)
- Images/videos/icons: `public/res/*`

### Server/API Utilities
- `api/assistant/ask.js` (assistant endpoint)
- `api/assistant/imagekit-auth.js` (server-side ImageKit auth)
- Note: There is also `src/api/imagekit-auth.js` for client-side usage.

### SEO & Deployment
- Sitemap: `sitemap.xml` at root and under `public/`, plus `sitemapGenerator.js`
- Deployment config: `vercel.json`

### Dev Server Config
- `vite.config.js`
  - Port: 8000
  - React plugin
  - Alias: `@` → `./src`
  - Allowed hosts include `localhost` and an ngrok domain

### How to Run
1. Install deps: `npm install`
2. Start dev server: `npm run dev` (http://localhost:8000)
3. Build: `npm run build`
4. Preview build: `npm run preview`

### Notable Docs
- `README.md` (project overview)
- `CLOUDINARY_SETUP.md` (Cloudinary configuration)
- `SOLVED_PROBLEMS_INTEGRATION.md`
- `tehnologii.md`, `documentatie4.md`

### Directory Map
- `src/`
  - `App.jsx`, `main.jsx`, `store.js`
  - `components/` (UI + route pages under `components/pages/`)
  - `features/problems/` (Redux slice)
  - `hooks/` (custom hooks)
  - `lib/` (Cloudinary, Firebase, assistant KB, utils)
  - `scss/` (styles)
  - `api/` (frontend ImageKit helper)
- `api/assistant/` (serverless API handlers)
- `public/` (assets, simulators, translations)
- Root: Vite/ESLint configs, sitemap tooling, deployment config

### Notes
- `App.jsx` registers a global `IntersectionObserver` for reveal animations and a Ctrl+K body overflow toggle.
- Problems data is loaded via `fetchProblems` on app init; see `features/problems/problemsSlice.js` and `components/uploadProblems.js`/`ProblemSubmit.jsx` for related flows.


