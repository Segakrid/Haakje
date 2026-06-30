'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { catchSchema, type CatchFormData } from '@/lib/validations'
import { useAuth } from '@/hooks/useAuth'
import { useCatches } from '@/hooks/useCatches'
import { useReferenceData } from '@/hooks/useReferenceData'
import { useFishingRods } from '@/hooks/useFishingRods'
import { getCatch } from '@/lib/api'
import { Fish, Camera, MapPin, Weight, Ruler, Type, Worm, FishingRod as FishingRodIcon, ArrowLeft, Loader2 } from 'lucide-react'
import { AuthGuard } from '@/components/AuthGuard'

export default function EditCatchPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const catchId = params.id

  const { user } = useAuth()
  const { editCatch } = useCatches(user?.id || null)
  const { fishSpecies, baitTypes, loading: refLoading } = useReferenceData()
  const { rods, loading: rodsLoading } = useFishingRods(user?.id || null)

  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [loadingCatch, setLoadingCatch] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CatchFormData>({
    resolver: zodResolver(catchSchema),
    defaultValues: {
      fish_species_id: '',
      bait_type_id: '',
      fishing_rod_id: null,
      weight_kg: null,
      length_cm: null,
      location: '',
      latitude: null,
      longitude: null,
      notes: null,
      images: null,
    },
  })

  // Load the existing catch and prefill the form.
  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const data = await getCatch(catchId)
        if (!active) return
        if (!data) {
          setLoadError('Vangst niet gevonden')
          return
        }
        reset({
          fish_species_id: data.fish_species_id || '',
          bait_type_id: data.bait_type_id || '',
          fishing_rod_id: data.fishing_rod_id,
          weight_kg: data.weight_kg,
          length_cm: data.length_cm,
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          notes: data.notes,
          images: null,
        })
        setExistingImages(data.images || [])
      } catch {
        if (active) setLoadError('Kon de vangst niet laden')
      } finally {
        if (active) setLoadingCatch(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [catchId, reset])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      setNewImages(prev => [...prev, ...files])
      setNewPreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))])
    }
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newPreviews[index])
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setNewPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: CatchFormData) => {
    if (!user?.id) return

    setIsSubmitting(true)
    try {
      const result = await editCatch(catchId, {
        fish_species_id: data.fish_species_id,
        bait_type_id: data.bait_type_id,
        fishing_rod_id: data.fishing_rod_id || null,
        weight_kg: data.weight_kg ?? null,
        length_cm: data.length_cm ?? null,
        location: data.location,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        notes: data.notes ?? null,
        images: [...existingImages, ...newImages],
      })

      if (result) {
        router.push('/catches')
      }
    } catch (err) {
      console.error('Failed to update catch:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clean up object URLs on unmount.
  useEffect(() => {
    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [newPreviews])

  if (refLoading || rodsLoading || loadingCatch) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AuthGuard>
    )
  }

  if (loadError) {
    return (
      <AuthGuard>
        <div className="space-y-4 text-center py-12">
          <p className="text-red-600">{loadError}</p>
          <button
            onClick={() => router.push('/catches')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            Terug naar vangsten
          </button>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/catches')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Vangst Bewerken</h1>
            <p className="text-gray-600">Pas de details van je vangst aan</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Camera className="w-4 h-4 inline mr-2" />
              Afbeeldingen
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {(existingImages.length > 0 || newPreviews.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {existingImages.map((url, index) => (
                    <div key={`existing-${index}`} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Vangst ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {newPreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt={`Nieuw ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer block text-center">
                <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Klik om afbeeldingen toe te voegen</p>
              </label>
            </div>
          </div>

          {/* Species and Bait */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Fish className="w-4 h-4 inline mr-2" />
                Vissoort *
              </label>
              <select
                {...register('fish_species_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecteer vissoort</option>
                {fishSpecies.map((species) => (
                  <option key={species.id} value={species.id}>
                    {species.name}
                  </option>
                ))}
              </select>
              {errors.fish_species_id && (
                <p className="mt-1 text-sm text-red-600">{errors.fish_species_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Worm className="w-4 h-4 inline mr-2" />
                Aassoort *
              </label>
              <select
                {...register('bait_type_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecteer aassoort</option>
                {baitTypes.map((bait) => (
                  <option key={bait.id} value={bait.id}>
                    {bait.name}
                  </option>
                ))}
              </select>
              {errors.bait_type_id && (
                <p className="mt-1 text-sm text-red-600">{errors.bait_type_id.message}</p>
              )}
            </div>
          </div>

          {/* Rod */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FishingRodIcon className="w-4 h-4 inline mr-2" />
              Hengel
            </label>
            <select
              {...register('fishing_rod_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Geen hengel</option>
              {rods.map((rod) => (
                <option key={rod.id} value={rod.id}>
                  {rod.name} ({rod.brand} {rod.model})
                </option>
              ))}
            </select>
          </div>

          {/* Weight and Length */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Weight className="w-4 h-4 inline mr-2" />
                Gewicht (kg)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                {...register('weight_kg', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.weight_kg && (
                <p className="mt-1 text-sm text-red-600">{errors.weight_kg.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Ruler className="w-4 h-4 inline mr-2" />
                Lengte (cm)
              </label>
              <input
                type="number"
                min="1"
                placeholder="0"
                {...register('length_cm', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.length_cm && (
                <p className="mt-1 text-sm text-red-600">{errors.length_cm.message}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Locatie *
            </label>
            <input
              type="text"
              placeholder="Voer locatie in..."
              {...register('location')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Type className="w-4 h-4 inline mr-2" />
              Notities
            </label>
            <textarea
              rows={4}
              placeholder="Voer eventuele notities in..."
              {...register('notes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/catches')}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Opslaan...
                </>
              ) : (
                'Wijzigingen opslaan'
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthGuard>
  )
}
