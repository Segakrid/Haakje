import { supabase } from './supabaseClient'
import { Catch, FishingRod, FishSpecies, BaitType, CatchInput, FishingRodInput } from '@/types/database'
import { generateFileName } from './utils'

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

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
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
    .single()
  
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
    .select(`
      *,
      fish_species:fish_species_id(*),
      bait_type:bait_type_id(*),
      fishing_rod:fishing_rod_id(*)
    `)
    .eq('user_id', userId)
    .order('caught_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export const getCatch = async (id: string): Promise<Catch | null> => {
  const { data, error } = await supabase
    .from('catches')
    .select(`
      *,
      fish_species:fish_species_id(*),
      bait_type:bait_type_id(*),
      fishing_rod:fishing_rod_id(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export const createCatch = async (userId: string, input: CatchInput): Promise<Catch> => {
  // Upload images first
  const imageUrls: string[] = []
  
  if (input.images && input.images.length > 0) {
    for (const image of input.images) {
      const fileName = generateFileName(image.name, userId)
      const path = `${userId}/${fileName}`
      const { error: uploadError } = await supabase
        .storage
        .from('catch_images')
        .upload(path, image)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase
        .storage
        .from('catch_images')
        .getPublicUrl(path)

      if (urlData.publicUrl) {
        imageUrls.push(urlData.publicUrl)
      }
    }
  }
  
  // Create catch record
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
      caught_at: new Date().toISOString(),
    })
    .select(`
      *,
      fish_species:fish_species_id(*),
      bait_type:bait_type_id(*),
      fishing_rod:fishing_rod_id(*)
    `)
    .single()
  
  if (error) throw error
  return data
}

// Input for updating a catch. `images` may mix already-uploaded URLs (kept) and
// newly selected File objects (to be uploaded).
export interface CatchUpdateInput {
  fish_species_id: string
  bait_type_id: string
  fishing_rod_id: string | null
  weight_kg: number | null
  length_cm: number | null
  location: string
  latitude: number | null
  longitude: number | null
  notes: string | null
  images: (File | string)[] | null
}

export const updateCatch = async (
  id: string,
  userId: string,
  input: CatchUpdateInput
): Promise<Catch> => {
  // Resolve the final list of image URLs: keep existing URLs, upload new files.
  const imageUrls: string[] = []

  for (const image of input.images || []) {
    if (typeof image === 'string') {
      imageUrls.push(image)
      continue
    }

    const fileName = generateFileName(image.name, userId)
    const path = `${userId}/${fileName}`
    const { error: uploadError } = await supabase
      .storage
      .from('catch_images')
      .upload(path, image)

    if (uploadError) throw uploadError

    const { data: urlData } = supabase
      .storage
      .from('catch_images')
      .getPublicUrl(path)

    if (urlData.publicUrl) {
      imageUrls.push(urlData.publicUrl)
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
    })
    .eq('id', id)
    .select(`
      *,
      fish_species:fish_species_id(*),
      bait_type:bait_type_id(*),
      fishing_rod:fishing_rod_id(*)
    `)
    .single()
  
  if (error) throw error
  return data
}

export const deleteCatch = async (id: string): Promise<void> => {
  // First, delete associated images from storage
  const { data: catchData, error: fetchError } = await supabase
    .from('catches')
    .select('images')
    .eq('id', id)
    .single()
  
  if (fetchError) throw fetchError
  
  if (catchData?.images && catchData.images.length > 0) {
    // Public URLs look like ".../object/public/catch_images/<uid>/<file>".
    // The storage path is everything after the bucket name.
    const marker = '/catch_images/'
    const paths = catchData.images
      .map((imageUrl: string) => {
        const index = imageUrl.indexOf(marker)
        return index === -1 ? null : imageUrl.slice(index + marker.length)
      })
      .filter((path: string | null): path is string => !!path)

    if (paths.length > 0) {
      const { error: deleteError } = await supabase
        .storage
        .from('catch_images')
        .remove(paths)

      if (deleteError) console.error('Failed to delete images:', deleteError)
    }
  }
  
  // Delete the catch record
  const { error } = await supabase
    .from('catches')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Statistics
export const getCatchStatistics = async (userId: string) => {
  const { data, error } = await supabase
    .from('catches')
    .select('*')
    .eq('user_id', userId)
  
  if (error) throw error
  
  const catches = data || []
  
  return {
    totalCatches: catches.length,
    totalWeight: catches.reduce((sum, c) => sum + (c.weight_kg || 0), 0),
    totalSpecies: new Set(catches.map(c => c.fish_species_id).filter(Boolean)).size,
    totalLocations: new Set(catches.map(c => c.location).filter(Boolean)).size,
  }
}
