'use client'

/* eslint-disable @next/next/no-img-element -- foto's komen uit Supabase Storage */
import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, BarChart3, CalendarDays, Check, Fish, FishingRod, MapPin, Plus, Trophy } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCatches } from '@/hooks/useCatches'
import { useFishingRods } from '@/hooks/useFishingRods'
import { formatDateShort, formatLength, formatWeight, getSpeciesName, greeting, personalRecordIds, pluralize } from '@/lib/utils'
import { CatchCard } from '@/components/CatchCard'
import { CatchPlaceholder, FishShape } from '@/components/FishArt'
import { CardGridSkeleton, ErrorBanner, StatTile } from '@/components/ui/Bits'

export const Dashboard = () => {
  const { user, displayName } = useAuth()
  const { catches, loading, error, refresh } = useCatches(user?.id || null)
  const { rods } = useFishingRods(user?.id || null)

  const summary = useMemo(() => {
    const now = new Date()
    const thisMonth = catches.filter((c) => {
      const d = new Date(c.caught_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    const weighed = catches.filter((c) => c.weight_kg !== null)
    const trophy = weighed.reduce<(typeof catches)[number] | null>((best, c) => (!best || c.weight_kg! > best.weight_kg! ? c : best), null)
    const locations = new Map<string, number>()
    for (const c of catches) locations.set(c.location, (locations.get(c.location) || 0) + 1)
    const topLocation = [...locations.entries()].sort((a, b) => b[1] - a[1])[0]
    return {
      thisMonth,
      trophy,
      species: new Set(catches.map((c) => c.fish_species_id).filter(Boolean)).size,
      topLocation,
      records: personalRecordIds(catches),
    }
  }, [catches])

  const today = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })
  const isNew = !loading && catches.length === 0 && !error

  return (
    <div className="page space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-rise">
          <p className="eyebrow first-letter:uppercase">{today}</p>
          <h1 className="display mt-1 text-4xl text-ink sm:text-5xl">
            {greeting()}, {displayName}
          </h1>
          <p className="mt-2 text-muted">
            {loading && catches.length === 0
              ? 'Je logboek wordt opgehaald…'
              : isNew
                ? 'Welkom bij Haakje. Laten we je logboek vullen.'
                : summary.thisMonth > 0
                  ? `Al ${pluralize(summary.thisMonth, 'vangst', 'vangsten')} deze maand. Lekker bezig!`
                  : 'Deze maand nog niets gevangen. Tijd om een lijntje uit te gooien?'}
          </p>
        </div>
      </header>

      {error && <ErrorBanner message={error} onRetry={refresh} />}

      {loading && catches.length === 0 ? (
        <CardGridSkeleton count={3} />
      ) : isNew ? (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="water relative overflow-hidden rounded-3xl p-8 sm:p-10">
            <FishShape className="pointer-events-none absolute -right-10 -bottom-8 w-72 text-white/[0.08]" />
            <h2 className="display relative text-3xl text-white sm:text-4xl">Je eerste vangst staat nog open.</h2>
            <p className="relative mt-3 max-w-md text-white/75">
              Leg hem vast met soort, gewicht, stek en foto. Daarna bouwt Haakje vanzelf je statistieken en records op.
            </p>
            <Link href="/catches/new" className="btn btn-accent relative mt-7 min-h-12 px-6">
              <Plus className="size-5" />
              Eerste vangst toevoegen
            </Link>
          </div>
          <div className="card p-6">
            <h2 className="display text-xl text-ink">Zo begin je</h2>
            <ol className="mt-4 space-y-4">
              {[
                { done: true, title: 'Account aangemaakt', text: 'Je logboek is klaar voor gebruik.' },
                { done: rods.length > 0, title: 'Voeg je hengels toe', text: 'Dan zie je straks welke het best vangt.', href: '/rods/new' },
                { done: false, title: 'Leg je eerste vangst vast', text: 'Aan de waterkant, in een halve minuut.', href: '/catches/new' },
              ].map((step) => (
                <li key={step.title} className="flex gap-3">
                  <span className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full ${step.done ? 'bg-reed text-white dark:text-on-brand' : 'border-2 border-line'}`}>
                    {step.done && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                  <div>
                    {step.href && !step.done ? (
                      <Link href={step.href} className="font-semibold text-ink underline decoration-line underline-offset-4 hover:decoration-brand">{step.title}</Link>
                    ) : (
                      <p className={`font-semibold ${step.done ? 'text-muted line-through' : 'text-ink'}`}>{step.title}</p>
                    )}
                    <p className="text-sm text-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : catches.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatTile icon={Fish} label="Vangsten" value={catches.length} hint={`${pluralize(summary.species, 'soort', 'soorten')} gevangen`} />
            <StatTile icon={CalendarDays} tone="accent" label="Deze maand" value={summary.thisMonth} hint={`Laatste: ${formatDateShort(catches[0].caught_at)}`} />
            <StatTile icon={MapPin} tone="reed" label="Topstek" value={<span className="block truncate text-xl sm:text-2xl">{summary.topLocation?.[0] ?? '—'}</span>} hint={summary.topLocation ? pluralize(summary.topLocation[1], 'vangst', 'vangsten') : undefined} />
            <StatTile icon={FishingRod} tone="gold" label="Hengels" value={rods.length} hint={rods.length ? 'In je foedraal' : 'Voeg er een toe'} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
            <section>
              <div className="mb-4 flex items-end justify-between">
                <h2 className="display text-2xl text-ink">Laatste vangsten</h2>
                <Link href="/catches" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                  Alles bekijken
                  <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {catches.slice(0, 4).map((c, i) => (
                  <CatchCard key={c.id} catchItem={c} isRecord={summary.records.has(c.id)} delay={i * 60} />
                ))}
              </div>
            </section>

            <aside className="space-y-5">
              {summary.trophy && (
                <Link href={`/catches/${summary.trophy.id}`} className="water group relative block overflow-hidden rounded-3xl p-6 transition hover:shadow-lift">
                  <div className="absolute inset-0 opacity-35 transition duration-500 group-hover:scale-105 group-hover:opacity-45">
                    {summary.trophy.images[0] ? (
                      <img src={summary.trophy.images[0]} alt="" className="size-full object-cover" />
                    ) : (
                      <CatchPlaceholder name={getSpeciesName(summary.trophy)} className="size-full" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06222b] via-[#06222b]/70 to-[#06222b]/30" />
                  <div className="relative">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6c544] px-3 py-1 text-xs font-bold tracking-wide text-[#3d2a00] uppercase">
                      <Trophy className="size-3.5" />
                      Jouw trofee
                    </span>
                    <p className="display tnum mt-16 text-5xl leading-none text-white">{formatWeight(summary.trophy.weight_kg)}</p>
                    <p className="display mt-2 text-2xl text-white">{getSpeciesName(summary.trophy)}</p>
                    <p className="mt-1 text-sm text-white/70">
                      {summary.trophy.length_cm !== null ? `${formatLength(summary.trophy.length_cm)} · ` : ''}
                      {summary.trophy.location}
                    </p>
                  </div>
                </Link>
              )}
              <div className="card p-5">
                <h2 className="display text-lg text-ink">Snel verder</h2>
                <div className="mt-3 space-y-1">
                  {[
                    { href: '/catches/new', icon: Plus, label: 'Nieuwe vangst' },
                    { href: '/stats', icon: BarChart3, label: 'Bekijk je statistieken' },
                    { href: '/rods', icon: FishingRod, label: 'Beheer je hengels' },
                  ].map(({ href, icon: Icon, label }) => (
                    <Link key={href} href={href} className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium text-ink hover:bg-surface-2">
                      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand"><Icon className="size-4" /></span>
                      {label}
                      <ArrowRight className="ml-auto size-4 text-muted transition group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  )
}
