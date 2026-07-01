'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { catchSchema, type CatchFormData } from '@/lib/validations'
import { useAuth } from '@/hooks/useAuth'
import { useCatches } from '@/hooks/useCatches'
import { useReferenceData } from '@/hooks/useReferenceData'
import { useFishingRods } from '@/hooks/useFishingRods'
import { Camera, MapPin, Weight, Ruler, Type, Worm, FishingRod as FishingRodIcon, ArrowLeft, Loader2 } from 'lucide-react'
import { AuthGuard } from '@/components/AuthGuard'
import { FishSpeciesField } from '@/components/FishSpeciesField'
import { getRodLabel } from '@/lib/utils'

export default function NewCatchPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { addCatch } = useCatches(user?.id || null)
  const { fishSpecies, baitTypes, loading: refLoading, addFishSpecies } = useReferenceData()
  const { rods, loading: rodsLoading } = useFishingRods(user?.id || null)
  
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CatchFormData>({
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

  // Get current location
  useEffect(() => {
    if (usingCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude)
          setValue('longitude', position.coords.longitude)
          // Reverse geocode to get location name (simplified)
          setValue('location', `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`)
        },
        (error) => {
          console.error('Error getting location:', error)
          setUsingCurrentLocation(false)
        }
      )
    }
  }, [usingCurrentLocation, setValue])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files)
      setImages(prev => [...prev, ...newImages])
      
      // Create previews
      const newPreviews = newImages.map(file => URL.createObjectURL(file))
      setImagePreviews(prev => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    const newPreviews = [...imagePreviews]
    
    newImages.splice(index, 1)
    newPreviews.splice(index, 1)
    
    setImages(newImages)
    setImagePreviews(newPreviews)
    
    // Revoke object URL to free memory
    URL.revokeObjectURL(imagePreviews[index])
  }

  const onSubmit = async (data: CatchFormData) => {
    if (!user?.id) return
    
    setIsSubmitting(true)
    try {
      const result = await addCatch({
        fish_species_id: data.fish_species_id,
        bait_type_id: data.bait_type_id,
        fishing_rod_id: data.fishing_rod_id || null,
        weight_kg: data.weight_kg ?? null,
        length_cm: data.length_cm ?? null,
        location: data.location,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        notes: data.notes ?? null,
        images: images.length > 0 ? images : null,
      })
      
      if (result) {
        router.push('/catches')
      }
    } catch (err) {
      console.error('Failed to create catch:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clean up image previews on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [imagePreviews])

  if (refLoading || rodsLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
            <h1 className="text-3xl font-bold text-gray-800">Nieuwe Vangst</h1>
            <p className="text-gray-600">Voer de details van je vangst in</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Camera className="w-4 h-4 inline mr-2" />
              Afbeeldingen
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                {imagePreviews.length === 0 ? (
                  <>
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      Klik om afbeeldingen toe te voegen of sleep ze hierheen
                    </p>
                  </>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Vangst ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImage(index)
                          }}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </label>
              {imagePreviews.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {imagePreviews.length} afbeelding(en) geselecteerd
                </p>
              )}
            </div>
          </div>

          {/* Species and Bait */}
          <div className="grid md:grid-cols-2 gap-6">
            <FishSpeciesField
              fishSpecies={fishSpecies}
              value={watch('fish_species_id')}
              onChange={(id) => setValue('fish_species_id', id, { shouldValidate: true })}
              onAdd={addFishSpecies}
              error={errors.fish_species_id?.message}
            />

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
                  {getRodLabel(rod)}
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
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Voer locatie in..."
                {...register('location')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setUsingCurrentLocation(!usingCurrentLocation)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  usingCurrentLocation
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {usingCurrentLocation ? 'Locatie gevonden' : 'Gebruik huidige locatie'}
              </button>
            </div>
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
            
            {/* Hidden latitude and longitude fields */}
            <input type="hidden" {...register('latitude', { valueAsNumber: true })} />
            <input type="hidden" {...register('longitude', { valueAsNumber: true })} />
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
                'Opslaan'
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthGuard>
  )
}
