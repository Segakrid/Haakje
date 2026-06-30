# Deployment: Vercel + Supabase

Deze handleiding zet Haakje online met **Supabase** als backend (auth, database,
storage) en **Vercel** voor het hosten van de Next.js app.

## Overzicht

```
Gebruiker ──▶ Vercel (Next.js frontend) ──▶ Supabase (Auth + Postgres + Storage)
```

De app is volledig client-rendered en praat rechtstreeks met Supabase via de
publieke anon key. Row Level Security (RLS) zorgt dat iedere gebruiker alleen
zijn eigen data ziet.

---

## Stap 1 — Supabase project aanmaken

1. Maak een account op [supabase.com](https://supabase.com) en klik
   **New project**.
2. Kies een naam, een sterk database-wachtwoord en een regio dicht bij je
   gebruikers (bijv. `eu-central-1` / Frankfurt voor Nederland).
3. Wacht tot het project klaar is met provisioneren.

## Stap 2 — Database & storage opzetten

1. Open in het Supabase dashboard de **SQL Editor**.
2. Plak de volledige inhoud van [`supabase/setup.sql`](./supabase/setup.sql) en
   klik **Run**.

Dit creëert in één keer:

- Tabellen: `profiles`, `fish_species`, `bait_types`, `fishing_rods`, `catches`
- Standaard vissoorten en aassoorten
- Indexen voor performance
- Row Level Security policies op alle tabellen
- De publieke storage bucket `catch_images` + bijbehorende policies
- Een trigger (`on_auth_user_created`) die automatisch een `profiles`-rij
  aanmaakt zodra iemand registreert

> Het script is idempotent: tabellen, seed-data en de bucket gebruiken
> `IF NOT EXISTS` / `ON CONFLICT`, en elke policy/trigger wordt voorafgegaan
> door `DROP ... IF EXISTS`. Je kunt het dus veilig opnieuw draaien op een
> bestaand project.

## Stap 3 — Auth configureren

1. Ga naar **Authentication → Providers** en zorg dat **Email** aanstaat.
2. Voor een snelle start kun je onder **Authentication → Sign In / Providers →
   Email** de optie *Confirm email* uitzetten, zodat gebruikers direct kunnen
   inloggen na registratie. Voor productie wordt e-mailbevestiging aangeraden.
3. Voeg na stap 5 je Vercel-URL toe onder **Authentication → URL Configuration**
   (Site URL en Redirect URLs), bijv. `https://haakje.vercel.app`.

## Stap 4 — API keys ophalen

Ga naar **Settings → API** en noteer:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Deze keys zijn bedoeld om publiek te zijn; de beveiliging zit in RLS.

## Stap 5 — Deployen naar Vercel

1. Push deze repository naar GitHub (als dat nog niet is gebeurd).
2. Ga naar [vercel.com](https://vercel.com), klik **Add New → Project** en
   importeer de repository.
3. Vercel detecteert Next.js automatisch (Build Command `next build`,
   Output handled by the Next.js adapter). Laat de defaults staan.
4. Voeg onder **Environment Variables** toe (voor Production, Preview en
   Development):

   | Name                            | Value                                |
   | ------------------------------- | ------------------------------------ |
   | `NEXT_PUBLIC_SUPABASE_URL`      | je Supabase Project URL              |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | je Supabase anon public key          |

5. Klik **Deploy**.

> Belangrijk: `NEXT_PUBLIC_*` variabelen worden tijdens de build ingebakken.
> Als je ze later wijzigt, moet je opnieuw deployen (**Redeploy**).

## Stap 6 — Afronden

1. Vul de Vercel-URL in bij **Authentication → URL Configuration** in Supabase
   (zie stap 3.3) zodat redirects en e-maillinks naar de juiste plek wijzen.
2. Test de happy path: registreren → inloggen → hengel toevoegen → vangst met
   foto toevoegen → statistieken bekijken.

---

## Verificatie checklist

- [ ] `npm run build` slaagt lokaal
- [ ] `setup.sql` is foutloos uitgevoerd in Supabase
- [ ] Bucket `catch_images` bestaat en is public (Storage)
- [ ] Beide env-variabelen staan in Vercel
- [ ] Registreren maakt een rij aan in `profiles`
- [ ] Een geüploade foto is zichtbaar op de vangst-kaart

## Beveiliging

- **Storage is per gebruiker afgeschermd.** Foto's worden opgeslagen onder een
  pad dat begint met de user-id (`<uid>/<bestand>`). De RLS-policies op
  `storage.objects` staan uploaden/wijzigen/verwijderen alleen toe binnen de
  eigen map; lezen is publiek (de bucket toont publieke afbeeldingen).
- **Rij-niveau toegang.** Alle datatabellen hebben RLS: een gebruiker ziet en
  beheert uitsluitend zijn eigen hengels en vangsten.

## Bekende aandachtspunten / vervolgstappen

- **Auth is client-side.** Sessies worden in de browser beheerd via
  `@supabase/ssr` (`createBrowserClient`). Voor server-side rendering van
  beveiligde pagina's of betere sessie-refresh is een Next.js `middleware.ts`
  met de Supabase server client een logische vervolgstap.
- **Afbeeldingen** worden met een gewone `<img>` getoond. Overstappen op
  `next/image` (met `remotePatterns` voor de Supabase storage-host) levert
  betere performance en caching op.
- **E-mailbevestiging** staat tijdens een snelle start vaak uit; zet deze aan
  voor productie (Authentication → Email).
