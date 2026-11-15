'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCatches } from '@/hooks/useCatches'
import { useReferenceData } from '@/hooks/useReferenceData'
import { useFishingRods } from '@/hooks/useFishingRods'
import { useToast } from '@/providers/ToastProvider'
import { Catch, SortBy, SortOrder } from '@/types/database'
import { CatchFilters, emptyFilters, filterCatches, getSpeciesName, personalRecordIds, pluralize, sortCatches } from '@/lib/utils'
import { AuthGuard } from '@/components/AuthGuard'
import { CatchCard } from '@/components/CatchCard'
import { FishShape } from '@/components/FishArt'
import { ConfirmDialog, Dialog } from '@/components/ui/Dialog'
import { CardGridSkeleton, EmptyState, ErrorBanner, PageHeader } from '@/components/ui/Bits'

const sortOptions: { value: SortBy; label: string }[] = [
  { value: 'date', label: 'Datum' },
  { value: 'weight', label: 'Gewicht' },
  { value: 'size', label: 'Lengte' },
  { value: 'species', label: 'Vissoort' },
  { value: 'location', label: 'Locatie' },
]

const formatDay = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })

export default function CatchesPage() {
  const { user } = useAuth()
  const { catches, loading, error, refresh, removeCatch } = useCatches(user?.id || null)
  const { fishSpecies } = useReferenceData()
  const { rods } = useFishingRods(user?.id || null)
  const toast = useToast()

  const [filters, setFilters] = useState<CatchFilters>(emptyFilters)
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Catch | null>(null)
  const [deleting, setDeleting] = useState(false)

  const records = useMemo(() => personalRecordIds(catches), [catches])
  const visible = useMemo(
    () => sortCatches(filterCatches(catches, filters), sortBy, sortOrder),
    [catches, filters, sortBy, sortOrder]
  )

  const patch = (update: Partial<CatchFilters>) => setFilters((prev) => ({ ...prev, ...update }))

  const activeChips = [
    filters.speciesId && {
      key: 'species',
      label: fishSpecies.find((s) => s.id === filters.speciesId)?.name || 'Vissoort',
      clear: () => patch({ speciesId: '' }),
    },
    filters.rodId && {
      key: 'rod',
      label: rods.find((r) => r.id === filters.rodId)?.name || 'Hengel',
      clear: () => patch({ rodId: '' }),
    },
    filters.startDate && { key: 'start', label: `Vanaf ${formatDay(filters.startDate)}`, clear: () => patch({ startDate: null }) },
    filters.endDate && { key: 'end', label: `T/m ${formatDay(filters.endDate)}`, clear: () => patch({ endDate: null }) },
  ].filter((chip): chip is { key: string; label: string; clear: () => void } => !!chip)

  const isFiltering = activeChips.length > 0 || filters.query.trim() !== ''

  // Alleen soorten aanbieden die de visser ook echt gevangen heeft.
  const caughtSpecies = useMemo(() => {
    const ids = new Set(catches.map((c) => c.fish_species_id))
    return fishSpecies.filter((s) => ids.has(s.id))
  }, [catches, fishSpecies])

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await removeCatch(pendingDelete.id)
      toast.success('Vangst verwijderd')
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
          eyebrow="Logboek"
          title="Mijn vangsten"
          subtitle={
            loading && catches.length === 0
              ? 'Vangsten laden…'
              : isFiltering
                ? `${visible.length} van ${pluralize(catches.length, 'vangst', 'vangsten')}`
                : `${pluralize(catches.length, 'vangst', 'vangsten')} in je logboek`
          }
        />

        {error && <ErrorBanner message={error} onRetry={refresh} />}

        {catches.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={filters.query}
                  onChange={(e) => patch({ query: e.target.value })}
                  placeholder="Zoek op soort, stek, aas of notitie"
                  aria-label="Vangsten zoeken"
                  className="input pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} aria-label="Sorteren op" className="input min-w-36 flex-1 sm:w-44 sm:flex-none">
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'))}
                  className="btn btn-ghost px-3"
                  aria-label={sortOrder === 'asc' ? 'Oplopend gesorteerd — wissel naar aflopend' : 'Aflopend gesorteerd — wissel naar oplopend'}
                  title={sortOrder === 'asc' ? 'Oplopend' : 'Aflopend'}
                >
                  {sortOrder === 'asc' ? <ArrowUpNarrowWide className="size-5" /> : <ArrowDownWideNarrow className="size-5" />}
                </button>
                <button onClick={() => setShowFilters(true)} className="btn btn-ghost relative">
                  <SlidersHorizontal className="size-4" />
                  Filters
                  {activeChips.length > 0 && (
                    <span className="tnum inline-flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-on-accent">
                      {activeChips.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <button key={chip.key} onClick={chip.clear} className="chip border-brand/30 bg-brand-soft text-brand hover:brightness-95" aria-label={`Filter ${chip.label} verwijderen`}>
                    {chip.label}
                    <X className="size-3.5" />
                  </button>
                ))}
                <button onClick={() => setFilters(emptyFilters)} className="text-sm font-medium text-muted underline underline-offset-2 hover:text-ink">
                  Alles wissen
                </button>
              </div>
            )}
          </div>
        )}

        {loading && catches.length === 0 ? (
          <CardGridSkeleton />
        ) : catches.length === 0 && !error ? (
          <EmptyState
            art={<span className="water inline-flex size-24 items-center justify-center rounded-[2rem]"><FishShape className="w-14 animate-bob" /></span>}
            title="Je logboek wacht op de eerste vis"
            description="Leg je eerstvolgende vangst vast met soort, gewicht, stek en foto. Vanaf dan bouwt Haakje je statistieken op."
            action={<Link href="/catches/new" className="btn btn-accent"><Plus className="size-4" />Eerste vangst toevoegen</Link>}
          />
        ) : visible.length === 0 && catches.length > 0 ? (
          <div className="card flex flex-col items-center px-6 py-12 text-center">
            <p className="display text-xl text-ink">Niets gevonden</p>
            <p className="mt-1.5 text-muted">Geen enkele vangst past bij deze zoekopdracht of filters.</p>
            <button onClick={() => setFilters(emptyFilters)} className="btn btn-ghost mt-5">Filters wissen</button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((catchItem, i) => (
              <CatchCard
                key={catchItem.id}
                catchItem={catchItem}
                isRecord={records.has(catchItem.id)}
                onDelete={setPendingDelete}
                delay={Math.min(i, 8) * 50}
              />
            ))}
          </div>
        )}

        <Dialog
          open={showFilters}
          onClose={() => setShowFilters(false)}
          title="Filters"
          sheet
          footer={
            <>
              <button onClick={() => setFilters((prev) => ({ ...emptyFilters, query: prev.query }))} className="btn btn-ghost flex-1">Wissen</button>
              <button onClick={() => setShowFilters(false)} className="btn btn-primary flex-1">
                Toon {pluralize(visible.length, 'vangst', 'vangsten')}
              </button>
            </>
          }
        >
          <div className="space-y-5 pb-2">
            <div>
              <label htmlFor="filter-species" className="label">Vissoort</label>
              <select id="filter-species" value={filters.speciesId} onChange={(e) => patch({ speciesId: e.target.value })} className="input">
                <option value="">Alle vissoorten</option>
                {caughtSpecies.map((species) => (
                  <option key={species.id} value={species.id}>{species.name}</option>
                ))}
              </select>
            </div>
            {rods.length > 0 && (
              <div>
                <label htmlFor="filter-rod" className="label">Hengel</label>
                <select id="filter-rod" value={filters.rodId} onChange={(e) => patch({ rodId: e.target.value })} className="input">
                  <option value="">Alle hengels</option>
                  {rods.map((rod) => (
                    <option key={rod.id} value={rod.id}>{rod.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="filter-start" className="label">Vanaf</label>
                <input id="filter-start" type="date" value={filters.startDate || ''} max={filters.endDate || undefined} onChange={(e) => patch({ startDate: e.target.value || null })} className="input" />
              </div>
              <div>
                <label htmlFor="filter-end" className="label">Tot en met</label>
                <input id="filter-end" type="date" value={filters.endDate || ''} min={filters.startDate || undefined} onChange={(e) => patch({ endDate: e.target.value || null })} className="input" />
              </div>
            </div>
          </div>
        </Dialog>

        <ConfirmDialog
          open={!!pendingDelete}
          onClose={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
          busy={deleting}
          title="Vangst verwijderen?"
          description={
            pendingDelete
              ? `Je ${getSpeciesName(pendingDelete).toLowerCase()} van ${pendingDelete.location} wordt definitief verwijderd, inclusief foto's. Dit kan niet ongedaan worden gemaakt.`
              : ''
          }
        />
      </div>
    </AuthGuard>
  )
}
