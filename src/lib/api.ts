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
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('catch_images')
        .upload(`user_${userId}/${fileName}`, image)
      
      if (uploadError) throw uploadError
      
      const { data: urlData } = supabase
        .storage
        .from('catch_images')
        .getPublicUrl(`user_${userId}/${fileName}`)
      
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

export const updateCatch = async (id: string, input: Partial<CatchInput>): Promise<Catch> => {
  // Handle image updates
  let imageUrls = input.images as string[] | undefined
  
  if (input.images && input.images.length > 0 && typeof input.images[0] !== 'string') {
    // New images to upload
    const newImageUrls: string[] = []
    
    for (const image of input.images as File[]) {
      const fileName = generateFileName(image.name, id)
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('catch_images')
        .upload(`catch_${id}/${fileName}`, image)
      
      if (uploadError) throw uploadError
      
      const { data: urlData } = supabase
        .storage
        .from('catch_images')
        .getPublicUrl(`catch_${id}/${fileName}`)
      
      if (urlData.publicUrl) {
        newImageUrls.push(urlData.publicUrl)
      }
    }
    
    imageUrls = newImageUrls
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
    for (const imageUrl of catchData.images) {
      const path = imageUrl.split('/').slice(3).join('/')
      const { error: deleteError } = await supabase
        .storage
        .from('catch_images')
        .remove([path])
      
      if (deleteError) console.error('Failed to delete image:', deleteError)
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
