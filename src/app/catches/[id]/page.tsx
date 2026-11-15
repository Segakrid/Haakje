'use client'

/* eslint-disable @next/next/no-img-element -- foto's komen uit Supabase Storage */
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, FishingRod as FishingRodIcon, MapPin, Pencil, Ruler, Trash2, Trophy, Weight, Worm, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCatches } from '@/hooks/useCatches'
import { useToast } from '@/providers/ToastProvider'
import { formatDate, formatLength, formatRelative, formatWeight, getSpeciesName, personalRecordIds } from '@/lib/utils'
import { AuthGuard } from '@/components/AuthGuard'
import { CatchPlaceholder, FishShape } from '@/components/FishArt'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/Bits'
import { PageLoader } from '@/components/ui/PageLoader'

export default function CatchDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { catches, loading, removeCatch } = useCatches(user?.id || null)
  const toast = useToast()

  const [activeImage, setActiveImage] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const catchItem = catches.find((c) => c.id === id)
  const isRecord = useMemo(() => personalRecordIds(catches).has(id), [catches, id])
  const imageCount = catchItem?.images.length ?? 0
  const current = Math.min(activeImage, Math.max(imageCount - 1, 0))

  const step = (delta: number) => {
    if (imageCount > 0) setActiveImage((i) => (Math.min(i, imageCount - 1) + delta + imageCount) % imageCount)
  }

  useEffect(() => {
    if (!lightbox) return
    const move = (delta: number) =>
      setActiveImage((i) => (imageCount > 0 ? (Math.min(i, imageCount - 1) + delta + imageCount) % imageCount : 0))
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowRight') move(1)
      if (e.key === 'ArrowLeft') move(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox, imageCount])

  const handleDelete = async () => {
    if (!catchItem) return
    setDeleting(true)
    try {
      await removeCatch(catchItem.id)
      toast.success('Vangst verwijderd')
      router.replace('/catches')
    } catch {
      toast.error('Verwijderen is mislukt. Probeer het opnieuw.')
      setDeleting(false)
    }
  }

  if (loading && !catchItem) {
    return (
      <AuthGuard>
        <PageLoader label="Vangst ophalen…" />
      </AuthGuard>
    )
  }

  if (!catchItem) {
    return (
      <AuthGuard>
        <div className="page max-w-2xl">
          <EmptyState
            art={<FishShape className="w-20 text-muted" />}
            title="Deze vis is ontsnapt"
            description="We konden deze vangst niet vinden. Misschien is hij verwijderd."
            action={<Link href="/catches" className="btn btn-primary">Naar mijn vangsten</Link>}
          />
        </div>
      </AuthGuard>
    )
  }

  const species = getSpeciesName(catchItem)
  const hasGps = catchItem.latitude !== null && catchItem.longitude !== null
  const facts = [
    { icon: Weight, label: 'Gewicht', value: formatWeight(catchItem.weight_kg) },
    { icon: Ruler, label: 'Lengte', value: formatLength(catchItem.length_cm) },
    { icon: Worm, label: 'Aas', value: catchItem.bait_type?.name || '—' },
    { icon: FishingRodIcon, label: 'Hengel', value: catchItem.fishing_rod?.name || '—' },
  ]

  return (
    <AuthGuard>
      <div className="page space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/catches" className="btn btn-ghost">
            <ChevronLeft className="size-4" />
            Vangsten
          </Link>
          <div className="flex gap-2">
            <Link href={`/catches/${catchItem.id}/edit`} className="btn btn-ghost">
              <Pencil className="size-4" />
              <span className="hidden sm:inline">Bewerken</span>
            </Link>
            <button onClick={() => setConfirmDelete(true)} className="btn btn-ghost text-danger" aria-label="Vangst verwijderen">
              <Trash2 className="size-4" />
              <span className="hidden sm:inline">Verwijderen</span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-start">
          {/* Foto's */}
          <div className="space-y-3">
            <div className="card relative aspect-[4/3] animate-rise overflow-hidden">
              {imageCount > 0 ? (
                <button onClick={() => setLightbox(true)} className="block size-full cursor-zoom-in" aria-label="Foto vergroten">
                  <img src={catchItem.images[current]} alt={`${species}, foto ${current + 1} van ${imageCount}`} className="size-full object-cover" />
                </button>
              ) : (
                <CatchPlaceholder name={species} className="size-full" />
              )}
              {imageCount > 1 && (
                <>
                  <button onClick={() => step(-1)} aria-label="Vorige foto" className="absolute top-1/2 left-3 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-deep/60 text-white backdrop-blur-sm hover:bg-deep/80">
                    <ChevronLeft className="size-5" />
                  </button>
                  <button onClick={() => step(1)} aria-label="Volgende foto" className="absolute top-1/2 right-3 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-deep/60 text-white backdrop-blur-sm hover:bg-deep/80">
                    <ChevronRight className="size-5" />
                  </button>
                  <span className="tnum absolute right-3 bottom-3 rounded-full bg-deep/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {current + 1} / {imageCount}
                  </span>
                </>
              )}
            </div>
            {imageCount > 1 && (
              <ul className="flex gap-2 overflow-x-auto pb-1">
                {catchItem.images.map((url, index) => (
                  <li key={url}>
                    <button
                      onClick={() => setActiveImage(index)}
                      aria-label={`Toon foto ${index + 1}`}
                      aria-current={index === current}
                      className={`block size-16 overflow-hidden rounded-xl border-2 transition ${index === current ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={url} alt="" className="size-full object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Gegevens */}
          <div className="animate-rise space-y-5" style={{ animationDelay: '80ms' }}>
            <div>
              {isRecord && (
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-bold tracking-wide text-gold uppercase">
                  <Trophy className="size-3.5" />
                  Persoonlijk record
                </span>
              )}
              <h1 className="display text-4xl text-ink sm:text-5xl">{species}</h1>
              {catchItem.fish_species?.scientific_name && (
                <p className="mt-1 text-muted italic">{catchItem.fish_species.scientific_name}</p>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-3">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="card p-4">
                  <dt className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted uppercase">
                    <Icon className="size-3.5" />
                    {label}
                  </dt>
                  <dd className="display tnum mt-1.5 truncate text-xl text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="card divide-y divide-line">
              <div className="flex items-start gap-3 p-4">
                <CalendarDays className="mt-0.5 size-5 shrink-0 text-brand" />
                <div>
                  <p className="font-medium text-ink">{formatDate(catchItem.caught_at)}</p>
                  <p className="text-sm text-muted">{formatRelative(catchItem.caught_at)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4">
                <MapPin className="mt-0.5 size-5 shrink-0 text-brand" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium break-words text-ink">{catchItem.location}</p>
                  {hasGps && (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${catchItem.latitude}&mlon=${catchItem.longitude}#map=15/${catchItem.latitude}/${catchItem.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tnum mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                    >
                      Bekijk op kaart
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {catchItem.notes && (
              <div className="card p-5">
                <h2 className="eyebrow mb-2">Notities</h2>
                <p className="leading-relaxed whitespace-pre-line text-ink">{catchItem.notes}</p>
              </div>
            )}
          </div>
        </div>

        {lightbox && imageCount > 0 && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Foto" onClick={() => setLightbox(false)}>
            <img src={catchItem.images[current]} alt={`${species}, foto ${current + 1}`} className="max-h-full max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
            <button onClick={() => setLightbox(false)} aria-label="Sluiten" className="absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <X className="size-6" />
            </button>
            {imageCount > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); step(-1) }} aria-label="Vorige foto" className="absolute top-1/2 left-4 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
                  <ChevronLeft className="size-6" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); step(1) }} aria-label="Volgende foto" className="absolute top-1/2 right-4 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>
        )}

        <ConfirmDialog
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
          busy={deleting}
          title="Vangst verwijderen?"
          description="Deze vangst wordt definitief verwijderd, inclusief foto's. Dit kan niet ongedaan worden gemaakt."
        />
      </div>
    </AuthGuard>
  )
}
