import { useState, useEffect, useCallback } from 'react'
import { FishingRod, FishingRodInput } from '@/types/database'
import { getFishingRods, createFishingRod, updateFishingRod, deleteFishingRod } from '@/lib/api'

export const useFishingRods = (userId: string | null) => {
  const [rods, setRods] = useState<FishingRod[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRods = useCallback(async () => {
    if (!userId) {
      setRods([])
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const data = await getFishingRods(userId)
      setRods(data)
    } catch (err) {
      setError('Failed to fetch fishing rods')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchRods()
  }, [fetchRods])

  const addRod = useCallback(async (input: FishingRodInput) => {
    if (!userId) {
      setError('User not authenticated')
      return null
    }
    
    setLoading(true)
    setError(null)
    try {
      const newRod = await createFishingRod(userId, input)
      setRods(prev => [newRod, ...prev])
      return newRod
    } catch (err) {
      setError('Failed to create fishing rod')
      return null
    } finally {
      setLoading(false)
    }
  }, [userId])

  const editRod = useCallback(async (id: string, input: Partial<FishingRodInput>) => {
    setLoading(true)
    setError(null)
    try {
      const updatedRod = await updateFishingRod(id, input)
      setRods(prev => prev.map(r => r.id === id ? updatedRod : r))
      return updatedRod
    } catch (err) {
      setError('Failed to update fishing rod')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const removeRod = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await deleteFishingRod(id)
      setRods(prev => prev.filter(r => r.id !== id))
      return true
    } catch (err) {
      setError('Failed to delete fishing rod')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    rods,
    loading,
    error,
    fetchRods,
    addRod,
    editRod,
    removeRod,
  }
}
