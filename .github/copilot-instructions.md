# Kalıyor App - Copilot Instructions

## Project Context
This is "Kalıyor" (Kaldığın Yerden) - a Turkish "Return to Work" platform connecting career-returners with companies.
Production URL: kaldiginyerden.com | Server IP: 159.69.116.116

## Architecture
- **Backend**: Express.js API on port 3001 (`/var/www/kaliyorapp/backend/`)
- **Frontend**: Next.js 16 with React 19 + TypeScript + Tailwind CSS 4 (`/var/www/kaliyorapp/frontend/`)
- **Database**: PostgreSQL (kaliyordb)
- **Uploads**: `/var/www/kaliyorapp/uploads/` (cv, logos, photos)

## Coding Standards

### Backend (Node.js / Express)
- Route files in `backend/src/routes/` contain all business logic (no separate controllers)
- Use parameterized queries ($1, $2..) for all SQL - NEVER concatenate user input
- Auth pattern: `router.method('/path', authMiddleware, requireRole('role'), handler)`
- Return errors: `res.status(code).json({ error: 'Türkçe hata mesajı' })`
- Use UUID primary keys, created_at/updated_at timestamps
- File uploads via Multer, stored in /uploads/ subdirectories

### Frontend (Next.js / TypeScript / React)
- All pages use `'use client'` directive (Client Components)
- API calls use `fetch()` with Bearer token from localStorage
- API base URL: `process.env.NEXT_PUBLIC_API_URL` (set to `/api`)
- Styling: Tailwind CSS utility classes, responsive with `md:` breakpoint
- Auth state: `localStorage.getItem('token')` and `localStorage.getItem('user')`

### Database
- PostgreSQL with pgcrypto extension for UUID generation
- 3 user roles: admin, participant, company
- Foreign keys with ON DELETE CASCADE
- Array columns (TEXT[]) for skills, desired_sectors

## Important Rules
1. All user-facing strings should be in **Turkish**
2. Always validate input on the backend using express-validator
3. Never expose sensitive data (passwords, JWT secrets) in responses
4. Use proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
5. Keep SQL in route handlers (no ORM)
6. Frontend pages are in `/frontend/app/` following Next.js App Router conventions

## Running the Project
```bash
# Backend
cd backend && npm run dev    # Development (nodemon)
cd backend && npm start      # Production

# Frontend
cd frontend && npm run dev   # Development
cd frontend && npm run build # Production build

# Database
sudo -u postgres psql -d kaliyordb  # Connect to DB
```
