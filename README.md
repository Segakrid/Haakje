# Haakje 🎣

Haakje is een webapp om je visvangsten bij te houden: registreer vangsten met
soort, aas, gewicht, lengte, locatie en foto's, beheer je hengels en bekijk
statistieken over je prestaties.

Gebouwd met **Next.js 16** (App Router), **React 19**, **Tailwind CSS 4** en
**Supabase** (auth, Postgres database en storage).

## Lokaal ontwikkelen

### 1. Vereisten

- Node.js 20+
- Een Supabase project (gratis tier volstaat)

### 2. Installeren

```bash
npm install
```

### 3. Environment variabelen

Kopieer `.env.example` naar `.env.local` en vul je Supabase gegevens in
(Supabase dashboard → Settings → API):

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 4. Database opzetten

Voer `supabase/setup.sql` uit in de **SQL Editor** van je Supabase project.
Dit script maakt alle tabellen, indexen, Row Level Security policies, de
`catch_images` storage bucket en een trigger die automatisch een profiel
aanmaakt bij registratie.

### 5. Starten

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script          | Beschrijving               |
| --------------- | -------------------------- |
| `npm run dev`   | Start de ontwikkelserver   |
| `npm run build` | Maakt een productie-build  |
| `npm run start` | Start de productie-build   |
| `npm run lint`  | Voert ESLint uit           |

## Deployen

Zie [`DEPLOYMENT.md`](./DEPLOYMENT.md) voor een stap-voor-stap handleiding om
de app online te zetten met Vercel en Supabase.

## Projectstructuur

```
src/
  app/          App Router pagina's (catches, rods, stats, login, register)
  components/   Herbruikbare UI componenten + auth guards
  hooks/        Data hooks (useAuth, useCatches, useFishingRods, ...)
  lib/          Supabase client, API laag, validaties (zod), utils
  types/        TypeScript types voor de database
supabase/
  setup.sql     Volledig databaseschema + RLS + storage setup
```
