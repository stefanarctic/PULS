# Tehnologii folosite în PULS

## Frontend

- **React 19** (JSX) și **Vite 6** — interfață și build rapid
- **React Router 7** — rutare SPA
- **Redux Toolkit** și **React Redux** — stare globală (probleme încărcate din Firebase)
- **Sass (sass-embedded)** — stiluri modulare (SCSS)
- **Lucide React** — iconițe
- **react-markdown**, **remark-math**, **rehype-mathjax** — conținut Markdown cu formule

## Grafice, 3D, formule

- **Recharts** — grafice în React
- **MathJax** (prin rehype-mathjax) — randare LaTeX / formule
- **Three.js** prin **@react-three/fiber** și **@react-three/drei** — avatar 3D asistent

## Date, autentificare, hosting

- **Firebase** (Auth, Firestore) — conturi, profil, probleme, progres
- **firebase-admin** — operații server-side sau scripturi de mentenanță a datelor (folosire opțională, în afara fluxului UI zilnic)
- **Cloudinary** și **ImageKit** — imagini (opțional, configurabile prin `.env`)
- **Vercel** — build și hosting producție
- **Endpoint-uri** în `api/` (ex. proxy chat către automatizări)

## Inteligență artificială (arhitectură)

- **Automatizare n8n** (ex. `automations.puls-fizica.ro`) — fluxul principal al **chat-ului asistent**: primește mesajele din aplicație (prin `/api/webhook/chat`), poate îmbogăți contextul cu **documentație**, **README** și **sitemap**, și folosește **Groq** cu modelul **Llama 4 Scout** (`meta-llama/llama-4-scout-17b-18b-instruct`) pentru conversația generală.
- **Puls AI** — API separat, orientat pe fizică, cu cel puțin două roluri: **analiză** a unei soluții trimise de utilizator (folosit la **review** din site) și **rezolvare** / verificare de problemă. Workflow-ul n8n poate apela Puls AI când utilizatorul cere explicit rezolvarea sau când intenția se potrivește (în loc să răspundă doar modelul general).
- **Separare**: conversația obișnuită = n8n + Groq; fizică „la obiect” (corectare, rezolvare structurată) = **Puls AI** prin endpoint-urile API dedicate.

## Simulări

- **Simulări web** în `public/simulari` — HTML, CSS, JavaScript; încorporare în platformă prin **iframe**

## Calitate cod și tooling

- **ESLint** 9 (flat config), plugin-uri React
- **Git** — versionare; repository pe GitHub

## Altele

- **jQuery** — utilități DOM în zone moștenite ale simulărilor sau codului mai vechi

*Scripturile Node din root (extragere/upload probleme BAC, grile, backup Firestore etc.) sunt unelte pentru echipa de conținut și baze de date; nu definesc stack-ul runtime al aplicației pentru utilizatori.*
