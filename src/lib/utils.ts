import { format, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'
import { Catch, SortBy, SortOrder } from '@/types/database'

// Format date for display
export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'dd MMMM yyyy, HH:mm', { locale: nl })
  } catch {
    return dateString
  }
}

// Format weight
export const formatWeight = (kg: number | null): string => {
  if (kg === null) return 'N/A'
  return `${kg.toFixed(2)} kg`
}

// Format length
export const formatLength = (cm: number | null): string => {
  if (cm === null) return 'N/A'
  return `${cm} cm`
}

// Sort catches
export const sortCatches = (catches: Catch[], sortBy: SortBy, sortOrder: SortOrder): Catch[] => {
  return [...catches].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.caught_at).getTime() - new Date(b.caught_at).getTime()
        break
      case 'location':
        comparison = a.location.localeCompare(b.location)
        break
      case 'species':
        const aSpecies = a.fish_species?.name || ''
        const bSpecies = b.fish_species?.name || ''
        comparison = aSpecies.localeCompare(bSpecies)
        break
      case 'size':
        const aSize = a.length_cm || 0
        const bSize = b.length_cm || 0
        comparison = aSize - bSize
        break
      case 'weight':
        const aWeight = a.weight_kg || 0
        const bWeight = b.weight_kg || 0
        comparison = aWeight - bWeight
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })
}

// Filter catches by species
export const filterBySpecies = (catches: Catch[], speciesId: string): Catch[] => {
  if (!speciesId) return catches
  return catches.filter(c => c.fish_species_id === speciesId)
}

// Filter catches by location
export const filterByLocation = (catches: Catch[], location: string): Catch[] => {
  if (!location) return catches
  return catches.filter(c => c.location.toLowerCase().includes(location.toLowerCase()))
}

// Filter catches by date range
export const filterByDateRange = (catches: Catch[], startDate: string | null, endDate: string | null): Catch[] => {
  if (!startDate && !endDate) return catches
  
  return catches.filter(c => {
    const catchDate = new Date(c.caught_at)
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null
    
    if (start && catchDate < start) return false
    if (end && catchDate > end) return false
    return true
  })
}

// Get fish species name
export const getSpeciesName = (catchItem: Catch): string => {
  return catchItem.fish_species?.name || 'Onbekend'
}

// Get bait type name
export const getBaitName = (catchItem: Catch): string => {
  return catchItem.bait_type?.name || 'Onbekend'
}

// Get rod name
export const getRodName = (catchItem: Catch): string => {
  return catchItem.fishing_rod?.name || 'Geen'
}

// Truncate text
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Generate unique filename for uploads
export const generateFileName = (originalName: string, userId: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = originalName.split('.').pop()
  return `${userId}_${timestamp}_${random}.${ext}`
}
