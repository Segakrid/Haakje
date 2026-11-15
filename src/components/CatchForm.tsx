'use client'

/* eslint-disable @next/next/no-img-element -- lokale previews (blob:) en Supabase Storage-URL's */
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Check, Loader2, LocateFixed, Plus, X } from 'lucide-react'
import { catchSchema, optionalNumber, optionalText, type CatchFormData } from '@/lib/validations'
import { BaitType, Catch, FishSpecies, FishingRod } from '@/types/database'
import { CatchUpdateInput } from '@/lib/api'
import { toDateTimeLocal } from '@/lib/utils'

const MAX_IMAGES = 6
const MAX_FILE_MB = 20

type ImageItem = { key: string; preview: string; file?: File; url?: string }

interface CatchFormProps {
  initial?: Catch
  fishSpecies: FishSpecies[]
  baitTypes: BaitType[]
  rods: FishingRod[]
  /** Eerder gebruikte stekken, als suggestie bij het typen. */
  knownLocations?: string[]
  submitLabel: string
  cancelHref: string
  onSubmit: (input: CatchUpdateInput) => Promise<void>
}

export const CatchForm = ({
  initial,
  fishSpecies,
  baitTypes,
  rods,
  knownLocations = [],
  submitLabel,
  cancelHref,
  onSubmit,
}: CatchFormProps) => {
  const [images, setImages] = useState<ImageItem[]>(() =>
    (initial?.images || []).map((url) => ({ key: url, preview: url, url }))
  )
  const [imageError, setImageError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [geoState, setGeoState] = useState<'idle' | 'busy' | 'error'>('idle')
  const [maxCaughtAt] = useState(() => toDateTimeLocal(new Date(Date.now() + 5 * 60 * 1000)))
  const fileInput = useRef<HTMLInputElement>(null)
  const previews = useRef(new Set<string>())

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CatchFormData>({
    resolver: zodResolver(catchSchema),
    defaultValues: {
      fish_species_id: initial?.fish_species_id ?? '',
      bait_type_id: initial?.bait_type_id ?? '',
      fishing_rod_id: initial?.fishing_rod_id ?? '',
      weight_kg: initial?.weight_kg ?? null,
      length_cm: initial?.length_cm ?? null,
      location: initial?.location ?? '',
      latitude: initial?.latitude ?? null,
      longitude: initial?.longitude ?? null,
      notes: initial?.notes ?? null,
      caught_at: toDateTimeLocal(initial ? new Date(initial.caught_at) : new Date()),
    },
  })

  const [latitude, longitude] = useWatch({ control, name: ['latitude', 'longitude'] })
  const hasGps = latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined

  // Blob-previews vrijgeven wanneer het formulier verdwijnt.
  useEffect(() => {
    const urls = previews.current
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const addFiles = (files: FileList | File[]) => {
    setImageError(null)
    const incoming = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (incoming.length === 0) {
      setImageError('Alleen afbeeldingen kunnen worden toegevoegd.')
      return
    }
    const tooBig = incoming.find((file) => file.size > MAX_FILE_MB * 1024 * 1024)
    if (tooBig) {
      setImageError(`"${tooBig.name}" is groter dan ${MAX_FILE_MB} MB.`)
      return
    }
    const room = Math.max(MAX_IMAGES - images.length, 0)
    if (incoming.length > room) setImageError(`Maximaal ${MAX_IMAGES} foto's per vangst.`)
    const added = incoming.slice(0, room).map((file) => {
      const preview = URL.createObjectURL(file)
      previews.current.add(preview)
      return { key: preview, preview, file }
    })
    setImages((prev) => [...prev, ...added])
  }

  const removeImage = (item: ImageItem) => {
    setImageError(null)
    setImages((prev) => prev.filter((i) => i.key !== item.key))
    if (item.file) {
      URL.revokeObjectURL(item.preview)
      previews.current.delete(item.preview)
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoState('error')
      return
    }
    setGeoState('busy')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6))
        const lng = Number(position.coords.longitude.toFixed(6))
        setValue('latitude', lat, { shouldDirty: true })
        setValue('longitude', lng, { shouldDirty: true })
        // De naam van de stek blijft van de visser; alleen invullen als hij nog leeg is.
        if (!getValues('location').trim()) {
          setValue('location', `Stek op ${lat.toFixed(4)}, ${lng.toFixed(4)}`, { shouldValidate: true })
        }
        setGeoState('idle')
      },
      () => setGeoState('error'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const clearGps = () => {
    setValue('latitude', null, { shouldDirty: true })
    setValue('longitude', null, { shouldDirty: true })
  }

  const submit = (data: CatchFormData) =>
    onSubmit({
      fish_species_id: data.fish_species_id,
      bait_type_id: data.bait_type_id,
      fishing_rod_id: data.fishing_rod_id || null,
      weight_kg: data.weight_kg ?? null,
      length_cm: data.length_cm ?? null,
      location: data.location.trim(),
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      notes: data.notes ?? null,
      caught_at: new Date(data.caught_at).toISOString(),
      images: images.map((item) => item.file ?? item.url!),
    })

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      {/* Foto's */}
      <section className="card p-5 sm:p-7">
        <SectionTitle step={1} title="Foto's" hint={`Optioneel · max. ${MAX_IMAGES}`} />
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
          }}
          className={`rounded-2xl border-2 border-dashed transition ${
            dragging ? 'border-brand bg-brand-soft' : 'border-line'
          } ${images.length === 0 ? '' : 'p-3'}`}
        >
          {images.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-2xl px-6 py-10 text-center transition hover:bg-surface-2"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <Camera className="size-6" />
              </span>
              <span className="font-semibold text-ink">Voeg foto&apos;s toe</span>
              <span className="text-sm text-muted">Tik om te kiezen of sleep ze hierheen</span>
            </button>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((item, index) => (
                <li key={item.key} className="group relative aspect-square overflow-hidden rounded-xl bg-surface-2">
                  <img src={item.preview} alt={`Foto ${index + 1}`} className="size-full object-cover" />
                  {index === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-deep/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                      Omslag
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(item)}
                    aria-label={`Foto ${index + 1} verwijderen`}
                    className="absolute top-1.5 right-1.5 inline-flex size-7 items-center justify-center rounded-full bg-deep/75 text-white backdrop-blur-sm transition hover:bg-danger"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
              {images.length < MAX_IMAGES && (
                <li>
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    aria-label="Nog een foto toevoegen"
                    className="flex aspect-square w-full items-center justify-center rounded-xl bg-surface-2 text-muted transition hover:bg-brand-soft hover:text-brand"
                  >
                    <Plus className="size-6" />
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
        {imageError && <p className="field-error">{imageError}</p>}
      </section>

      {/* De vis */}
      <section className="card p-5 sm:p-7">
        <SectionTitle step={2} title="De vis" />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="species" className="label">Vissoort *</label>
            <select id="species" aria-invalid={!!errors.fish_species_id} className="input" {...register('fish_species_id')}>
              <option value="">Kies een vissoort…</option>
              {fishSpecies.map((species) => (
                <option key={species.id} value={species.id}>{species.name}</option>
              ))}
            </select>
            {errors.fish_species_id && <p className="field-error">{errors.fish_species_id.message}</p>}
          </div>
          <div>
            <label htmlFor="weight" className="label">Gewicht (kg)</label>
            <input id="weight" type="number" inputMode="decimal" step="0.01" min="0.01" placeholder="1,25" aria-invalid={!!errors.weight_kg} className="input tnum" {...register('weight_kg', { setValueAs: optionalNumber })} />
            {errors.weight_kg && <p className="field-error">{errors.weight_kg.message}</p>}
          </div>
          <div>
            <label htmlFor="length" className="label">Lengte (cm)</label>
            <input id="length" type="number" inputMode="decimal" step="0.5" min="1" placeholder="45" aria-invalid={!!errors.length_cm} className="input tnum" {...register('length_cm', { setValueAs: optionalNumber })} />
            {errors.length_cm && <p className="field-error">{errors.length_cm.message}</p>}
          </div>
        </div>
      </section>

      {/* Waar, wanneer en waarmee */}
      <section className="card p-5 sm:p-7">
        <SectionTitle step={3} title="Waar, wanneer en waarmee" />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="location" className="label">Stek / locatie *</label>
            <div className="flex gap-2">
              <input id="location" type="text" list="known-locations" autoComplete="off" placeholder="Bijv. Kagerplassen, steiger noord" aria-invalid={!!errors.location} className="input" {...register('location')} />
              <datalist id="known-locations">
                {knownLocations.map((location) => (
                  <option key={location} value={location} />
                ))}
              </datalist>
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={geoState === 'busy'}
                className="btn btn-ghost shrink-0"
                aria-label="Gebruik mijn huidige locatie"
              >
                {geoState === 'busy' ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
                <span className="hidden sm:inline">Mijn locatie</span>
              </button>
            </div>
            {errors.location && <p className="field-error">{errors.location.message}</p>}
            {hasGps && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-reed-soft py-1 pr-1 pl-3 text-xs font-medium text-reed">
                <Check className="size-3.5" />
                <span className="tnum">GPS vastgelegd: {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}</span>
                <button type="button" onClick={clearGps} aria-label="GPS-positie wissen" className="inline-flex size-5 items-center justify-center rounded-full hover:bg-reed/20">
                  <X className="size-3" />
                </button>
              </p>
            )}
            {geoState === 'error' && (
              <p className="field-error">Je locatie kon niet worden bepaald. Geef toestemming of vul de stek zelf in.</p>
            )}
          </div>

          <div>
            <label htmlFor="caught-at" className="label">Datum en tijd *</label>
            <input id="caught-at" type="datetime-local" max={maxCaughtAt} aria-invalid={!!errors.caught_at} className="input tnum" {...register('caught_at')} />
            {errors.caught_at && <p className="field-error">{errors.caught_at.message}</p>}
          </div>
          <div>
            <label htmlFor="bait" className="label">Aas *</label>
            <select id="bait" aria-invalid={!!errors.bait_type_id} className="input" {...register('bait_type_id')}>
              <option value="">Kies een aassoort…</option>
              {baitTypes.map((bait) => (
                <option key={bait.id} value={bait.id}>{bait.name}</option>
              ))}
            </select>
            {errors.bait_type_id && <p className="field-error">{errors.bait_type_id.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="rod" className="label">Hengel</label>
            <select id="rod" className="input" {...register('fishing_rod_id')}>
              <option value="">Geen hengel gekozen</option>
              {rods.map((rod) => (
                <option key={rod.id} value={rod.id}>{rod.name} — {rod.brand} {rod.model}</option>
              ))}
            </select>
            {rods.length === 0 && (
              <p className="mt-1.5 text-sm text-muted">
                Nog geen hengels. <Link href="/rods/new" className="font-semibold text-brand underline underline-offset-2">Voeg er een toe</Link> om te zien welke het best vangt.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Notities */}
      <section className="card p-5 sm:p-7">
        <SectionTitle step={4} title="Notities" hint="Optioneel" />
        <textarea rows={4} aria-label="Notities" placeholder="Weer, waterstand, techniek, het verhaal erachter…" className="input resize-none" {...register('notes', { setValueAs: optionalText })} />
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className="btn btn-ghost">Annuleren</Link>
        <button type="submit" disabled={isSubmitting} className="btn btn-accent sm:min-w-48">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? (images.some((i) => i.file) ? 'Foto’s uploaden…' : 'Opslaan…') : submitLabel}
        </button>
      </div>
    </form>
  )
}

const SectionTitle = ({ step, title, hint }: { step: number; title: string; hint?: string }) => (
  <div className="mb-5 flex items-center gap-3">
    <span className="tnum inline-flex size-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-on-brand">{step}</span>
    <h2 className="display text-xl text-ink">{title}</h2>
    {hint && <span className="ml-auto text-xs text-muted">{hint}</span>}
  </div>
)
