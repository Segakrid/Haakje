import { useCallback, useEffect, useState } from 'react'
import { Catch, CatchInput } from '@/types/database'
import { getCatches, createCatch, updateCatch, deleteCatch, CatchUpdateInput } from '@/lib/api'

// Eenvoudige cache per gebruiker: bij terugnavigeren staan de vangsten er direct,
// terwijl op de achtergrond de verse lijst wordt opgehaald.
const cache = new Map<string, Catch[]>()

export const clearCatchCache = () => cache.clear()

const byDateDesc = (list: Catch[]) =>
  [...list].sort((a, b) => new Date(b.caught_at).getTime() - new Date(a.caught_at).getTime())

export const useCatches = (userId: string | null) => {
  const [catches, setCatches] = useState<Catch[]>(() => (userId && cache.get(userId)) || [])
  const [loadedFor, setLoadedFor] = useState<string | null>(() => (userId && cache.has(userId) ? userId : null))
  const [error, setError] = useState<string | null>(null)

  const commit = useCallback(
    (update: (prev: Catch[]) => Catch[]) => {
      setCatches((prev) => {
        const next = byDateDesc(update(prev))
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
    getCatches(userId)
      .then((data) => {
        cache.set(userId, data)
        if (!active) return
        setCatches(data)
        setError(null)
      })
      .catch(() => {
        if (active) setError('Je vangsten konden niet worden geladen.')
      })
      .finally(() => {
        if (active) setLoadedFor(userId)
      })
    return () => {
      active = false
    }
  }, [userId, reloadKey])

  const addCatch = useCallback(
    async (input: CatchInput) => {
      if (!userId) throw new Error('Niet ingelogd')
      const created = await createCatch(userId, input)
      commit((prev) => [created, ...prev])
      return created
    },
    [userId, commit]
  )

  const editCatch = useCallback(
    async (id: string, input: CatchUpdateInput) => {
      if (!userId) throw new Error('Niet ingelogd')
      const updated = await updateCatch(id, userId, input)
      commit((prev) => (prev.some((c) => c.id === id) ? prev.map((c) => (c.id === id ? updated : c)) : [updated, ...prev]))
      return updated
    },
    [userId, commit]
  )

  const removeCatch = useCallback(
    async (id: string) => {
      await deleteCatch(id)
      commit((prev) => prev.filter((c) => c.id !== id))
    },
    [commit]
  )

  return {
    catches,
    loading: !userId || loadedFor !== userId,
    error,
    refresh,
    addCatch,
    editCatch,
    removeCatch,
  }
}
