export interface User {
  id: string
  email: string
  name: string | null
  created_at: string
}

export interface FishingRod {
  id: string
  user_id: string
  name: string
  soort: string
  brand: string | null
  model: string | null
  length: number | null
  weight: number | null
  material: string | null
  description: string | null
  created_at: string
}

export interface FishSpecies {
  id: string
  name: string
  scientific_name: string | null
  description: string | null
}

export interface BaitType {
  id: string
  name: string
  description: string | null
}

export interface Catch {
  id: string
  user_id: string
  fish_species_id: string | null
  fish_species: FishSpecies | null
  bait_type_id: string | null
  bait_type: BaitType | null
  fishing_rod_id: string | null
  fishing_rod: FishingRod | null
  weight_kg: number | null
  length_cm: number | null
  location: string
  latitude: number | null
  longitude: number | null
  notes: string | null
  images: string[]
  caught_at: string
  created_at: string
}

export interface Location {
  id: string
  user_id: string
  name: string
  latitude: number
  longitude: number
  created_at: string
}

// Input types for forms
export interface CatchInput {
  fish_species_id: string
  bait_type_id: string
  fishing_rod_id: string | null
  weight_kg: number | null
  length_cm: number | null
  location: string
  latitude: number | null
  longitude: number | null
  notes: string | null
  images: File[] | null
}

export interface FishingRodInput {
  name: string
  soort: string
  brand: string | null
  model: string | null
  length: number | null
  weight: number | null
  material: string | null
  description: string | null
}

// Sort options
export type SortBy = 'date' | 'location' | 'species' | 'size' | 'weight'
export type SortOrder = 'asc' | 'desc'

export interface SortConfig {
  by: SortBy
  order: SortOrder
}
