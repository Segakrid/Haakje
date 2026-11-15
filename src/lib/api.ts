import { supabase } from './supabaseClient'
import { Catch, FishingRod, FishSpecies, BaitType, CatchInput, FishingRodInput } from '@/types/database'
import { compressImage, generateFileName } from './utils'

const BUCKET = 'catch_images'
const CATCH_SELECT = `
  *,
  fish_species:fish_species_id(*),
  bait_type:bait_type_id(*),
  fishing_rod:fishing_rod_id(*)
`

// Publieke URL's zien eruit als ".../object/public/catch_images/<uid>/<bestand>".
// Het opslagpad is alles ná de bucketnaam.
const storagePathFromUrl = (imageUrl: string): string | null => {
  const marker = `/${BUCKET}/`
  const index = imageUrl.indexOf(marker)
  return index === -1 ? null : decodeURIComponent(imageUrl.slice(index + marker.length).split('?')[0])
}

const removeImages = async (urls: string[]) => {
  const paths = urls.map(storagePathFromUrl).filter((p): p is string => !!p)
  if (paths.length === 0) return
  const { error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) console.error('Afbeeldingen verwijderen mislukt:', error)
}

// Verkleint de foto in de browser (telefoonfoto's zijn al snel 5-10 MB) en
// uploadt hem naar de map van de gebruiker.
const uploadImage = async (userId: string, image: File): Promise<string> => {
  const file = await compressImage(image)
  const path = `${userId}/${generateFileName(file.name, userId)}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || undefined,
    cacheControl: '31536000',
  })
  if (error) throw error
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

// Authentication

export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const requestPasswordReset = async (email: string, redirectTo: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  return { error }
}

export const updatePassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password })
  return { error }
}

// Fishing Rods

export const getFishingRods = async (userId: string): Promise<FishingRod[]> => {
  const { data, error } = await supabase
    .from('fishing_rods')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export const getFishingRod = async (id: string): Promise<FishingRod | null> => {
  const { data, error } = await supabase
    .from('fishing_rods')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  
  if (error) throw error
  return data
}

export const createFishingRod = async (userId: string, input: FishingRodInput): Promise<FishingRod> => {
  const { data, error } = await supabase
    .from('fishing_rods')
    .insert({
      ...input,
      user_id: userId,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateFishingRod = async (id: string, input: Partial<FishingRodInput>): Promise<FishingRod> => {
  const { data, error } = await supabase
    .from('fishing_rods')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteFishingRod = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('fishing_rods')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Fish Species (predefined)
export const getFishSpecies = async (): Promise<FishSpecies[]> => {
  const { data, error } = await supabase
    .from('fish_species')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) throw error
  return data || []
}

// Bait Types (predefined)
export const getBaitTypes = async (): Promise<BaitType[]> => {
  const { data, error } = await supabase
    .from('bait_types')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) throw error
  return data || []
}

// Catches

export const getCatches = async (userId: string): Promise<Catch[]> => {
  const { data, error } = await supabase
    .from('catches')
    .select(CATCH_SELECT)
    .eq('user_id', userId)
    .order('caught_at', { ascending: false })

  if (error) throw error
  return (data || []).map(normalizeCatch)
}

export const getCatch = async (id: string): Promise<Catch | null> => {
  const { data, error } = await supabase
    .from('catches')
    .select(CATCH_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? normalizeCatch(data) : null
}

// Postgres NUMERIC-kolommen komen als string of number terug; `images` kan NULL zijn.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeCatch = (row: any): Catch => ({
  ...row,
  weight_kg: row.weight_kg === null || row.weight_kg === undefined ? null : Number(row.weight_kg),
  length_cm: row.length_cm === null || row.length_cm === undefined ? null : Number(row.length_cm),
  latitude: row.latitude === null || row.latitude === undefined ? null : Number(row.latitude),
  longitude: row.longitude === null || row.longitude === undefined ? null : Number(row.longitude),
  images: row.images || [],
})

export const createCatch = async (userId: string, input: CatchInput): Promise<Catch> => {
  const imageUrls: string[] = []

  try {
    for (const image of input.images || []) {
      imageUrls.push(await uploadImage(userId, image))
    }

    const { data, error } = await supabase
      .from('catches')
      .insert({
        user_id: userId,
        fish_species_id: input.fish_species_id,
        bait_type_id: input.bait_type_id,
        fishing_rod_id: input.fishing_rod_id,
        weight_kg: input.weight_kg,
        length_cm: input.length_cm,
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
        notes: input.notes,
        images: imageUrls,
        caught_at: input.caught_at,
      })
      .select(CATCH_SELECT)
      .single()

    if (error) throw error
    return normalizeCatch(data)
  } catch (err) {
    // Geen weesbestanden achterlaten als opslaan halverwege misgaat.
    await removeImages(imageUrls)
    throw err
  }
}

// Invoer voor het bijwerken van een vangst. `images` mag bestaande URL's (blijven
// staan) en nieuw gekozen File-objecten (worden geüpload) door elkaar bevatten.
export interface CatchUpdateInput extends Omit<CatchInput, 'images'> {
  images: (File | string)[] | null
}

export const updateCatch = async (
  id: string,
  userId: string,
  input: CatchUpdateInput
): Promise<Catch> => {
  const { data: current } = await supabase.from('catches').select('images').eq('id', id).maybeSingle()
  const previousUrls: string[] = current?.images || []

  const imageUrls: string[] = []
  const uploaded: string[] = []

  try {
    for (const image of input.images || []) {
      if (typeof image === 'string') {
        imageUrls.push(image)
      } else {
        const url = await uploadImage(userId, image)
        uploaded.push(url)
        imageUrls.push(url)
      }
    }

    const { data, error } = await supabase
      .from('catches')
      .update({
        fish_species_id: input.fish_species_id,
        bait_type_id: input.bait_type_id,
        fishing_rod_id: input.fishing_rod_id,
        weight_kg: input.weight_kg,
        length_cm: input.length_cm,
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
        notes: input.notes,
        images: imageUrls,
        caught_at: input.caught_at,
      })
      .eq('id', id)
      .select(CATCH_SELECT)
      .single()

    if (error) throw error

    // Foto's die de gebruiker heeft weggehaald ook echt uit de opslag verwijderen.
    await removeImages(previousUrls.filter((url) => !imageUrls.includes(url)))
    return normalizeCatch(data)
  } catch (err) {
    await removeImages(uploaded)
    throw err
  }
}

export const deleteCatch = async (id: string): Promise<void> => {
  const { data: catchData, error: fetchError } = await supabase
    .from('catches')
    .select('images')
    .eq('id', id)
    .maybeSingle()

  if (fetchError) throw fetchError

  const { error } = await supabase.from('catches').delete().eq('id', id)
  if (error) throw error

  // Pas ná het verwijderen van de rij de bestanden opruimen: zo raakt een vangst
  // nooit zijn foto's kwijt als het verwijderen zelf mislukt.
  await removeImages(catchData?.images || [])
}
