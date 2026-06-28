import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase environment variables ontbreken. Stel NEXT_PUBLIC_SUPABASE_URL en ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY in (zie .env.example).'
  )
}

export const supabase = createBrowserClient(supabaseUrl, supabaseKey)
