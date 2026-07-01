'use client'

import { useState } from 'react'
import { Fish, Plus, Loader2 } from 'lucide-react'
import { FishSpecies } from '@/types/database'

interface FishSpeciesFieldProps {
  fishSpecies: FishSpecies[]
  value: string
  onChange: (id: string) => void
  onAdd: (name: string) => Promise<FishSpecies>
  error?: string
}

export const FishSpeciesField = ({ fishSpecies, value, onChange, onAdd, error }: FishSpeciesFieldProps) => {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const cancelAdd = () => {
    setAdding(false)
    setName('')
    setAddError(null)
  }

  const handleAdd = async () => {
    const trimmed = name.trim()
    if (!trimmed) return

    setSubmitting(true)
    setAddError(null)
    try {
      const species = await onAdd(trimmed)
      onChange(species.id)
      cancelAdd()
    } catch {
      setAddError('Kon vissoort niet toevoegen')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Fish className="w-4 h-4 inline mr-2" />
        Vissoort *
      </label>

      {adding ? (
        <div className="flex gap-2">
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Naam nieuwe vissoort"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={submitting || !name.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Toevoegen'}
          </button>
          <button
            type="button"
            onClick={cancelAdd}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
          >
            Annuleren
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecteer vissoort</option>
            {fishSpecies.map((species) => (
              <option key={species.id} value={species.id}>
                {species.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setAdding(true)}
            title="Nieuwe vissoort toevoegen"
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      )}

      {addError && <p className="mt-1 text-sm text-red-600">{addError}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
