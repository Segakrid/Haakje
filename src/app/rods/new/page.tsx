'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fishingRodSchema, type FishingRodFormData } from '@/lib/validations'
import { useAuth } from '@/hooks/useAuth'
import { useFishingRods } from '@/hooks/useFishingRods'
import { FishingRod as FishingRodIcon, ArrowLeft, Loader2, Tag, Ruler, Weight, Type } from 'lucide-react'
import { AuthGuard } from '@/components/AuthGuard'

export default function NewRodPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { addRod } = useFishingRods(user?.id || null)
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FishingRodFormData>({
    resolver: zodResolver(fishingRodSchema),
    defaultValues: {
      name: '',
      brand: '',
      model: '',
      length: null,
      weight: null,
      material: null,
      description: null,
    },
  })

  const onSubmit = async (data: FishingRodFormData) => {
    if (!user?.id) return
    
    try {
      const result = await addRod({
        name: data.name,
        brand: data.brand,
        model: data.model,
        length: data.length ?? null,
        weight: data.weight ?? null,
        material: data.material ?? null,
        description: data.description ?? null,
      })
      if (result) {
        router.push('/rods')
      }
    } catch (err) {
      console.error('Failed to create rod:', err)
    }
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/rods')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Nieuwe Hengel</h1>
            <p className="text-gray-600">Voer de details van je hengel in</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Name, Brand, Model */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naam *
              </label>
              <input
                type="text"
                placeholder="Bijv. Mijn favoriete hengel"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Merk *
              </label>
              <input
                type="text"
                placeholder="Bijv. Shimano"
                {...register('brand')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.brand && (
                <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model *
              </label>
              <input
                type="text"
                placeholder="Bijv. Stella"
                {...register('model')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.model && (
                <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
              )}
            </div>
          </div>

          {/* Length and Weight */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Ruler className="w-4 h-4 inline mr-2" />
                Lengte (m)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                placeholder="Bijv. 2.7"
                {...register('length', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.length && (
                <p className="mt-1 text-sm text-red-600">{errors.length?.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Weight className="w-4 h-4 inline mr-2" />
                Gewicht (kg)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Bijv. 0.25"
                {...register('weight', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.weight && (
                <p className="mt-1 text-sm text-red-600">{errors.weight?.message}</p>
              )}
            </div>
          </div>

          {/* Material */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Materiaal
            </label>
            <input
              type="text"
              placeholder="Bijv. Carbon, Glasvezel"
              {...register('material')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Type className="w-4 h-4 inline mr-2" />
              Beschrijving
            </label>
            <textarea
              rows={4}
              placeholder="Voer eventuele opmerkingen in over deze hengel..."
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/rods')}
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
