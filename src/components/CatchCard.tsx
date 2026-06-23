'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Fish, MapPin, Calendar, Weight, Ruler, MoreVertical, Trash2, Edit, Image as ImageIcon } from 'lucide-react'
import { Catch } from '@/types/database'
import { formatDate, formatWeight, formatLength, getSpeciesName, getBaitName, getRodName, truncate } from '@/lib/utils'
import { deleteCatch } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface CatchCardProps {
  catchItem: Catch
  onDelete: () => void
}

export const CatchCard = ({ catchItem, onDelete }: CatchCardProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { user } = useAuth()

  const handleDelete = async () => {
    if (!user?.id) return
    
    setDeleting(true)
    try {
      await deleteCatch(catchItem.id)
      onDelete()
    } catch (err) {
      console.error('Failed to delete catch:', err)
    } finally {
      setDeleting(false)
      setShowMenu(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      {catchItem.images && catchItem.images.length > 0 ? (
        <div className="relative h-48 bg-gray-100">
          <img
            src={catchItem.images[0]}
            alt="Vangst"
            className="w-full h-full object-cover"
          />
          {catchItem.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              +{catchItem.images.length - 1} meer
            </div>
          )}
        </div>
      ) : (
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          <Fish className="w-16 h-16 text-gray-400" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {getSpeciesName(catchItem)}
            </h3>
            <p className="text-sm text-gray-500">{formatDate(catchItem.caught_at)}</p>
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
                    href={`/catches/${catchItem.id}/edit`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => setShowMenu(false)}
                  >
                    <Edit className="w-4 h-4" />
                    Bewerken
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleting ? 'Verwijderen...' : 'Verwijderen'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>{truncate(catchItem.location, 30)}</span>
          </div>
          
          {catchItem.weight_kg && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Weight className="w-4 h-4 text-blue-500" />
              <span>{formatWeight(catchItem.weight_kg)}</span>
            </div>
          )}
          
          {catchItem.length_cm && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Ruler className="w-4 h-4 text-blue-500" />
              <span>{formatLength(catchItem.length_cm)}</span>
            </div>
          )}
          
          {catchItem.fishing_rod && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span>{truncate(getRodName(catchItem), 25)}</span>
            </div>
          )}
          
          {catchItem.bait_type && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 bg-yellow-300 rounded"></div>
              <span>{truncate(getBaitName(catchItem), 25)}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {catchItem.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 italic">{truncate(catchItem.notes, 100)}</p>
          </div>
        )}
      </div>
    </div>
  )
}
