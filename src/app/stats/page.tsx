'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Fish, Layers, Plus, Scale, Weight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCatches } from '@/hooks/useCatches'
import { Catch } from '@/types/database'
import { formatLength, formatWeight, getSpeciesName, pluralize } from '@/lib/utils'
import { AuthGuard } from '@/components/AuthGuard'
import { BarList, ColumnChart, Datum } from '@/components/Charts'
import { FishShape } from '@/components/FishArt'
import { EmptyState, ErrorBanner, PageHeader, StatTile } from '@/components/ui/Bits'
import { PageLoader } from '@/components/ui/PageLoader'

type Range = 'all' | 'year' | 'month' | 'week'

const ranges: { value: Range; label: string; days: number | null }[] = [
  { value: 'all', label: 'Alles', days: null },
  { value: 'year', label: 'Jaar', days: 365 },
  { value: 'month', label: '30 dagen', days: 30 },
  { value: 'week', label: '7 dagen', days: 7 },
]

const countBy = (catches: Catch[], key: (c: Catch) => string | null | undefined) => {
  const counts = new Map<string, number>()
  for (const c of catches) {
    const k = key(c)
    if (k) counts.set(k, (counts.get(k) || 0) + 1)
  }
  return [...counts.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

/** Tijdlijn: per maand (alles/jaar) of per dag (30/7 dagen). */
const buildTimeline = (catches: Catch[], range: Range, now: Date): Datum[] => {
  if (range === 'all' || range === 'year') {
    return Array.from({ length: 12 }, (_, i) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
      const value = catches.filter((c) => {
        const d = new Date(c.caught_at)
        return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear()
      }).length
      return {
        label: month.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' }),
        tick: month.toLocaleDateString('nl-NL', { month: 'short' }).replace('.', ''),
        value,
      }
    })
  }
  const days = range === 'month' ? 30 : 7
  const today = startOfDay(now)
  return Array.from({ length: days }, (_, i) => {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1 - i))
    const value = catches.filter((c) => startOfDay(new Date(c.caught_at)).getTime() === day.getTime()).length
    return {
      label: day.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }),
      tick: days === 7 ? day.toLocaleDateString('nl-NL', { weekday: 'short' }) : i % 5 === 4 || i === 0 ? String(day.getDate()) : '',
      value,
    }
  })
}

const Panel = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
  <section className={`card p-5 sm:p-6 ${className}`}>
    <h2 className="display text-xl text-ink">{title}</h2>
    {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
    <div className="mt-5">{children}</div>
  </section>
)

export default function StatsPage() {
  const { user } = useAuth()
  const { catches, loading, error, refresh } = useCatches(user?.id || null)
  const [range, setRange] = useState<Range>('all')

  const stats = useMemo(() => {
    const now = new Date()
    const days = ranges.find((r) => r.value === range)?.days ?? null
    const since = days ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : null
    // Alle onderdelen van de pagina rekenen met dezelfde periode.
    const scoped = since ? catches.filter((c) => new Date(c.caught_at) >= since) : catches

    const weighed = scoped.filter((c) => c.weight_kg !== null)
    const totalWeight = weighed.reduce((sum, c) => sum + (c.weight_kg || 0), 0)
    const heaviest = weighed.reduce<Catch | null>((best, c) => (!best || c.weight_kg! > best.weight_kg! ? c : best), null)

    const hours = Array.from({ length: 24 }, () => 0)
    for (const c of scoped) hours[new Date(c.caught_at).getHours()]++
    const peakHour = hours.indexOf(Math.max(...hours))

    const recordMap = new Map<string, { species: string; count: number; heaviest: number | null; longest: number | null }>()
    for (const c of scoped) {
      const species = getSpeciesName(c)
      const entry = recordMap.get(species) || { species, count: 0, heaviest: null, longest: null }
      entry.count++
      if (c.weight_kg !== null && (entry.heaviest === null || c.weight_kg > entry.heaviest)) entry.heaviest = c.weight_kg
      if (c.length_cm !== null && (entry.longest === null || c.length_cm > entry.longest)) entry.longest = c.length_cm
      recordMap.set(species, entry)
    }

    return {
      total: scoped.length,
      totalWeight,
      weighedCount: weighed.length,
      avgWeight: weighed.length ? totalWeight / weighed.length : null,
      heaviest,
      species: countBy(scoped, getSpeciesName),
      baits: countBy(scoped, (c) => c.bait_type?.name),
      locations: countBy(scoped, (c) => c.location.trim()).slice(0, 5),
      timeline: buildTimeline(scoped, range, now),
      hours: hours.map((value, hour) => ({
        label: `${String(hour).padStart(2, '0')}:00–${String((hour + 1) % 24).padStart(2, '0')}:00`,
        tick: hour % 6 === 0 ? `${String(hour).padStart(2, '0')}u` : '',
        value,
      })),
      peakHour,
      records: [...recordMap.values()].sort((a, b) => b.count - a.count),
    }
  }, [catches, range])

  const share = (value: number) => `${Math.round((value / stats.total) * 100)}%`

  return (
    <AuthGuard>
      <div className="page space-y-6">
        <PageHeader
          eyebrow="Inzicht"
          title="Statistieken"
          subtitle="Wat vang je, waar, wanneer en waarmee?"
          actions={
            catches.length > 0 && (
              <div role="group" aria-label="Periode" className="flex rounded-2xl border border-line bg-surface p-1 shadow-card">
                {ranges.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRange(r.value)}
                    aria-pressed={range === r.value}
                    className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                      range === r.value ? 'bg-brand text-on-brand' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )
          }
        />

        {error && <ErrorBanner message={error} onRetry={refresh} />}

        {loading && catches.length === 0 ? (
          <PageLoader label="Statistieken berekenen…" />
        ) : catches.length === 0 && !error ? (
          <EmptyState
            art={<span className="water inline-flex size-24 items-center justify-center rounded-[2rem]"><FishShape className="w-14 animate-bob" /></span>}
            title="Nog niets te tellen"
            description="Zodra je vangsten vastlegt, zie je hier je beste aas, favoriete stekken, bijttijden en persoonlijke records."
            action={<Link href="/catches/new" className="btn btn-accent"><Plus className="size-4" />Eerste vangst toevoegen</Link>}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <StatTile icon={Fish} label="Vangsten" value={stats.total} hint={range === 'all' ? 'Sinds je begon' : `Laatste ${ranges.find((r) => r.value === range)!.label.toLowerCase()}`} />
              <StatTile icon={Layers} tone="reed" label="Soorten" value={stats.species.length} hint={stats.species[0] ? `Meest: ${stats.species[0].label}` : 'Nog geen'} />
              <StatTile icon={Weight} tone="accent" label="Totaal gewicht" value={stats.weighedCount ? formatWeight(stats.totalWeight) : '—'} hint={`${pluralize(stats.weighedCount, 'vangst', 'vangsten')} gewogen`} />
              <StatTile icon={Scale} tone="gold" label="Gemiddeld" value={formatWeight(stats.avgWeight)} hint={stats.heaviest ? `Zwaarste: ${formatWeight(stats.heaviest.weight_kg)} (${getSpeciesName(stats.heaviest)})` : 'Weeg je vangsten voor een gemiddelde'} />
            </div>

            {stats.total === 0 ? (
              <p className="card px-6 py-12 text-center text-muted">Geen vangsten in deze periode. Kies een langere periode.</p>
            ) : (
              <>
                <div className="grid gap-5 lg:grid-cols-5">
                  <Panel
                    className="lg:col-span-3"
                    title={range === 'month' || range === 'week' ? 'Vangsten per dag' : 'Vangsten per maand'}
                    subtitle={range === 'month' ? 'Afgelopen 30 dagen' : range === 'week' ? 'Afgelopen 7 dagen' : 'Afgelopen 12 maanden'}
                  >
                    <ColumnChart data={stats.timeline} unit={['vangst', 'vangsten']} caption="Aantal vangsten per periode" />
                  </Panel>
                  <Panel
                    className="lg:col-span-2"
                    title="Bijttijden"
                    subtitle={`Meeste beet tussen ${stats.hours[stats.peakHour].label.replace('–', ' en ')}`}
                  >
                    <ColumnChart data={stats.hours} unit={['vangst', 'vangsten']} caption="Aantal vangsten per uur van de dag" />
                  </Panel>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                  <Panel title="Vissoorten" subtitle="Aandeel in je vangsten">
                    <BarList data={stats.species.slice(0, 6).map((s) => ({ ...s, sub: share(s.value) }))} />
                  </Panel>
                  <Panel title="Beste aas" subtitle="Waar ze op bijten">
                    {stats.baits.length ? (
                      <BarList data={stats.baits.slice(0, 6).map((b) => ({ ...b, sub: share(b.value) }))} />
                    ) : (
                      <p className="text-sm text-muted">Nog geen aas vastgelegd.</p>
                    )}
                  </Panel>
                  <Panel title="Topstekken" subtitle="Waar je het vaakst vangt">
                    <BarList ranked data={stats.locations} />
                  </Panel>
                </div>

                <Panel title="Persoonlijke records" subtitle="Je beste vis per soort in deze periode">
                  <div className="-mx-5 overflow-x-auto sm:-mx-6">
                    <table className="w-full min-w-[26rem] text-sm">
                      <thead>
                        <tr className="border-b border-line text-left text-xs tracking-wide text-muted uppercase">
                          <th scope="col" className="px-5 py-2.5 font-medium sm:px-6">Soort</th>
                          <th scope="col" className="px-3 py-2.5 text-right font-medium">Aantal</th>
                          <th scope="col" className="px-3 py-2.5 text-right font-medium">Zwaarste</th>
                          <th scope="col" className="px-5 py-2.5 text-right font-medium sm:px-6">Langste</th>
                        </tr>
                      </thead>
                      <tbody className="tnum divide-y divide-line">
                        {stats.records.map((record) => (
                          <tr key={record.species}>
                            <th scope="row" className="px-5 py-3 text-left font-semibold text-ink sm:px-6">{record.species}</th>
                            <td className="px-3 py-3 text-right text-muted">{record.count}×</td>
                            <td className="px-3 py-3 text-right text-ink">{formatWeight(record.heaviest)}</td>
                            <td className="px-5 py-3 text-right text-ink sm:px-6">{formatLength(record.longest)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              </>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  )
}
