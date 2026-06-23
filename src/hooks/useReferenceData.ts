import { useState, useEffect, useCallback } from 'react'
import { FishSpecies, BaitType } from '@/types/database'
import { getFishSpecies, getBaitTypes } from '@/lib/api'

export const useReferenceData = () => {
  const [fishSpecies, setFishSpecies] = useState<FishSpecies[]>([])
  const [baitTypes, setBaitTypes] = useState<BaitType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReferenceData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [species, baits] = await Promise.all([
        getFishSpecies(),
        getBaitTypes(),
      ])
      setFishSpecies(species)
      setBaitTypes(baits)
    } catch (err) {
      setError('Failed to fetch reference data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReferenceData()
  }, [fetchReferenceData])

  return {
    fishSpecies,
    baitTypes,
    loading,
    error,
    fetchReferenceData,
  }
}
