'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, FishingRod as FishingRodIcon, MoreVertical, Trash2, Edit, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useFishingRods } from '@/hooks/useFishingRods'
import { AuthGuard } from '@/components/AuthGuard'
import { RodCard } from '@/components/RodCard'

export default function RodsPage() {
  const { user } = useAuth()
  const { rods, loading, error, fetchRods, removeRod } = useFishingRods(user?.id || null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter rods based on search query
  const filteredRods = rods.filter(rod => {
    const query = searchQuery.toLowerCase()
    return (
      rod.name.toLowerCase().includes(query) ||
      rod.brand.toLowerCase().includes(query) ||
      rod.model.toLowerCase().includes(query) ||
      (rod.description || '').toLowerCase().includes(query)
    )
  })

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Weet je zeker dat je deze hengel wilt verwijderen?')
    if (confirmed) {
      await removeRod(id)
    }
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mijn Hengels</h1>
            <p className="text-gray-600 mt-1">
              {filteredRods.length} hengel(s) gevonden
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Zoeken..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <Link
              href="/rods/new"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Nieuwe hengel</span>
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && rods.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Hengels laden...</p>
          </div>
        ) : null}

        {/* Empty State */}
        {!loading && filteredRods.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FishingRodIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Geen hengels gevonden</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'Geen hengels voldoen aan je zoekopdracht'
                : 'Je hebt nog geen hengels geregistreerd'}
            </p>
            <Link
              href="/rods/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Voeg je eerste hengel toe
            </Link>
          </div>
        ) : null}

        {/* Rods Grid */}
        {!loading && filteredRods.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRods.map((rod) => (
              <RodCard
                key={rod.id}
                rod={rod}
                onDelete={() => handleDelete(rod.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
