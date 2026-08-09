# StockFlow Inventory Management

StockFlow is a full-stack inventory application built with Next.js 16 App Router, TypeScript, PostgreSQL, Prisma ORM, Redux Toolkit, JWT cookie authentication, Zod, and bcrypt.

## Local setup

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL`, a random `JWT_SECRET` of at least 32 characters, and the optional Cloudinary values.
2. Install dependencies with `npm install` (this generates Prisma Client).
3. Apply pending Prisma migrations with `npm run db:migrate`.
4. Start the application with `npm run dev` and register the owner at `http://localhost:3000/register`.

Multiple owners can register. Each owner receives an isolated inventory workspace, and all records are stored in PostgreSQL.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run db:generate
npm run db:migrate
npm run db:status
npm run db:studio
npm run test:smoke
```

The smoke test creates two temporary owners, verifies account isolation and the complete inventory flow, then removes only those temporary accounts and their records.

## API

- `POST /api/auth/register` — create an owner account
- `POST /api/auth/login` — create a JWT-backed HTTP-only cookie session
- `POST /api/auth/logout` — expire the session
- `GET /api/auth/me` — read the authenticated owner profile
- `GET /api/inventory` — load all source and derived inventory data
- `POST /api/inventory/actions` — validated transactional inventory mutations

API responses consistently use `{ success: true, data }` or `{ success: false, error: { code, message, details? } }`.
