# She Can Foundation — shecan-portal

Modern, responsive **NGO website** with a volunteer/contact form + an **admin dashboard** to view submissions.

## Tech Stack

- Frontend: HTML, CSS, JavaScript (vanilla)
- Backend: Node.js, Express.js
- Storage: local JSON files in `data/` (no MongoDB required)
- Auth: JWT (admin login)

## Quick start

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and set at least `JWT_SECRET` (and optional admin email/password).

```bash
npm run dev
```

Open **http://localhost:5000/** in your browser, fill out the form, and click Submit. You should see **Form Submitted Successfully**.

Admin panel: **http://localhost:5000/admin.html**

### If you see a folder list (backend, frontend, routes…)

You opened the **project folder** as files, not the website. Do **not** browse the repo root in the browser.

1. Run `npm start` from the project folder (or `npm run dev` inside `backend`).
2. Open only **http://localhost:5000/** — that is the real site.

## Project Structure

```
shecan-portal/
  frontend/          # Website UI
  backend/           # Express server (serves frontend + API)
  routes/            # API routes
  utils/             # File storage + auth helpers
  data/              # submissions.json (created on first submit)
```

## API Endpoints

- `POST /api/forms` — submit volunteer/contact form
- `POST /api/auth/login` — admin login (returns JWT)
- `GET /api/forms` — list submissions (admin only)

## Important

- Open the site through the server URL (`http://localhost:5000`), not by double-clicking `index.html`. That way the form and API share the same address and submit works reliably.
- Submissions are saved in `data/submissions.json`.
