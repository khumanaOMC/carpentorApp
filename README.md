# KaamKaCarpenter

KaamKaCarpenter ab `Next.js + MUI` frontend aur `Node.js + Express + MongoDB` backend ke saath structured hai. Frontend mobile-first PWA shell me build ki gayi hai aur backend REST API starter `backend/` folder me rakha gaya hai.

## Frontend

- Next.js app router
- MUI-based mobile app shell
- wooden inspired warm theme
- installable PWA basics:
  - `public/manifest.json`
  - `public/sw.js`
  - top app bar + bottom navigation

### Frontend run

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/jobs`
- `http://localhost:3000/bookings`
- `http://localhost:3000/profile`

## Backend

Backend starter is inside `backend/`.

### Backend run

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

API base:

- `http://localhost:4000/health`
- `http://localhost:4000/api/v1/auth/register`
- `http://localhost:4000/api/v1/jobs`

## Important note

Current frontend uses modern Next.js, so Node `18.18+` ya preferably `20 LTS` required hai.
