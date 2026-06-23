'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Fish, Weight, Ruler, MapPin, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCatches } from '@/hooks/useCatches'
import { useReferenceData } from '@/hooks/useReferenceData'
import { formatWeight, formatLength, getSpeciesName, getBaitName } from '@/lib/utils'
import { AuthGuard } from '@/components/AuthGuard'

export default function StatsPage() {
  const { user } = useAuth()
  const { catches, loading } = useCatches(user?.id || null)
  const { fishSpecies, baitTypes } = useReferenceData()
  
  const [timeRange, setTimeRange] = useState<'all' | 'year' | 'month' | 'week'>('all')

  // Calculate statistics
  const stats = {
    totalCatches: catches.length,
    totalWeight: catches.reduce((sum, c) => sum + (c.weight_kg || 0), 0),
    avgWeight: catches.length > 0 
      ? catches.reduce((sum, c) => sum + (c.weight_kg || 0), 0) / catches.length 
      : 0,
    totalLength: catches.reduce((sum, c) => sum + (c.length_cm || 0), 0),
    avgLength: catches.length > 0 
      ? catches.reduce((sum, c) => sum + (c.length_cm || 0), 0) / catches.length 
      : 0,
  }

  // Species distribution
  const speciesStats = fishSpecies.map(species => {
    const speciesCatches = catches.filter(c => c.fish_species_id === species.id)
    return {
      species: species.name,
      count: speciesCatches.length,
      totalWeight: speciesCatches.reduce((sum, c) => sum + (c.weight_kg || 0), 0),
    }
  }).filter(s => s.count > 0).sort((a, b) => b.count - a.count)

  // Bait effectiveness
  const baitStats = baitTypes.map(bait => {
    const baitCatches = catches.filter(c => c.bait_type_id === bait.id)
    return {
      bait: bait.name,
      count: baitCatches.length,
      successRate: baitCatches.length / catches.length * 100,
    }
  }).filter(b => b.count > 0).sort((a, b) => b.count - a.count)

  // Location distribution
  const locationStats = Array.from(new Set(catches.map(c => c.location)))
    .map(location => {
      const locationCatches = catches.filter(c => c.location === location)
      return {
        location,
        count: locationCatches.length,
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Monthly catches
  const monthlyCatches = Array.from({ length: 12 }, (_, i) => {
    const month = new Date()
    month.setMonth(month.getMonth() - i)
    const monthName = month.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })
    const monthCatches = catches.filter(c => {
      const catchDate = new Date(c.caught_at)
      return catchDate.getMonth() === month.getMonth() && 
             catchDate.getFullYear() === month.getFullYear()
    })
    return {
      month: monthName,
      count: monthCatches.length,
    }
  }).reverse()

  // Filter catches by time range
  const filteredCatches = catches.filter(catchItem => {
    const catchDate = new Date(catchItem.caught_at)
    const now = new Date()
    
    switch (timeRange) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return catchDate >= weekAgo
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return catchDate >= monthAgo
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        return catchDate >= yearAgo
      default:
        return true
    }
  })

  // Recalculate stats for filtered catches
  const filteredStats = {
    totalCatches: filteredCatches.length,
    totalWeight: filteredCatches.reduce((sum, c) => sum + (c.weight_kg || 0), 0),
    avgWeight: filteredCatches.length > 0 
      ? filteredCatches.reduce((sum, c) => sum + (c.weight_kg || 0), 0) / filteredCatches.length 
      : 0,
    avgLength: filteredCatches.length > 0 
      ? filteredCatches.reduce((sum, c) => sum + (c.length_cm || 0), 0) / filteredCatches.length 
      : 0,
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Statistieken</h1>
          <p className="text-gray-600 mt-1">Bekijk je vangstprestaties</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Alles
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === 'year' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Laatste jaar
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Laatste maand
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Laatste week
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Fish className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-500">Totaal</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{filteredStats.totalCatches}</div>
            <div className="text-sm text-gray-600">Vangsten</div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Weight className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-500">Totaal</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{formatWeight(filteredStats.totalWeight)}</div>
            <div className="text-sm text-gray-600">Gewicht</div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Weight className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-500">Gemiddeld</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{formatWeight(filteredStats.avgWeight)}</div>
            <div className="text-sm text-gray-600">Per vangst</div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-500">Gemiddeld</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{formatLength(filteredStats.avgLength)}</div>
            <div className="text-sm text-gray-600">Lengte</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Species Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Vissoorten
            </h2>
            {speciesStats.length > 0 ? (
              <div className="space-y-3">
                {speciesStats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{stat.species}</div>
                      <div className="text-sm text-gray-500">{stat.count} vangst(en)</div>
                    </div>
                    <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${(stat.count / filteredStats.totalCatches) * 100}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                      {((stat.count / filteredStats.totalCatches) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Geen vangsten om te analyseren</p>
            )}
          </div>

          {/* Bait Effectiveness */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Aassoorten
            </h2>
            {baitStats.length > 0 ? (
              <div className="space-y-3">
                {baitStats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{stat.bait}</div>
                      <div className="text-sm text-gray-500">{stat.count} vangst(en)</div>
                    </div>
                    <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-600 rounded-full"
                        style={{ width: `${stat.successRate}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                      {stat.successRate.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Geen vangsten om te analyseren</p>
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Maandelijkse vangsten
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {monthlyCatches.map((month, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{month.month}</div>
                <div className="text-2xl font-bold text-gray-800">{month.count}</div>
                <div className="h-8 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ height: `${Math.min(month.count * 20, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Top Locaties
          </h2>
          {locationStats.length > 0 ? (
            <div className="space-y-3">
              {locationStats.map((location, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{location.location}</div>
                    <div className="text-sm text-gray-500">{location.count} vangst(en)</div>
                  </div>
                  <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: `${(location.count / filteredStats.totalCatches) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Geen locaties om te analyseren</p>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
