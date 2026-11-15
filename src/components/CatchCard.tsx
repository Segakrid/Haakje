'use client'

/* eslint-disable @next/next/no-img-element -- foto's komen uit Supabase Storage; next/image vereist daar extra hostconfiguratie voor */
import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { Images, MapPin, MoreVertical, Pencil, Ruler, Trash2, Trophy, Weight } from 'lucide-react'
import { Catch } from '@/types/database'
import { formatDateShort, formatLength, formatWeight, getSpeciesName } from '@/lib/utils'
import { CatchPlaceholder } from '@/components/FishArt'
import { useDismiss } from '@/hooks/useDismiss'

interface CatchCardProps {
  catchItem: Catch
  isRecord?: boolean
  onDelete?: (catchItem: Catch) => void
  /** Vertraging voor de binnenkomst-animatie (ms). */
  delay?: number
}

export const CatchCard = ({ catchItem, isRecord = false, onDelete, delay = 0 }: CatchCardProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useDismiss(menuRef, showMenu, useCallback(() => setShowMenu(false), []))
  const species = getSpeciesName(catchItem)
  const cover = catchItem.images[0]

  return (
    <article
      className={`group card relative animate-rise transition duration-300 hover:-translate-y-1 hover:shadow-lift ${showMenu ? 'z-20' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[15px] bg-surface-2">
        {cover ? (
          <img
            src={cover}
            alt={`${species}, gevangen bij ${catchItem.location}`}
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <CatchPlaceholder name={species} className="size-full transition duration-500 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-deep/85 via-deep/10 to-transparent" />

        <div className="absolute top-3 left-3 flex gap-2">
          {isRecord && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f6c544] px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#3d2a00] uppercase shadow">
              <Trophy className="size-3" />
              Record
            </span>
          )}
          {catchItem.images.length > 1 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-deep/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <Images className="size-3" />
              {catchItem.images.length}
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-xs font-medium text-white/75">{formatDateShort(catchItem.caught_at)}</p>
          <h3 className="display text-2xl leading-tight text-white">
            {/* De link bestrijkt de hele kaart; het menu ligt er met z-index boven. */}
            <Link href={`/catches/${catchItem.id}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {species}
            </Link>
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0 space-y-2">
          <p className="flex items-center gap-1.5 truncate text-sm text-muted">
            <MapPin className="size-4 shrink-0 text-brand" />
            <span className="truncate">{catchItem.location}</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {catchItem.weight_kg !== null && (
              <span className="chip tnum text-ink">
                <Weight className="size-3.5 text-muted" />
                {formatWeight(catchItem.weight_kg)}
              </span>
            )}
            {catchItem.length_cm !== null && (
              <span className="chip tnum text-ink">
                <Ruler className="size-3.5 text-muted" />
                {formatLength(catchItem.length_cm)}
              </span>
            )}
            {catchItem.bait_type && <span className="chip">{catchItem.bait_type.name}</span>}
          </div>
        </div>

        {onDelete && (
          <div ref={menuRef} className="relative z-10 self-start">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="icon-btn -mr-1.5"
              aria-label={`Acties voor ${species}`}
              aria-haspopup="menu"
              aria-expanded={showMenu}
            >
              <MoreVertical className="size-5" />
            </button>
            {showMenu && (
              <>
                <div role="menu" className="card absolute right-0 bottom-full z-20 mb-1 w-44 animate-pop p-1.5 shadow-lift">
                  <Link
                    role="menuitem"
                    href={`/catches/${catchItem.id}/edit`}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-2"
                  >
                    <Pencil className="size-4 text-muted" />
                    Bewerken
                  </Link>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowMenu(false)
                      onDelete(catchItem)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-danger-soft"
                  >
                    <Trash2 className="size-4" />
                    Verwijderen
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
