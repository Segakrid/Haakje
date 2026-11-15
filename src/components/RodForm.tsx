'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { fishingRodSchema, optionalNumber, optionalText, type FishingRodFormData } from '@/lib/validations'
import { FishingRod, FishingRodInput } from '@/types/database'

interface RodFormProps {
  initial?: FishingRod
  submitLabel: string
  onSubmit: (input: FishingRodInput) => Promise<void>
}

export const RodForm = ({ initial, submitLabel, onSubmit }: RodFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FishingRodFormData>({
    resolver: zodResolver(fishingRodSchema),
    defaultValues: {
      name: initial?.name ?? '',
      brand: initial?.brand ?? '',
      model: initial?.model ?? '',
      length: initial?.length ?? null,
      weight: initial?.weight ?? null,
      material: initial?.material ?? null,
      description: initial?.description ?? null,
    },
  })

  const submit = (data: FishingRodFormData) =>
    onSubmit({
      name: data.name,
      brand: data.brand,
      model: data.model,
      length: data.length ?? null,
      weight: data.weight ?? null,
      material: data.material ?? null,
      description: data.description ?? null,
    })

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="card space-y-6 p-5 sm:p-7">
      <div>
        <label htmlFor="rod-name" className="label">Naam *</label>
        <input id="rod-name" type="text" placeholder="Bijv. Mijn snoekhengel" aria-invalid={!!errors.name} className="input" {...register('name')} />
        {errors.name && <p className="field-error">{errors.name.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="rod-brand" className="label">Merk *</label>
          <input id="rod-brand" type="text" placeholder="Bijv. Shimano" aria-invalid={!!errors.brand} className="input" {...register('brand')} />
          {errors.brand && <p className="field-error">{errors.brand.message}</p>}
        </div>
        <div>
          <label htmlFor="rod-model" className="label">Model *</label>
          <input id="rod-model" type="text" placeholder="Bijv. Yasei" aria-invalid={!!errors.model} className="input" {...register('model')} />
          {errors.model && <p className="field-error">{errors.model.message}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="rod-length" className="label">Lengte (m)</label>
          <input id="rod-length" type="number" inputMode="decimal" step="0.01" min="0.1" placeholder="2,70" aria-invalid={!!errors.length} className="input" {...register('length', { setValueAs: optionalNumber })} />
          {errors.length && <p className="field-error">{errors.length.message}</p>}
        </div>
        <div>
          <label htmlFor="rod-weight" className="label">Gewicht (kg)</label>
          <input id="rod-weight" type="number" inputMode="decimal" step="0.01" min="0.01" placeholder="0,25" aria-invalid={!!errors.weight} className="input" {...register('weight', { setValueAs: optionalNumber })} />
          {errors.weight && <p className="field-error">{errors.weight.message}</p>}
        </div>
        <div>
          <label htmlFor="rod-material" className="label">Materiaal</label>
          <input id="rod-material" type="text" placeholder="Carbon" className="input" {...register('material', { setValueAs: optionalText })} />
        </div>
      </div>

      <div>
        <label htmlFor="rod-description" className="label">Beschrijving</label>
        <textarea id="rod-description" rows={3} placeholder="Waar gebruik je deze hengel voor?" className="input resize-none" {...register('description', { setValueAs: optionalText })} />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
        <Link href="/rods" className="btn btn-ghost">Annuleren</Link>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary sm:min-w-40">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? 'Opslaan…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
