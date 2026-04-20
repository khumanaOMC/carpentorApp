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

## Vercel deploy

Project ko single Vercel app ki tarah deploy karne ke liye:

- frontend normal Next.js app ki tarah deploy hoga
- Express backend `api/[...path].js` ke through Vercel serverless function me chalega
- production me frontend default se same-origin `/api/v1` use karega

Required environment variables on Vercel:

```bash
MONGODB_URI=your-mongodb-connection-string
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

Optional:

```bash
NEXT_PUBLIC_API_URL=https://your-vercel-domain.vercel.app/api/v1
```

Local development me `NEXT_PUBLIC_API_URL` ke bina app abhi bhi `http://localhost:4000/api/v1` use karegi.
