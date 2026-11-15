import { useCallback, useEffect, useState } from 'react'
import { FishingRod, FishingRodInput } from '@/types/database'
import { getFishingRods, createFishingRod, updateFishingRod, deleteFishingRod } from '@/lib/api'

const cache = new Map<string, FishingRod[]>()

export const clearRodCache = () => cache.clear()

export const useFishingRods = (userId: string | null) => {
  const [rods, setRods] = useState<FishingRod[]>(() => (userId && cache.get(userId)) || [])
  const [loadedFor, setLoadedFor] = useState<string | null>(() => (userId && cache.has(userId) ? userId : null))
  const [error, setError] = useState<string | null>(null)

  const commit = useCallback(
    (update: (prev: FishingRod[]) => FishingRod[]) => {
      setRods((prev) => {
        const next = update(prev)
        if (userId) cache.set(userId, next)
        return next
      })
    },
    [userId]
  )

  const [reloadKey, setReloadKey] = useState(0)
  const refresh = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    if (!userId) return
    let active = true
    getFishingRods(userId)
      .then((data) => {
        cache.set(userId, data)
        if (!active) return
        setRods(data)
        setError(null)
      })
      .catch(() => {
        if (active) setError('Je hengels konden niet worden geladen.')
      })
      .finally(() => {
        if (active) setLoadedFor(userId)
      })
    return () => {
      active = false
    }
  }, [userId, reloadKey])

  const addRod = useCallback(
    async (input: FishingRodInput) => {
      if (!userId) throw new Error('Niet ingelogd')
      const created = await createFishingRod(userId, input)
      commit((prev) => [created, ...prev])
      return created
    },
    [userId, commit]
  )

  const editRod = useCallback(
    async (id: string, input: Partial<FishingRodInput>) => {
      const updated = await updateFishingRod(id, input)
      commit((prev) => prev.map((r) => (r.id === id ? updated : r)))
      return updated
    },
    [commit]
  )

  const removeRod = useCallback(
    async (id: string) => {
      await deleteFishingRod(id)
      commit((prev) => prev.filter((r) => r.id !== id))
    },
    [commit]
  )

  return {
    rods,
    loading: !userId || loadedFor !== userId,
    error,
    refresh,
    addRod,
    editRod,
    removeRod,
  }
}
