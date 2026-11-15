import { useEffect, useState } from 'react'
import { FishSpecies, BaitType } from '@/types/database'
import { getFishSpecies, getBaitTypes } from '@/lib/api'

interface ReferenceData {
  fishSpecies: FishSpecies[]
  baitTypes: BaitType[]
}

// Vissoorten en aassoorten veranderen zelden: één keer ophalen per sessie volstaat.
let cached: ReferenceData | null = null
let pending: Promise<ReferenceData> | null = null

const load = (): Promise<ReferenceData> => {
  if (!pending) {
    pending = Promise.all([getFishSpecies(), getBaitTypes()])
      .then(([fishSpecies, baitTypes]) => {
        cached = { fishSpecies, baitTypes }
        return cached
      })
      .catch((err) => {
        pending = null
        throw err
      })
  }
  return pending
}

export const useReferenceData = () => {
  const [data, setData] = useState<ReferenceData | null>(cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cached) return
    let active = true
    load()
      .then((result) => {
        if (active) setData(result)
      })
      .catch(() => {
        if (active) setError('Vissoorten en aassoorten konden niet worden geladen.')
      })
    return () => {
      active = false
    }
  }, [])

  return {
    fishSpecies: data?.fishSpecies ?? [],
    baitTypes: data?.baitTypes ?? [],
    loading: !data && !error,
    error,
  }
}
