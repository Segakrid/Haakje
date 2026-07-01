'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FishingRod as FishingRodIcon, MoreVertical, Trash2, Edit } from 'lucide-react'
import { FishingRod } from '@/types/database'
import { truncate } from '@/lib/utils'

interface RodCardProps {
  rod: FishingRod
  onDelete: () => void
}

export const RodCard = ({ rod, onDelete }: RodCardProps) => {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{rod.name}</h3>
            <p className="text-sm text-gray-500">{rod.soort}</p>
            {(rod.brand || rod.model) && (
              <p className="text-sm text-gray-500">{[rod.brand, rod.model].filter(Boolean).join(' ')}</p>
            )}
          </div>
          
          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-md shadow-lg z-20 py-1">
                  <Link
                    href={`/rods/${rod.id}/edit`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => setShowMenu(false)}
                  >
                    <Edit className="w-4 h-4" />
                    Bewerken
                  </Link>
                  <button
                    onClick={onDelete}
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Verwijderen
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="space-y-3">
          {rod.length && (
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Lengte</span>
              <span className="font-medium">{rod.length} m</span>
            </div>
          )}
          
          {rod.weight && (
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Gewicht</span>
              <span className="font-medium">{rod.weight} kg</span>
            </div>
          )}
          
          {rod.material && (
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Materiaal</span>
              <span className="font-medium">{rod.material}</span>
            </div>
          )}
          
          {rod.description && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600">{truncate(rod.description, 100)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
