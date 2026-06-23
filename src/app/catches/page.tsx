'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, SortAsc, SortDesc, Calendar, MapPin, Fish, Weight, Ruler } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCatches } from '@/hooks/useCatches'
import { useReferenceData } from '@/hooks/useReferenceData'
import { useFishingRods } from '@/hooks/useFishingRods'
import { formatDate, formatWeight, formatLength, getSpeciesName, getBaitName, getRodName } from '@/lib/utils'
import { AuthGuard } from '@/components/AuthGuard'
import { CatchCard } from '@/components/CatchCard'
import { CatchFilterModal } from '@/components/CatchFilterModal'

export default function CatchesPage() {
  const { user } = useAuth()
  const { 
    catches, 
    loading, 
    error, 
    fetchCatches,
    sortBy, 
    setSortBy, 
    sortOrder, 
    setSortOrder,
    speciesFilter,
    setSpeciesFilter,
    locationFilter,
    setLocationFilter,
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
  } = useCatches(user?.id || null)
  
  const { fishSpecies, baitTypes } = useReferenceData()
  const { rods } = useFishingRods(user?.id || null)
  
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter catches based on search query
  const filteredCatches = catches.filter(catchItem => {
    const query = searchQuery.toLowerCase()
    return (
      getSpeciesName(catchItem).toLowerCase().includes(query) ||
      catchItem.location.toLowerCase().includes(query) ||
      getBaitName(catchItem).toLowerCase().includes(query) ||
      getRodName(catchItem).toLowerCase().includes(query) ||
      (catchItem.notes || '').toLowerCase().includes(query)
    )
  })

  const sortOptions = [
    { value: 'date', label: 'Datum', icon: Calendar },
    { value: 'location', label: 'Locatie', icon: MapPin },
    { value: 'species', label: 'Vissoort', icon: Fish },
    { value: 'size', label: 'Grootte', icon: Ruler },
    { value: 'weight', label: 'Gewicht', icon: Weight },
  ]

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const clearFilters = () => {
    setSpeciesFilter('')
    setLocationFilter('')
    setStartDateFilter(null)
    setEndDateFilter(null)
    setSearchQuery('')
  }

  // Refresh data when filters change
  useEffect(() => {
    if (user?.id) {
      fetchCatches()
    }
  }, [user?.id, fetchCatches])

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mijn Vangsten</h1>
            <p className="text-gray-600 mt-1">
              {filteredCatches.length} vangst(en) gevonden
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
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-2 transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
              
              <Link
                href="/catches/new"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Nieuwe vangst</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700">Sorteren op:</span>
          <div className="flex gap-1">
            {sortOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSortBy(value as any)}
                className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
                  sortBy === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={toggleSortOrder}
            className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
              sortOrder === 'asc' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            {sortOrder === 'asc' ? 'Oplopend' : 'Aflopend'}
          </button>
        </div>

        {/* Filter Modal */}
        {showFilters && (
          <CatchFilterModal
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            fishSpecies={fishSpecies}
            rods={rods}
            speciesFilter={speciesFilter}
            setSpeciesFilter={setSpeciesFilter}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            startDateFilter={startDateFilter}
            setStartDateFilter={setStartDateFilter}
            endDateFilter={endDateFilter}
            setEndDateFilter={setEndDateFilter}
            onClearFilters={clearFilters}
          />
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && catches.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Vangsten laden...</p>
          </div>
        ) : null}

        {/* Empty State */}
        {!loading && filteredCatches.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Fish className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Geen vangsten gevonden</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || speciesFilter || locationFilter || startDateFilter || endDateFilter
                ? 'Geen vangsten voldoen aan je filters'
                : 'Je hebt nog geen vangsten geregistreerd'}
            </p>
            <Link
              href="/catches/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Voeg je eerste vangst toe
            </Link>
          </div>
        ) : null}

        {/* Catches Grid */}
        {!loading && filteredCatches.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCatches.map((catchItem) => (
              <CatchCard
                key={catchItem.id}
                catchItem={catchItem}
                onDelete={() => fetchCatches()}
              />
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
