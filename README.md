# Gize Bar & Restaurant

Premium full-stack restaurant website built with Next.js 15, Prisma, PostgreSQL, Tailwind CSS, and Framer Motion.

**Domain:** https://gizebarandrestaurant.com

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS + Framer Motion + Shadcn-style UI
- Prisma ORM + PostgreSQL
- JWT auth (httpOnly cookies) + bcrypt
- Cloudinary media uploads
- React Hook Form + Zod + React Query

## Getting Started

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Set `DATABASE_URL` to your PostgreSQL connection string and a strong `JWT_SECRET`.

3. Install and set up the database:

```bash
npm install
npm run db:setup
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Staff login (RBAC)

- URL: `/login` (also linked from the site header; `/admin/login` redirects here)
- Roles: `SUPER_ADMIN` · `RESERVATION_MANAGER` · `CONTENT_EDITOR`
- Demo credentials (from `.env` / defaults):
  - Super Admin: `admin@gizebarandrestaurant.com` / `GizeAdmin2024!`
  - Reservation Manager: `reservations@gizebarandrestaurant.com` / `GizeReserve2024!`
  - Content Editor: `editor@gizebarandrestaurant.com` / `GizeEditor2024!`

Each role gets a filtered sidebar and permission-gated CRUD. Demo login works without a database in development only.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed menu, events, admin user |
| `npm run db:setup` | Generate + push + seed |

## Features

- Luxury public pages: Home, About, Menu, Drinks, Gallery, Events, Reservations, Testimonials, Contact, Legal
- Online reservations with admin inbox
- WhatsApp Order Now + floating Call/WhatsApp buttons
- Admin CMS: menu CRUD, reservations, events, gallery, testimonials, team, newsletter, contacts, media, analytics, SEO/site settings
- SEO: metadata, Open Graph, JSON-LD Restaurant schema, sitemap, robots.txt

## Cloudinary

Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to enable image uploads from the admin media library. Without Cloudinary, paste image URLs instead.
