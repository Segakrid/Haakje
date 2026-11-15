'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { FishingRod as FishingRodIcon, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { FishingRod } from '@/types/database'
import { pluralize } from '@/lib/utils'
import { useDismiss } from '@/hooks/useDismiss'

interface RodCardProps {
  rod: FishingRod
  catchCount: number
  onDelete: (rod: FishingRod) => void
  delay?: number
}

export const RodCard = ({ rod, catchCount, onDelete, delay = 0 }: RodCardProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useDismiss(menuRef, showMenu, useCallback(() => setShowMenu(false), []))
  const specs = [
    rod.length ? { label: 'Lengte', value: `${String(rod.length).replace('.', ',')} m` } : null,
    rod.weight ? { label: 'Gewicht', value: `${String(rod.weight).replace('.', ',')} kg` } : null,
    rod.material ? { label: 'Materiaal', value: rod.material } : null,
  ].filter((s): s is { label: string; value: string } => !!s)

  return (
    <article className={`card relative animate-rise p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lift ${showMenu ? 'z-20' : ''}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start gap-4">
        <span className="water inline-flex size-12 shrink-0 items-center justify-center rounded-2xl">
          <FishingRodIcon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="display truncate text-xl text-ink">{rod.name}</h3>
          <p className="truncate text-sm text-muted">
            {rod.brand} {rod.model}
          </p>
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="icon-btn -mt-1 -mr-2"
            aria-label={`Acties voor ${rod.name}`}
            aria-haspopup="menu"
            aria-expanded={showMenu}
          >
            <MoreVertical className="size-5" />
          </button>
          {showMenu && (
            <>
              <div role="menu" className="card absolute top-full right-0 z-20 mt-1 w-44 animate-pop p-1.5 shadow-lift">
                <Link
                  role="menuitem"
                  href={`/rods/${rod.id}/edit`}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-2"
                >
                  <Pencil className="size-4 text-muted" />
                  Bewerken
                </Link>
                <button
                  role="menuitem"
                  onClick={() => {
                    setShowMenu(false)
                    onDelete(rod)
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
      </div>

      {specs.length > 0 && (
        <dl className="mt-5 grid grid-cols-3 gap-2">
          {specs.map((spec) => (
            <div key={spec.label} className="rounded-xl bg-surface-2 px-3 py-2">
              <dt className="text-[11px] font-medium tracking-wide text-muted uppercase">{spec.label}</dt>
              <dd className="tnum truncate text-sm font-semibold text-ink">{spec.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {rod.description && <p className="mt-4 line-clamp-2 text-sm text-muted">{rod.description}</p>}

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5 text-sm">
        <span className="text-muted">Gevangen met deze hengel</span>
        <span className={`tnum font-semibold ${catchCount > 0 ? 'text-brand' : 'text-muted'}`}>
          {pluralize(catchCount, 'vangst', 'vangsten')}
        </span>
      </div>
    </article>
  )
}
