'use client'

import { useState } from 'react'

export interface Datum {
  label: string
  /** Korte as-tekst; leeg = geen tick. */
  tick?: string
  value: number
}

const niceMax = (max: number): number => {
  if (max <= 4) return 4
  const pow = 10 ** Math.floor(Math.log10(max))
  const step = [1, 2, 4, 6, 8, 10].find((m) => m * pow >= max) ?? 10
  const nice = step * pow
  // Aantallen zijn hele getallen: zorg dat ook de middelste hulplijn dat is.
  return nice % 2 === 0 ? nice : nice + 1
}

/**
 * Kolommendiagram met één reeks. Dunne kolommen met ronde bovenkant, rustige
 * hulplijnen, tooltip bij hover/focus en een tabel voor schermlezers.
 */
export const ColumnChart = ({ data, unit, caption }: { data: Datum[]; unit: [string, string]; caption: string }) => {
  const [active, setActive] = useState<number | null>(null)
  const max = niceMax(Math.max(...data.map((d) => d.value), 0))
  const ticks = [max, max / 2, 0]
  const peak = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0)
  const hasData = data.some((d) => d.value > 0)

  return (
    <figure>
      <div className="flex gap-3" aria-hidden="true">
        <div className="tnum flex h-44 flex-col justify-between py-0 text-right text-[11px] leading-none text-muted">
          {ticks.map((t) => (
            <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">{t}</span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-44" onMouseLeave={() => setActive(null)}>
            {ticks.map((t, i) => (
              <div key={t} className="absolute inset-x-0 h-px bg-line" style={{ top: `${(i / (ticks.length - 1)) * 100}%` }} />
            ))}
            <div className="absolute inset-0 flex items-end">
              {data.map((d, i) => (
                <button
                  key={d.label}
                  type="button"
                  tabIndex={-1}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive(i)}
                  className="group relative flex h-full flex-1 cursor-default items-end justify-center focus-visible:outline-none"
                >
                  {active === i && <span className="absolute inset-y-0 w-full rounded-md bg-ink/5" />}
                  <span
                    className={`relative w-full max-w-6 rounded-t-[4px] bg-brand transition-[height,opacity] duration-500 ${
                      active !== null && active !== i ? 'opacity-45' : ''
                    }`}
                    style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 3 : 0, marginInline: 1 }}
                  >
                    {hasData && i === peak && active === null && (
                      <span className="tnum absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-ink">{d.value}</span>
                    )}
                  </span>
                  {active === i && (
                    <span
                      className={`pointer-events-none absolute bottom-full z-10 mb-1 rounded-lg bg-deep px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lift ${
                        i < data.length / 4 ? 'left-0' : i > (data.length * 3) / 4 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                      }`}
                      style={{ bottom: `${Math.max((d.value / max) * 100, 2)}%` }}
                    >
                      <strong className="tnum font-semibold">{d.value}</strong> {d.value === 1 ? unit[0] : unit[1]}
                      <span className="text-white/65"> · {d.label}</span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 flex text-[11px] text-muted">
            {data.map((d) => (
              <span key={d.label} className="flex-1 overflow-visible text-center whitespace-nowrap">{d.tick ?? ''}</span>
            ))}
          </div>
        </div>
      </div>
      <table className="sr-only">
        <caption>{caption}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

/** Gerangschikte horizontale balken met de waarde aan het eind. */
export const BarList = ({
  data,
  format = (v) => String(v),
  ranked = false,
}: {
  data: { label: string; value: number; sub?: string }[]
  format?: (value: number) => string
  ranked?: boolean
}) => {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <ol className="space-y-3.5">
      {data.map((d, i) => (
        <li key={d.label} className="flex items-center gap-3">
          {ranked && (
            <span className="tnum inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-muted">
              {i + 1}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-medium text-ink">{d.label}</span>
              <span className="tnum shrink-0 text-sm text-muted">
                <strong className="font-semibold text-ink">{format(d.value)}</strong>
                {d.sub ? ` · ${d.sub}` : ''}
              </span>
            </div>
            <div className="mt-1.5 h-2 rounded-r-[4px] bg-surface-2">
              <div
                className="h-full rounded-r-[4px] bg-brand transition-[width] duration-700"
                style={{ width: `${Math.max((d.value / max) * 100, 1.5)}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
