import { useState, useEffect, useCallback } from 'react'
import { Catch, CatchInput, SortBy, SortOrder } from '@/types/database'
import { getCatches, createCatch, updateCatch, deleteCatch } from '@/lib/api'
import { sortCatches, filterBySpecies, filterByLocation, filterByDateRange } from '@/lib/utils'

export const useCatches = (userId: string | null) => {
  const [catches, setCatches] = useState<Catch[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [speciesFilter, setSpeciesFilter] = useState<string>('')
  const [locationFilter, setLocationFilter] = useState<string>('')
  const [startDateFilter, setStartDateFilter] = useState<string | null>(null)
  const [endDateFilter, setEndDateFilter] = useState<string | null>(null)

  const fetchCatches = useCallback(async () => {
    if (!userId) {
      setCatches([])
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const data = await getCatches(userId)
      setCatches(data)
    } catch (err) {
      setError('Failed to fetch catches')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchCatches()
  }, [fetchCatches])

  const addCatch = useCallback(async (input: CatchInput) => {
    if (!userId) {
      setError('User not authenticated')
      return null
    }
    
    setLoading(true)
    setError(null)
    try {
      const newCatch = await createCatch(userId, input)
      setCatches(prev => [newCatch, ...prev])
      return newCatch
    } catch (err) {
      setError('Failed to create catch')
      return null
    } finally {
      setLoading(false)
    }
  }, [userId])

  const editCatch = useCallback(async (id: string, input: Partial<CatchInput>) => {
    setLoading(true)
    setError(null)
    try {
      const updatedCatch = await updateCatch(id, input)
      setCatches(prev => prev.map(c => c.id === id ? updatedCatch : c))
      return updatedCatch
    } catch (err) {
      setError('Failed to update catch')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const removeCatch = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await deleteCatch(id)
      setCatches(prev => prev.filter(c => c.id !== id))
      return true
    } catch (err) {
      setError('Failed to delete catch')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Filtered and sorted catches
  const filteredCatches = sortCatches(
    filterByDateRange(
      filterByLocation(
        filterBySpecies(catches, speciesFilter),
        locationFilter
      ),
      startDateFilter,
      endDateFilter
    ),
    sortBy,
    sortOrder
  )

  return {
    catches: filteredCatches,
    loading,
    error,
    fetchCatches,
    addCatch,
    editCatch,
    removeCatch,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    speciesFilter,
    setSpeciesFilter,
    locationFilter,
    setLocationFilter,
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
  }
}
