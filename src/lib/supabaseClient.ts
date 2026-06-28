import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// We laten de build (static prerender) niet crashen op ontbrekende env-vars,
// maar maken het wel duidelijk zichtbaar in de browser. De app werkt pas echt
// zodra NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY zijn ingesteld
// (zie .env.example en DEPLOYMENT.md).
if ((!supabaseUrl || !supabaseKey) && typeof window !== 'undefined') {
  console.error(
    'Supabase environment variabelen ontbreken: NEXT_PUBLIC_SUPABASE_URL en/of ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY. Stel deze in (zie .env.example / DEPLOYMENT.md).'
  )
}

export const supabase = createBrowserClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseKey ?? 'placeholder-anon-key'
)
