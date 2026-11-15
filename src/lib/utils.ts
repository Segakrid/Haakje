import { format, formatDistanceToNowStrict, isToday, isYesterday, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'
import { Catch, SortBy, SortOrder } from '@/types/database'

// ---------- Weergave ----------

export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), "d MMMM yyyy 'om' HH:mm", { locale: nl })
  } catch {
    return dateString
  }
}

/** Korte datum voor kaarten: "Vandaag", "Gisteren" of "12 okt 2026". */
export const formatDateShort = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    if (isToday(date)) return `Vandaag, ${format(date, 'HH:mm')}`
    if (isYesterday(date)) return `Gisteren, ${format(date, 'HH:mm')}`
    return format(date, 'd MMM yyyy', { locale: nl })
  } catch {
    return dateString
  }
}

export const formatRelative = (dateString: string): string => {
  try {
    return formatDistanceToNowStrict(parseISO(dateString), { locale: nl, addSuffix: true })
  } catch {
    return ''
  }
}

const nf = (digits: number) =>
  new Intl.NumberFormat('nl-NL', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const formatWeight = (kg: number | null | undefined): string => {
  if (kg === null || kg === undefined) return '—'
  if (kg < 1) return `${nf(0).format(Math.round(kg * 1000))} g`
  return `${nf(2).format(kg)} kg`
}

export const formatLength = (cm: number | null | undefined): string => {
  if (cm === null || cm === undefined) return '—'
  return `${new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 1 }).format(cm)} cm`
}

export const pluralize = (count: number, singular: string, plural: string): string =>
  `${count} ${count === 1 ? singular : plural}`

export const getSpeciesName = (catchItem: Catch): string => catchItem.fish_species?.name || 'Onbekende vis'
export const getBaitName = (catchItem: Catch): string => catchItem.bait_type?.name || 'Onbekend'
export const getRodName = (catchItem: Catch): string => catchItem.fishing_rod?.name || 'Geen'

/** Stabiele tint (0-359) per naam, voor de illustratie bij vangsten zonder foto. */
export const hueFromString = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  // Blijf in het water: van groenblauw (150) tot diepblauw (230).
  return 150 + (hash % 80)
}

export const greeting = (date = new Date()): string => {
  const hour = date.getHours()
  if (hour < 6) return 'Goedenacht'
  if (hour < 12) return 'Goedemorgen'
  if (hour < 18) return 'Goedemiddag'
  return 'Goedenavond'
}

// ---------- Datums in formulieren ----------

/** Date -> waarde voor <input type="datetime-local"> in lokale tijd. */
export const toDateTimeLocal = (date: Date): string => format(date, "yyyy-MM-dd'T'HH:mm")

// ---------- Sorteren & filteren ----------

export const sortCatches = (catches: Catch[], sortBy: SortBy, sortOrder: SortOrder): Catch[] => {
  const direction = sortOrder === 'asc' ? 1 : -1
  // Vangsten zonder gewicht/lengte horen altijd onderaan, welke richting ook.
  const byNumber = (a: number | null, b: number | null) => {
    if (a === null && b === null) return 0
    if (a === null) return 1
    if (b === null) return -1
    return (a - b) * direction
  }

  return [...catches].sort((a, b) => {
    switch (sortBy) {
      case 'location':
        return a.location.localeCompare(b.location, 'nl') * direction
      case 'species':
        return getSpeciesName(a).localeCompare(getSpeciesName(b), 'nl') * direction
      case 'size':
        return byNumber(a.length_cm, b.length_cm)
      case 'weight':
        return byNumber(a.weight_kg, b.weight_kg)
      case 'date':
      default:
        return (new Date(a.caught_at).getTime() - new Date(b.caught_at).getTime()) * direction
    }
  })
}

export interface CatchFilters {
  query: string
  speciesId: string
  rodId: string
  startDate: string | null
  endDate: string | null
}

export const emptyFilters: CatchFilters = { query: '', speciesId: '', rodId: '', startDate: null, endDate: null }

export const filterCatches = (catches: Catch[], filters: CatchFilters): Catch[] => {
  const query = filters.query.trim().toLowerCase()
  // Datumvelden geven "yyyy-mm-dd"; reken in lokale tijd en neem de einddag volledig mee.
  const start = filters.startDate ? new Date(`${filters.startDate}T00:00:00`) : null
  const end = filters.endDate ? new Date(`${filters.endDate}T23:59:59.999`) : null

  return catches.filter((c) => {
    if (filters.speciesId && c.fish_species_id !== filters.speciesId) return false
    if (filters.rodId && c.fishing_rod_id !== filters.rodId) return false
    if (start || end) {
      const caught = new Date(c.caught_at)
      if (start && caught < start) return false
      if (end && caught > end) return false
    }
    if (!query) return true
    return [getSpeciesName(c), c.location, c.bait_type?.name, c.fishing_rod?.name, c.notes]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(query))
  })
}

/** Id's van vangsten die het persoonlijk record (zwaarste) van hun soort zijn. */
export const personalRecordIds = (catches: Catch[]): Set<string> => {
  const best = new Map<string, Catch>()
  const perSpecies = new Map<string, number>()
  for (const c of catches) {
    if (!c.fish_species_id) continue
    perSpecies.set(c.fish_species_id, (perSpecies.get(c.fish_species_id) || 0) + 1)
    if (c.weight_kg === null) continue
    const current = best.get(c.fish_species_id)
    if (!current || c.weight_kg > (current.weight_kg ?? 0)) best.set(c.fish_species_id, c)
  }
  // Een record telt pas als er iets te verbeteren viel: minstens 2 vangsten van die soort.
  return new Set(
    [...best.entries()].filter(([speciesId]) => (perSpecies.get(speciesId) || 0) > 1).map(([, c]) => c.id)
  )
}

// ---------- Uploads ----------

export const generateFileName = (originalName: string, userId: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = (originalName.includes('.') ? originalName.split('.').pop() : 'jpg')?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  return `${userId}_${timestamp}_${random}.${ext}`
}

/**
 * Verkleint een foto tot max. 1800px en zet hem om naar JPEG. Scheelt opslag,
 * data en wachttijd aan de waterkant. Bij twijfel komt het origineel terug.
 */
export const compressImage = async (file: File, maxSize = 1800, quality = 0.82): Promise<File> => {
  if (typeof document === 'undefined' || !file.type.startsWith('image/') || file.type === 'image/gif') return file
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' })
  } catch {
    return file
  }
}

// ---------- Foutmeldingen ----------

export const translateAuthError = (message: string): string => {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Onjuist e-mailadres of wachtwoord.'
  if (m.includes('email not confirmed')) return 'Bevestig eerst je e-mailadres via de link in je inbox.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'Er bestaat al een account met dit e-mailadres.'
  if (m.includes('rate limit') || m.includes('too many') || m.includes('security purposes')) return 'Te veel pogingen. Wacht even en probeer het opnieuw.'
  if (m.includes('password should be') || m.includes('weak password')) return 'Kies een sterker wachtwoord (minimaal 6 tekens).'
  if (m.includes('different from the old password')) return 'Kies een ander wachtwoord dan je vorige.'
  if (m.includes('unable to validate email') || m.includes('invalid email')) return 'Dit e-mailadres lijkt niet te kloppen.'
  if (m.includes('failed to fetch') || m.includes('network')) return 'Geen verbinding. Controleer je internet en probeer het opnieuw.'
  return 'Er ging iets mis. Probeer het opnieuw.'
}
