'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { FishingRod as FishingRodIcon, Plus, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useFishingRods } from '@/hooks/useFishingRods'
import { useCatches } from '@/hooks/useCatches'
import { useToast } from '@/providers/ToastProvider'
import { FishingRod } from '@/types/database'
import { pluralize } from '@/lib/utils'
import { AuthGuard } from '@/components/AuthGuard'
import { RodCard } from '@/components/RodCard'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { CardGridSkeleton, EmptyState, ErrorBanner, PageHeader } from '@/components/ui/Bits'

export default function RodsPage() {
  const { user } = useAuth()
  const { rods, loading, error, refresh, removeRod } = useFishingRods(user?.id || null)
  const { catches } = useCatches(user?.id || null)
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [pendingDelete, setPendingDelete] = useState<FishingRod | null>(null)
  const [deleting, setDeleting] = useState(false)

  const catchCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of catches) {
      if (c.fishing_rod_id) counts.set(c.fishing_rod_id, (counts.get(c.fishing_rod_id) || 0) + 1)
    }
    return counts
  }, [catches])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rods
    return rods.filter((rod) =>
      [rod.name, rod.brand, rod.model, rod.material, rod.description].some((v) => v?.toLowerCase().includes(q))
    )
  }, [rods, query])

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await removeRod(pendingDelete.id)
      toast.success('Hengel verwijderd')
      setPendingDelete(null)
    } catch {
      toast.error('Verwijderen is mislukt. Probeer het opnieuw.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AuthGuard>
      <div className="page space-y-6">
        <PageHeader
          eyebrow="Materiaal"
          title="Mijn hengels"
          subtitle={loading ? 'Hengels laden…' : pluralize(rods.length, 'hengel', 'hengels') + ' in je foedraal'}
          actions={
            <Link href="/rods/new" className="btn btn-primary">
              <Plus className="size-4" />
              Nieuwe hengel
            </Link>
          }
        />

        {error && <ErrorBanner message={error} onRetry={refresh} />}

        {rods.length > 3 && (
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zoek op naam, merk of model" aria-label="Hengels zoeken" className="input pl-10" />
          </div>
        )}

        {loading && rods.length === 0 ? (
          <CardGridSkeleton count={3} />
        ) : rods.length === 0 && !error ? (
          <EmptyState
            art={<span className="water inline-flex size-20 items-center justify-center rounded-3xl"><FishingRodIcon className="size-10" /></span>}
            title="Je foedraal is nog leeg"
            description="Voeg je hengels toe en koppel ze aan vangsten. Zo zie je welke hengel het vaakst krom staat."
            action={<Link href="/rods/new" className="btn btn-primary"><Plus className="size-4" />Voeg je eerste hengel toe</Link>}
          />
        ) : filtered.length === 0 ? (
          <p className="card px-6 py-10 text-center text-muted">Geen hengels gevonden voor “{query}”.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((rod, i) => (
              <RodCard key={rod.id} rod={rod} catchCount={catchCounts.get(rod.id) || 0} onDelete={setPendingDelete} delay={Math.min(i, 8) * 50} />
            ))}
          </div>
        )}

        <ConfirmDialog
          open={!!pendingDelete}
          onClose={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
          busy={deleting}
          title="Hengel verwijderen?"
          description={
            pendingDelete
              ? `“${pendingDelete.name}” wordt verwijderd.${
                  (catchCounts.get(pendingDelete.id) || 0) > 0
                    ? ` Je ${pluralize(catchCounts.get(pendingDelete.id) || 0, 'vangst', 'vangsten')} met deze hengel ${(catchCounts.get(pendingDelete.id) || 0) === 1 ? 'blijft' : 'blijven'} bewaard, maar zonder hengel.`
                    : ''
                }`
              : ''
          }
        />
      </div>
    </AuthGuard>
  )
}
