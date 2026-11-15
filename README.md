# Haakje 🎣

Haakje is een webapp om je visvangsten bij te houden: registreer vangsten met
soort, aas, gewicht, lengte, locatie en foto's, beheer je hengels en bekijk
statistieken over je prestaties.

Gebouwd met **Next.js 16** (App Router), **React 19**, **Tailwind CSS 4** en
**Supabase** (auth, Postgres database en storage).

## Wat kan het?

- **Dashboard** met je laatste vangsten, topstek en je zwaarste vis als trofee
- **Vangsten** vastleggen met foto's (worden in de browser verkleind vóór upload),
  GPS-positie, datum/tijd, aas en hengel; zoeken, sorteren en filteren
- **Persoonlijke records** per vissoort, met een record-label op de kaart
- **Statistieken**: vangsten per maand/dag, bijttijden, beste aas, topstekken
- **Hengels** beheren, inclusief het aantal vangsten per hengel
- Licht en donker thema, mobiele tabbalk en installeerbaar als app (web manifest)

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
  components/   App-shell, kaarten, formulieren, grafieken + auth guards
  components/ui Kleine bouwstenen (dialoog, lege staat, tegels, loader)
  providers/    Gedeelde auth-status en toasts
  hooks/        Data hooks met cache (useAuth, useCatches, useFishingRods, ...)
  lib/          Supabase client, API laag, validaties (zod), utils
  types/        TypeScript types voor de database
supabase/
  setup.sql     Volledig databaseschema + RLS + storage setup
```
