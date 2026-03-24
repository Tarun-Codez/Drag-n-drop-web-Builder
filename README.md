# Drag-and-Drop Website Builder (Full Stack)

A full-stack Wix/Webflow-style website builder with a visual editor, real-time preview, JSON schema state, code export, save/load, authentication, and one-click publish simulation.

## What is included

- **Visual editor** with drag-and-drop components
- Components: text, image, button, form, input, navbar, footer, row/column containers
- **Left sidebar**: component + template library
- **Center canvas**: editable live layout
- **Right sidebar**: property inspector (content, style, sizing, colors, spacing, borders)
- **Top bar**: desktop/mobile toggle, undo/redo, preview, save, load, export, publish
- **Canva-like freeform editor**: drag to move, resize handle, overlap layers (z-index)
- **State management** using JSON schema in Zustand
- **Auth** (signup/login) with JWT
- **Backend persistence** with MongoDB (plus automatic memory fallback if Mongo is not configured)
- **Code export** (download `index.html`, `styles.css`, `script.js`)
- **Publish simulation** returning a public URL like `https://site-abc123.builder-demo.app`
- **One-click deployment integration** (Vercel API when configured, simulation fallback otherwise)
- Bonus features: undo/redo, templates, SEO fields, image upload, responsive preview mode

---

## Project structure

- `frontend/` – React + Tailwind + dnd-kit builder UI
- `backend/` – Express API + auth + project persistence

---

## Prerequisites

- Node.js 18+
- npm 9+
- (Optional) MongoDB connection string

---

## Environment setup

### Backend env (`backend/.env`)

Already created with placeholders:

- `PORT=5000`
- `MONGO_URI=` (optional; leave empty to run memory fallback mode)
- `JWT_SECRET=replace_with_a_secure_secret`
- `VERCEL_TOKEN=`
- `VERCEL_PROJECT_ID=` (optional; for linking to an existing Vercel project)
- `VERCEL_TEAM_ID=` (optional)

### Frontend env (`frontend/.env`)

Already created:

- `VITE_API_URL=http://localhost:5000/api`

---

## Run locally

### 1) Start backend

From `backend/`:

- Install dependencies: `npm install`
- Start in dev mode: `npm run dev`

### 2) Start frontend

From `frontend/`:

- Install dependencies: `npm install`
- Run dev server: `npm run dev`

Open the frontend URL shown by Vite (typically `http://localhost:5173`).

---

## How publishing works

Click **Publish** in the top bar.

- If the project is not saved yet, it is auto-saved first.
- Backend attempts real one-click deployment through Vercel (if env vars are configured).
- If not configured or deployment fails, backend safely falls back to a generated demo URL.
- UI shows: **"Your site is live at: <URL>"**.

### Canva-like editing controls

- Drag any selected element to move it freely on canvas.
- Use the bottom-right resize handle to resize width/height.
- In right sidebar, use **Bring Front** / **Send Back** and `z-index` field for overlays.

---

## Deploying for production

### Frontend (Vercel / Netlify)

- Build command: `npm run build`
- Output directory: `dist`

### Backend (Render / Railway / Fly / VPS)

- Start command: `npm start`
- Add environment variables (`MONGO_URI`, `JWT_SECRET`, `PORT`)

---

## Beginner notes

- Look in `frontend/src/store/useBuilderStore.js` for state logic.
- Look in `frontend/src/components/` for modular UI parts.
- Look in `frontend/src/lib/exporter.js` for HTML/CSS/JS generation.
- Look in `backend/src/controllers/` for auth/project business logic.

Happy building 🚀
